import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  WithFieldValue,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private getUserTransactionsRef() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    return collection(this.firestore, `users/${userId}/transactions`);
  }

  getTransactions(): Observable<Transaction[]> {
    const ref = this.getUserTransactionsRef();
    const q = query(ref, orderBy('date', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Transaction[]>;
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> {
    const ref = this.getUserTransactionsRef();
    await addDoc(ref, {
      ...transaction,
      createdAt: Timestamp.now()
    } as WithFieldValue<DocumentData>);
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const docRef = doc(this.firestore, `users/${userId}/transactions/${id}`);
    await updateDoc(docRef, transaction as WithFieldValue<DocumentData>);
  }

  async deleteTransaction(id: string): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const docRef = doc(this.firestore, `users/${userId}/transactions/${id}`);
    await deleteDoc(docRef);
  }
}