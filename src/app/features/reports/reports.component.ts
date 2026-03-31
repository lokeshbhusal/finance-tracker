import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { Timestamp } from '@angular/fire/firestore';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';

Chart.register(...registerables);

interface MonthlySummary {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(true);
  monthlySummaries = signal<MonthlySummary[]>([]);
  displayedColumns = ['month', 'income', 'expenses', 'savings', 'savingsRate'];

  barChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  pieChartData = signal<ChartData<'pie'>>({ labels: [], datasets: [] });

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '$' + v } }
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
    }
  };

  barChartType: ChartType = 'bar';
  pieChartType: ChartType = 'pie';

  ngOnInit(): void {
    this.transactionService.getTransactions().subscribe(transactions => {
      this.computeReports(transactions);
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  private computeReports(transactions: Transaction[]): void {
    const summaries: MonthlySummary[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      const monthTxs = transactions.filter(t => this.getMonthKey(t.date) === key);
      const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const savings = income - expenses;
      const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

      summaries.push({ month: key, label, income, expenses, savings, savingsRate });
    }

    this.monthlySummaries.set(summaries);

    // Bar chart
    this.barChartData.set({
      labels: summaries.map(s => s.label),
      datasets: [
        { label: 'Income', data: summaries.map(s => s.income), backgroundColor: 'rgba(76,175,80,0.7)', borderColor: '#4caf50', borderWidth: 1 },
        { label: 'Expenses', data: summaries.map(s => s.expenses), backgroundColor: 'rgba(244,67,54,0.7)', borderColor: '#f44336', borderWidth: 1 }
      ]
    });

    // Pie chart for all-time expense categories
    const categoryMap = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + t.amount);
    });

    const sortedCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const colors = ['#4527a0','#7b1fa2','#1976d2','#0097a7','#388e3c','#f57c00','#e64a19','#5d4037'];

    this.pieChartData.set({
      labels: sortedCategories.map(([cat]) => cat),
      datasets: [{
        data: sortedCategories.map(([, val]) => val),
        backgroundColor: colors.slice(0, sortedCategories.length),
        hoverOffset: 6
      }]
    });
  }

  private getMonthKey(date: Timestamp | Date): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date as unknown as string);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
