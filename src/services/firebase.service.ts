import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { db, storage, auth, isFirebaseConfigured, firebaseConfig } from '@/lib/firebase';

export class FirebaseService {
  private static instance: FirebaseService;

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  get isConfigured(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  get projectId(): string {
    return firebaseConfig.projectId;
  }

  // ---------------------------------------------------------------------------
  // Firestore Document & Collection Operations
  // ---------------------------------------------------------------------------

  async saveDocument<T extends Record<string, any>>(
    collectionName: string,
    docId: string,
    data: T
  ): Promise<boolean> {
    if (!this.isConfigured || !db) return false;
    try {
      const docRef = doc(db, collectionName, docId);
      // Clean undefined values to prevent Firestore rejection
      const sanitized = JSON.parse(JSON.stringify(data));
      sanitized._updatedAt = new Date().toISOString();
      await setDoc(docRef, sanitized, { merge: true });
      return true;
    } catch (err: any) {
      console.warn(`[Firebase] Firestore write to ${collectionName}/${docId} deferred:`, err.message || err);
      return false;
    }
  }

  async getDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
    if (!this.isConfigured || !db) return null;
    try {
      const docRef = doc(db, collectionName, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as T;
      }
      return null;
    } catch (err: any) {
      console.warn(`[Firebase] Firestore read from ${collectionName}/${docId} failed:`, err.message || err);
      return null;
    }
  }

  async getCollection<T = any>(collectionName: string): Promise<T[]> {
    if (!this.isConfigured || !db) return [];
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
    } catch (err: any) {
      console.warn(`[Firebase] Firestore read collection ${collectionName} failed:`, err.message || err);
      return [];
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    if (!this.isConfigured || !db) return false;
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (err: any) {
      console.warn(`[Firebase] Firestore delete ${collectionName}/${docId} failed:`, err.message || err);
      return false;
    }
  }

  subscribeCollection<T = any>(
    collectionName: string,
    onData: (items: T[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe | null {
    if (!this.isConfigured || !db) return null;
    try {
      const colRef = collection(db, collectionName);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
          onData(items);
        },
        (error) => {
          console.warn(`[Firebase] Subscription to ${collectionName} error:`, error.message);
          if (onError) onError(error);
        }
      );
    } catch (err: any) {
      console.warn(`[Firebase] Setup subscription ${collectionName} failed:`, err.message);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Firebase Cloud Storage (Images, Documents, Orthomosaics)
  // ---------------------------------------------------------------------------

  async uploadFile(
    storagePath: string,
    file: File | Blob,
    contentType?: string
  ): Promise<string | null> {
    if (!isFirebaseConfigured || !storage) return null;
    try {
      const storageRef = ref(storage, storagePath);
      const metadata = contentType ? { contentType } : undefined;
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err: any) {
      console.warn(`[Firebase] Storage upload to ${storagePath} failed:`, err.message || err);
      return null;
    }
  }

  async uploadDataUrl(
    storagePath: string,
    dataUrl: string
  ): Promise<string | null> {
    if (!isFirebaseConfigured || !storage) return null;
    try {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err: any) {
      console.warn(`[Firebase] Storage uploadDataUrl to ${storagePath} failed:`, err.message || err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Firebase Authentication
  // ---------------------------------------------------------------------------

  async signIn(email: string, password: string): Promise<User | null> {
    if (!isFirebaseConfigured || !auth) return null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      console.warn(`[Firebase] Auth signIn for ${email} failed:`, err.message);
      throw err;
    }
  }

  async signUp(email: string, password: string): Promise<User | null> {
    if (!isFirebaseConfigured || !auth) return null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      console.warn(`[Firebase] Auth signUp for ${email} failed:`, err.message);
      throw err;
    }
  }

  async signOutUser(): Promise<void> {
    if (!isFirebaseConfigured || !auth) return;
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('[Firebase] Auth signOut failed:', err.message);
    }
  }

  onAuthChanged(callback: (user: User | null) => void): Unsubscribe | null {
    if (!isFirebaseConfigured || !auth) return null;
    return onAuthStateChanged(auth, callback);
  }

  // ---------------------------------------------------------------------------
  // Background Sync Helper
  // ---------------------------------------------------------------------------

  async syncApplicationState(appData: any, propertyData: any): Promise<void> {
    if (!this.isConfigured) return;
    try {
      if (appData && appData.id) {
        await this.saveDocument('registration_applications', appData.id, appData);
      }
      if (propertyData && propertyData.id) {
        await this.saveDocument('properties', propertyData.id, propertyData);
      }
    } catch (err) {
      // Non-blocking sync
    }
  }
}

export const firebaseService = FirebaseService.getInstance();

