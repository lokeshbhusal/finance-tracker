import { Component, OnInit, inject, signal, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Timestamp } from '@angular/fire/firestore';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction, ALL_CATEGORIES } from '../../core/models/transaction.model';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  displayedColumns = ['icon', 'description', 'category', 'date', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Transaction>([]);
  categories = ALL_CATEGORIES;

  searchText = '';
  typeFilter = '';
  categoryFilter = '';

  ngOnInit(): void {
    this.transactionService.getTransactions().subscribe(txs => {
      this.dataSource.data = txs;
      this.dataSource.filterPredicate = this.createFilter();
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    const filter = JSON.stringify({
      search: this.searchText.trim().toLowerCase(),
      type: this.typeFilter,
      category: this.categoryFilter
    });
    this.dataSource.filter = filter;
  }

  private createFilter(): (tx: Transaction, filter: string) => boolean {
    return (tx: Transaction, filter: string) => {
      const f = JSON.parse(filter) as { search: string; type: string; category: string };
      const matchSearch = !f.search ||
        tx.description.toLowerCase().includes(f.search) ||
        tx.category.toLowerCase().includes(f.search);
      const matchType = !f.type || tx.type === f.type;
      const matchCategory = !f.category || tx.category === f.category;
      return matchSearch && matchType && matchCategory;
    };
  }

  openAddDialog(): void {
    const ref = this.dialog.open(TransactionFormComponent, { width: '500px', disableClose: false });
    ref.afterClosed().subscribe(result => {
      if (result) this.snackBar.open('Transaction added!', 'Close', { duration: 3000 });
    });
  }

  openEditDialog(tx: Transaction): void {
    const ref = this.dialog.open(TransactionFormComponent, {
      width: '500px',
      data: tx,
      disableClose: false
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.snackBar.open('Transaction updated!', 'Close', { duration: 3000 });
    });
  }

  async deleteTransaction(tx: Transaction): Promise<void> {
    if (!tx.id) return;
    if (!confirm(`Delete "${tx.description}"?`)) return;
    try {
      await this.transactionService.deleteTransaction(tx.id);
      this.snackBar.open('Transaction deleted.', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete transaction.', 'Close', { duration: 3000 });
    }
  }

  formatDate(date: Timestamp | Date): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date as unknown as string);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
