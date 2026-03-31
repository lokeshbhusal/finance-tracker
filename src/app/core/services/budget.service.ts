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
  where,
  WithFieldValue,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Budget } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private getUserBudgetsRef() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    return collection(this.firestore, `users/${userId}/budgets`);
  }

  getBudgets(month?: string): Observable<Budget[]> {
    const ref = this.getUserBudgetsRef();
    const q = month
      ? query(ref, where('month', '==', month))
      : query(ref);
    return collectionData(q, { idField: 'id' }) as Observable<Budget[]>;
  }

  async setBudget(budget: Omit<Budget, 'id'>): Promise<void> {
    const ref = this.getUserBudgetsRef();
    await addDoc(ref, budget as WithFieldValue<DocumentData>);
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const docRef = doc(this.firestore, `users/${userId}/budgets/${id}`);
    await updateDoc(docRef, data as WithFieldValue<DocumentData>);
  }

  async deleteBudget(id: string): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const docRef = doc(this.firestore, `users/${userId}/budgets/${id}`);
    await deleteDoc(docRef);
  }
}