import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from './core/services/auth.service';
import { User } from '@angular/fire/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  currentUser = signal<User | null>(null);
  isHandset = signal(false);
  isAuthPage = signal(false);

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Transactions', icon: 'receipt_long', route: '/transactions' },
    { label: 'Budget', icon: 'account_balance_wallet', route: '/budget' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports' },
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });

    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isHandset.set(result.matches);
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isAuthPage.set(this.router.url.includes('/auth'));
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    if (user.displayName) {
      return user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email?.[0].toUpperCase() ?? 'U';
  }
}
