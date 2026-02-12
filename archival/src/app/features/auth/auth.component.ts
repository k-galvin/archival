import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArchiveService } from '../../core/services/archive.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  public archive = inject(ArchiveService);
  private router = inject(Router);

  // UI State Signals
  isLogin = signal(true);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  // Bind to the service's error signal for reactive UI updates
  errorMessage = this.archive.authError;

  // Local form state
  authData = {
    email: '',
    password: '',
    name: '',
  };

  /**
   * Toggles between Login and Registration modes.
   * Resets status messages on switch.
   */
  toggleMode(): void {
    this.isLogin.update((v) => !v);
    this.successMessage.set(null);
    this.archive.authError.set(null);
  }

  /**
   * Handles the authentication submission.
   * On registration, handles the "Email Confirmation Required" scenario common in Supabase.
   */
  async handleSubmit(): Promise<void> {
    const { email, password, name } = this.authData;
    if (!email || !password || (!this.isLogin() && !name)) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    try {
      if (this.isLogin()) {
        await this.archive.signIn(email, password);
        // Successful sign-in triggers the ArchiveService.user signal,
        // which automatically fetches data via effect()
        this.router.navigate(['/gallery']);
      } else {
        const result = await this.archive.signUp(email, password, name);

        /**
         * Root Fix for "Not Reflected in Supabase":
         * If Supabase has 'Email Confirmation' enabled (default), result.session
         * will be null and the user won't be fully "signed in" until confirmed.
         */
        if (result.user && !result.session) {
          this.successMessage.set(
            'Registration successful. Please check your email inbox to confirm your account before logging in.',
          );
          this.isLogin.set(true); // Switch to login so they can sign in after confirming
        } else {
          this.router.navigate(['/gallery']);
        }
      }
    } catch (err) {
      // Errors (like 'User already registered') are handled by the signal in ArchiveService
      console.error('Authentication attempt failed:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
