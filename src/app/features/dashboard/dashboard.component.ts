import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    CurrencyPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(true);
  transactions = signal<Transaction[]>([]);
  monthlyIncome = signal(0);
  monthlyExpenses = signal(0);
  balance = signal(0);
  savingsRate = signal(0);
  recentTransactions = signal<Transaction[]>([]);

  lineChartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  doughnutChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '$' + v } }
    }
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
    }
  };

  readonly lineChartType = 'line' as const;
  readonly doughnutChartType = 'doughnut' as const;

  ngOnInit(): void {
    this.transactionService.getTransactions().subscribe(transactions => {
      this.transactions.set(transactions);
      this.computeSummary(transactions);
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  private computeSummary(transactions: Transaction[]): void {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthlyTxs = transactions.filter(t => {
      const date = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date as unknown as string);
      const txMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return txMonth === currentMonth;
    });

    const income = monthlyTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalBalance = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    this.monthlyIncome.set(income);
    this.monthlyExpenses.set(expenses);
    this.balance.set(totalBalance);
    this.savingsRate.set(income > 0 ? Math.round(((income - expenses) / income) * 100) : 0);
    this.recentTransactions.set(transactions.slice(0, 5));

    this.computeLineChart(transactions);
    this.computeDoughnutChart(monthlyTxs);
  }

  private computeLineChart(transactions: Transaction[]): void {
    const months: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(label);

      const inc = transactions
        .filter(t => t.type === 'income' && this.getMonthKey(t.date) === key)
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter(t => t.type === 'expense' && this.getMonthKey(t.date) === key)
        .reduce((s, t) => s + t.amount, 0);

      incomeData.push(inc);
      expenseData.push(exp);
    }

    this.lineChartData.set({
      labels: months,
      datasets: [
        { label: 'Income', data: incomeData, borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.1)', fill: true, tension: 0.4 },
        { label: 'Expenses', data: expenseData, borderColor: '#f44336', backgroundColor: 'rgba(244,67,54,0.1)', fill: true, tension: 0.4 }
      ]
    });
  }

  private computeDoughnutChart(transactions: Transaction[]): void {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();
    expenses.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + t.amount);
    });

    const labels = Array.from(categoryMap.keys());
    const data = Array.from(categoryMap.values());
    const colors = ['#4527a0','#7b1fa2','#1976d2','#0097a7','#388e3c','#f57c00','#e64a19','#5d4037','#455a64','#c2185b','#fbc02d'];

    this.doughnutChartData.set({
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        hoverOffset: 8
      }]
    });
  }

  private getMonthKey(date: Timestamp | Date): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date as unknown as string);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  formatDate(date: Timestamp | Date): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date as unknown as string);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  }

  getCurrentMonthName(): string {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}