
'use server';
import { db } from '@/lib/firebase';
import type { ReferralLink, DSA } from '@/types';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, runTransaction } from 'firebase/firestore';
import { getDSAById } from './dsaService'; // Assuming this function exists and works
import { getProductById } from './productService'; // Assuming this function exists and works

const referralLinksCollectionRef = collection(db, 'referralLinks');
const dsaCollectionRef = collection(db, 'dsas');

export async function getReferralLinks(): Promise<ReferralLink[]> {
  try {
    const snapshot = await getDocs(referralLinksCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReferralLink));
  } catch (error) {
    console.error("Error fetching referral links: ", error);
    return [];
  }
}

export async function getReferralLinkById(id: string): Promise<ReferralLink | null> {
  try {
    const docRef = doc(db, 'referralLinks', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ReferralLink;
    }
    return null;
  } catch (error) {
    console.error("Error fetching referral link by ID: ", error);
    return null;
  }
}

export async function getReferralLinksByDSA(dsaId: string): Promise<ReferralLink[]> {
  try {
    const q = query(referralLinksCollectionRef, where("dsaId", "==", dsaId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReferralLink));
  } catch (error) {
    console.error("Error fetching referral links by DSA ID: ", error);
    return [];
  }
}

export async function addReferralLink(linkData: Omit<ReferralLink, 'id' | 'clicks' | 'signups' | 'conversionRate' | 'creationDate' | 'dsaName' | 'productName' | 'link'> & { dsaId: string; productId: string; code: string }): Promise<ReferralLink | null> {
  try {
    // Check if code already exists
    const codeQuery = query(referralLinksCollectionRef, where("code", "==", linkData.code.toUpperCase()));
    const codeQuerySnapshot = await getDocs(codeQuery);
    if (!codeQuerySnapshot.empty) {
      console.error("Referral code already exists:", linkData.code);
      // Consider throwing a specific error or returning a flag
      return null; 
    }

    const dsa = await getDSAById(linkData.dsaId);
    const product = await getProductById(linkData.productId);

    if (!dsa || !product) {
      console.error("DSA or Product not found for new referral link");
      return null;
    }

    const newLinkObject: Omit<ReferralLink, 'id'> = {
      ...linkData,
      code: linkData.code.toUpperCase(),
      dsaName: dsa.name,
      productName: product.name,
      clicks: 0,
      signups: 0,
      conversionRate: '0.00%',
      creationDate: new Date().toISOString(),
      link: `https://example.com/refer/${linkData.code.toUpperCase()}` // Ensure consistent case for link
    };
    
    const dsaRef = doc(dsaCollectionRef, linkData.dsaId);

    // Use a transaction to ensure atomicity when creating link and updating DSA
    const newDocRef = await runTransaction(db, async (transaction) => {
      const dsaDoc = await transaction.get(dsaRef);
      if (!dsaDoc.exists()) {
        throw "DSA document does not exist!";
      }
      const currentActiveLinks = (dsaDoc.data() as DSA).activeLinks || 0;
      transaction.update(dsaRef, { activeLinks: currentActiveLinks + 1 });
      
      // Create the new referral link document within the transaction
      // Firestore auto-generates an ID if you use addDoc.
      // To use a transaction for creating a new document, you typically generate a new doc ref first.
      const tempNewLinkRef = doc(collection(db, 'referralLinks')); // Get a new doc reference
      transaction.set(tempNewLinkRef, newLinkObject);
      return tempNewLinkRef; // Return the reference to the newly created link
    });

    return { id: newDocRef.id, ...newLinkObject };

  } catch (error) {
    console.error("Error adding referral link: ", error);
    return null;
  }
}

