import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { combineLatest } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { BudgetService } from '../../core/services/budget.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Budget, Transaction, EXPENSE_CATEGORIES } from '../../core/models/transaction.model';

interface BudgetWithSpending extends Budget {
  spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

@Component({
  selector: 'app-budget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss'
})
export class BudgetComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private transactionService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(true);
  budgets = signal<BudgetWithSpending[]>([]);
  expenseCategories = EXPENSE_CATEGORIES;
  selectedMonth = signal(this.getCurrentMonth());
  showAddForm = signal(false);
  editingId = signal<string | null>(null);

  addForm = this.fb.group({
    category: ['', Validators.required],
    limit: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  editForm = this.fb.group({
    limit: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    combineLatest([
      this.budgetService.getBudgets(this.selectedMonth()),
      this.transactionService.getTransactions()
    ]).subscribe(([budgets, transactions]) => {
      const monthTxs = transactions.filter(t => {
        const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date as unknown as string);
        return this.getMonthKey(d) === this.selectedMonth() && t.type === 'expense';
      });

      const categorySpending = new Map<string, number>();
      monthTxs.forEach(t => {
        categorySpending.set(t.category, (categorySpending.get(t.category) ?? 0) + t.amount);
      });

      const enriched: BudgetWithSpending[] = budgets.map(b => {
        const spent = categorySpending.get(b.category) ?? 0;
        const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
        return {
          ...b,
          spent,
          percentage,
          status: percentage < 50 ? 'safe' : percentage < 80 ? 'warning' : 'danger'
        };
      });

      this.budgets.set(enriched);
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  onMonthChange(month: string): void {
    this.selectedMonth.set(month);
    this.loadData();
  }

  async addBudget(): Promise<void> {
    if (this.addForm.invalid) return;
    const { category, limit } = this.addForm.value;
    try {
      await this.budgetService.setBudget({
        category: category!,
        limit: limit!,
        month: this.selectedMonth()
      });
      this.addForm.reset();
      this.showAddForm.set(false);
      this.snackBar.open('Budget added!', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to add budget.', 'Close', { duration: 3000 });
    }
  }

  startEdit(budget: BudgetWithSpending): void {
    this.editingId.set(budget.id ?? null);
    this.editForm.patchValue({ limit: budget.limit });
  }

  async saveEdit(budget: BudgetWithSpending): Promise<void> {
    if (this.editForm.invalid || !budget.id) return;
    try {
      await this.budgetService.updateBudget(budget.id, { limit: this.editForm.value.limit! });
      this.editingId.set(null);
      this.snackBar.open('Budget updated!', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to update budget.', 'Close', { duration: 3000 });
    }
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async deleteBudget(budget: BudgetWithSpending): Promise<void> {
    if (!budget.id) return;
    if (!confirm(`Delete budget for "${budget.category}"?`)) return;
    try {
      await this.budgetService.deleteBudget(budget.id);
      this.snackBar.open('Budget deleted.', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete budget.', 'Close', { duration: 3000 });
    }
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getMonthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  getProgressColor(status: string): string {
    return status === 'safe' ? 'primary' : status === 'warning' ? 'accent' : 'warn';
  }
}
