
'use server';
import { db } from '@/lib/firebase';
import type { ReferralLink } from '@/types';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getDSAById } from './dsaService';
import { getProductById } from './productService';

const referralLinksCollectionRef = collection(db, 'referralLinks');

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
    const dsa = await getDSAById(linkData.dsaId);
    const product = await getProductById(linkData.productId);

    if (!dsa || !product) {
      console.error("DSA or Product not found for new referral link");
      return null;
    }

    const newLink = {
      ...linkData,
      dsaName: dsa.name,
      productName: product.name,
      clicks: 0,
      signups: 0,
      conversionRate: '0.00%',
      creationDate: new Date().toISOString(),
      link: `https://example.com/refer/${linkData.code}` // Generate a proper link
    };
    const docRef = await addDoc(referralLinksCollectionRef, newLink);
    
    // Update DSA's activeLinks count (simplified)
    await updateDoc(doc(db, 'dsas', linkData.dsaId), {
      activeLinks: (dsa.activeLinks || 0) + 1
    });

    return { id: docRef.id, ...newLink };
  } catch (error) {
    console.error("Error adding referral link: ", error);
    return null;
  }
}

export async function updateReferralLink(id: string, linkData: Partial<Omit<ReferralLink, 'id'>>): Promise<boolean> {
  try {
    const docRef = doc(db, 'referralLinks', id);
    await updateDoc(docRef, linkData);
    // Recalculate conversion rate if clicks/signups changed
    if (linkData.clicks !== undefined || linkData.signups !== undefined) {
        const currentLink = await getReferralLinkById(id);
        if (currentLink) {
            const conversionRate = currentLink.clicks > 0 ? ((currentLink.signups / currentLink.clicks) * 100).toFixed(2) + '%' : '0.00%';
            await updateDoc(docRef, { conversionRate });

            // Update DSA's signups count (simplified)
            if (linkData.signups !== undefined && currentLink.dsaId) {
                 const dsa = await getDSAById(currentLink.dsaId);
                 if (dsa) {
                    const dsaSignups = (await getReferralLinksByDSA(currentLink.dsaId)).reduce((sum, l) => sum + l.signups, 0);
                    await updateDoc(doc(db, 'dsas', currentLink.dsaId), { signups: dsaSignups });
                 }
            }
        }
    }
    return true;
  } catch (error) {
    console.error("Error updating referral link: ", error);
    return false;
  }
}

export async function deleteReferralLink(id: string): Promise<boolean> {
  try {
    const linkToDelete = await getReferralLinkById(id);
    if (!linkToDelete) return false;

    const docRef = doc(db, 'referralLinks', id);
    await deleteDoc(docRef);

    // Update DSA's activeLinks count
    if (linkToDelete.dsaId) {
        const dsa = await getDSAById(linkToDelete.dsaId);
        if (dsa) {
            await updateDoc(doc(db, 'dsas', linkToDelete.dsaId), {
                activeLinks: Math.max(0, (dsa.activeLinks || 0) - 1)
            });
        }
    }
    return true;
  } catch (error)
 {
    console.error("Error deleting referral link: ", error);
    return false;
  }
}
