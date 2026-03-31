import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  hidePassword = signal(true);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async login(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      const { email, password } = this.form.value;
      await this.authService.login(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      this.snackBar.open(this.getFriendlyError(message), 'Close', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  async googleSignIn(): Promise<void> {
    this.loading.set(true);
    try {
      await this.authService.googleSignIn();
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      this.snackBar.open(this.getFriendlyError(message), 'Close', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  private getFriendlyError(message: string): string {
    if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential')) {
      return 'Invalid email or password.';
    }
    if (message.includes('too-many-requests')) {
      return 'Too many failed attempts. Please try again later.';
    }
    return 'An error occurred. Please try again.';
  }
}
