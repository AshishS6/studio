
'use server';
import { db } from '@/lib/firebase';
import type { DSA } from '@/types';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const dsaCollectionRef = collection(db, 'dsas');

export async function getDSAs(): Promise<DSA[]> {
  try {
    const snapshot = await getDocs(dsaCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DSA));
  } catch (error) {
    console.error("Error fetching DSAs: ", error);
    return [];
  }
}

export async function getDSAById(id: string): Promise<DSA | null> {
  try {
    const docRef = doc(db, 'dsas', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DSA;
    }
    return null;
  } catch (error) {
    console.error("Error fetching DSA by ID: ", error);
    return null;
  }
}

export async function addDSA(dsaData: Omit<DSA, 'id' | 'activeLinks' | 'signups'>): Promise<DSA | null> {
  try {
    const newDSA = {
      ...dsaData,
      activeLinks: 0, // Initialize with 0
      signups: 0, // Initialize with 0
      status: dsaData.status || 'Active', // Default status
    };
    const docRef = await addDoc(dsaCollectionRef, newDSA);
    return { id: docRef.id, ...newDSA };
  } catch (error) {
    console.error("Error adding DSA: ", error);
    return null;
  }
}

export async function updateDSA(id: string, dsaData: Partial<Omit<DSA, 'id'>>): Promise<boolean> {
  try {
    const docRef = doc(db, 'dsas', id);
    await updateDoc(docRef, dsaData);
    return true;
  } catch (error) {
    console.error("Error updating DSA: ", error);
    return false;
  }
}

export async function deleteDSA(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'dsas', id);
    await deleteDoc(docRef);
    // Note: You might want to handle related referral links here as well
    return true;
  } catch (error) {
    console.error("Error deleting DSA: ", error);
    return false;
  }
}
