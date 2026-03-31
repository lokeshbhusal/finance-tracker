import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  hidePassword = signal(true);
  hideConfirm = signal(true);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  async register(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      const { email, password } = this.form.value;
      await this.authService.register(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
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
    if (message.includes('email-already-in-use')) {
      return 'This email is already registered. Please sign in.';
    }
    if (message.includes('weak-password')) {
      return 'Password is too weak. Use at least 6 characters.';
    }
    return 'An error occurred. Please try again.';
  }
}
