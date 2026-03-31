import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  signOut,
  authState,
  User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  currentUser$: Observable<User | null> = authState(this.auth);

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string): Promise<void> {
    // Check if email already exists before registering
    const methods = await fetchSignInMethodsForEmail(this.auth, email);
    if (methods.length > 0) {
      if (methods.includes('google.com')) {
        throw new Error('This email is already registered with Google Sign-In. Please use "Sign in with Google".');
      } else {
        throw new Error('This email is already registered. Please sign in instead.');
      }
    }
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error: unknown) {
      // If the email already exists with email/password, tell the user
      if (
        error instanceof Error &&
        (error.message.includes('account-exists-with-different-credential') ||
          error.message.includes('auth/account-exists-with-different-credential'))
      ) {
        throw new Error(
          'This email is already registered with email & password. Please sign in with your password instead.'
        );
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}