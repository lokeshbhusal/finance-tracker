import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Timestamp } from '@angular/fire/firestore';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss'
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private dialogRef = inject(MatDialogRef<TransactionFormComponent>);
  data: Transaction | null = inject(MAT_DIALOG_DATA, { optional: true });

  loading = signal(false);
  categories = signal<string[]>(EXPENSE_CATEGORIES);
  isEdit = signal(false);

  form = this.fb.group({
    type: ['expense', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(100)]],
    date: [new Date(), Validators.required]
  });

  ngOnInit(): void {
    if (this.data) {
      this.isEdit.set(true);
      const date = this.data.date instanceof Timestamp
        ? this.data.date.toDate()
        : new Date(this.data.date as unknown as string);
      this.form.patchValue({
        type: this.data.type,
        amount: this.data.amount,
        category: this.data.category,
        description: this.data.description,
        date
      });
      this.updateCategories(this.data.type);
    }

    this.form.get('type')!.valueChanges.subscribe(type => {
      this.updateCategories(type ?? 'expense');
      this.form.get('category')!.setValue('');
    });
  }

  private updateCategories(type: string): void {
    this.categories.set(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      const { type, amount, category, description, date } = this.form.value;
      const txDate = Timestamp.fromDate(date instanceof Date ? date : new Date(date as unknown as string));

      if (this.isEdit() && this.data?.id) {
        await this.transactionService.updateTransaction(this.data.id, {
          type: type as 'income' | 'expense',
          amount: amount!,
          category: category!,
          description: description!,
          date: txDate
        });
      } else {
        await this.transactionService.addTransaction({
          type: type as 'income' | 'expense',
          amount: amount!,
          category: category!,
          description: description!,
          date: txDate
        });
      }
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