export async function updateReferralLink(id: string, linkData: Partial<Omit<ReferralLink, 'id'>>): Promise<boolean> {
  try {
    const linkRef = doc(referralLinksCollectionRef, id);
    
    await runTransaction(db, async (transaction) => {
      const linkDoc = await transaction.get(linkRef);
      if (!linkDoc.exists()) {
        throw "ReferralLink document does not exist!";
      }

      const currentLinkData = linkDoc.data() as ReferralLink;
      const updatedData = { ...linkData };

      // Recalculate conversion rate if clicks/signups changed
      const newClicks = linkData.clicks !== undefined ? linkData.clicks : currentLinkData.clicks;
      const newSignups = linkData.signups !== undefined ? linkData.signups : currentLinkData.signups;

      if (linkData.clicks !== undefined || linkData.signups !== undefined) {
        updatedData.conversionRate = newClicks > 0 ? ((newSignups / newClicks) * 100).toFixed(2) + '%' : '0.00%';
      }
      
      transaction.update(linkRef, updatedData);

      // If signups changed, update the DSA's total signups
      if (linkData.signups !== undefined && linkData.signups !== currentLinkData.signups && currentLinkData.dsaId) {
        const dsaRef = doc(dsaCollectionRef, currentLinkData.dsaId);
        const dsaDoc = await transaction.get(dsaRef);
        if (dsaDoc.exists()) {
          // To correctly update total signups, we need all links for that DSA
          // This is complex within a single transaction without reading all links first.
          // A simpler approach for now is to recalculate outside or use FieldValue.increment if applicable.
          // For robustness, one might fetch all links for the DSA, sum signups, then update.
          // Here's a simplified (potentially slightly racy without full recalculation) update:
          const dsaData = dsaDoc.data() as DSA;
          const oldLinkSignups = currentLinkData.signups;
          const newLinkSignups = newSignups;
          const signupDifference = newLinkSignups - oldLinkSignups;
          const dsaTotalSignups = (dsaData.signups || 0) + signupDifference;
          transaction.update(dsaRef, { signups: dsaTotalSignups });
        }
      }
    });
    return true;
  } catch (error) {
    console.error("Error updating referral link: ", error);
    return false;
  }
}

export async function deleteReferralLink(id: string): Promise<boolean> {
  try {
    const linkRef = doc(referralLinksCollectionRef, id);

    await runTransaction(db, async (transaction) => {
      const linkDoc = await transaction.get(linkRef);
      if (!linkDoc.exists()) {
        // If already deleted or never existed, consider it a success for idempotency
        console.warn(`Referral link ${id} not found for deletion, might have been already deleted.`);
        return; 
      }
      const linkToDelete = linkDoc.data() as ReferralLink;

      transaction.delete(linkRef);

      // Update DSA's activeLinks count and potentially signups
      if (linkToDelete.dsaId) {
        const dsaRef = doc(dsaCollectionRef, linkToDelete.dsaId);
        const dsaDoc = await transaction.get(dsaRef);
        if (dsaDoc.exists()) {
          const dsaData = dsaDoc.data() as DSA;
          const newActiveLinks = Math.max(0, (dsaData.activeLinks || 0) - 1);
          // When deleting a link, also subtract its signups from the DSA's total
          const newSignups = Math.max(0, (dsaData.signups || 0) - (linkToDelete.signups || 0));
          transaction.update(dsaRef, {
            activeLinks: newActiveLinks,
            signups: newSignups
          });
        }
      }
    });
    return true;
  } catch (error) {
    console.error("Error deleting referral link: ", error);
    return false;
  }
}

// Function to simulate a click on a referral link
export async function recordLinkClick(linkCode: string): Promise<boolean> {
  try {
    const q = query(referralLinksCollectionRef, where("code", "==", linkCode.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.warn("Link code not found for click:", linkCode);
      return false;
    }
    const linkDoc = snapshot.docs[0];
    const linkId = linkDoc.id;
    const currentClicks = (linkDoc.data() as ReferralLink).clicks || 0;
    
    // We directly call updateReferralLink which handles transaction and conversion rate.
    return await updateReferralLink(linkId, { clicks: currentClicks + 1 });

  } catch (error) {
    console.error("Error recording link click:", error);
    return false;
  }
}

// Function to simulate a signup via a referral link
export async function recordLinkSignup(linkCode: string): Promise<boolean> {
    try {
    const q = query(referralLinksCollectionRef, where("code", "==", linkCode.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.warn("Link code not found for signup:", linkCode);
      return false;
    }
    const linkDocSnapshot = snapshot.docs[0];
    const linkId = linkDocSnapshot.id;
    const currentSignups = (linkDocSnapshot.data() as ReferralLink).signups || 0;

    // We directly call updateReferralLink which handles transaction, conversion rate, and DSA total signups.
    return await updateReferralLink(linkId, { signups: currentSignups + 1 });

  } catch (error) {
    console.error("Error recording link signup:", error);
    return false;
  }
}
