/**
 * Manages user authentication, including login and registration flows.
 */

import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ArchiveService } from '../../core/services/archive.service';

/**
 * AuthComponent
 * Provides the user interface for authenticating with the archive system.
 * Handles both existing user login and new user registration via Supabase.
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  /** Reference to the global ArchiveService for auth operations. */
  public archive = inject(ArchiveService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // UI State Signals
  /** Signal indicating whether the component is in 'Login' mode (true) or 'Register' mode (false). */
  isLogin = signal(true);

  /** Signal indicating whether an authentication request is currently in flight. */
  isSubmitting = signal(false);

  /** Signal containing a success message to display to the user (e.g., after registration). */
  successMessage = signal<string | null>(null);

  /** Reference to the global authentication error signal from the ArchiveService. */
  errorMessage = this.archive.authError;

  /** Reactive form group for authentication. */
  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: [''],
  });

  constructor() {
    // Effect to synchronize the form's disabled state with the global logging-in status.
    // Prevents the 'disabled' attribute warning by using the Reactive Forms API.
    effect(() => {
      if (this.archive.isLoggingIn()) {
        this.authForm.disable();
      } else {
        this.authForm.enable();
      }
    });
  }

  /**
...
   * Toggles between Login and Registration modes.
   * Resets status messages and errors on switch.
   */
  toggleMode(): void {
    this.isLogin.update((v) => !v);
    this.successMessage.set(null);
    this.archive.authError.set(null);

    const nameControl = this.authForm.get('name');
    if (this.isLogin()) {
      nameControl?.clearValidators();
    } else {
      nameControl?.setValidators([Validators.required]);
    }
    nameControl?.updateValueAndValidity();
  }

  /**
   * Handles the authentication form submission.
   * Orchestrates sign-in or sign-up via the ArchiveService and manages post-auth navigation.
   * @returns A promise that resolves when the operation is complete.
   */
  async handleSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password, name } = this.authForm.value;

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

        // Root Fix for "Not Reflected in Supabase":
        // If Supabase has 'Email Confirmation' enabled (default), result.session
        // will be null and the user won't be fully "signed in" until confirmed.
        if (result.user && !result.session) {
          this.successMessage.set(
            'Registration successful. Please check your email inbox to confirm your account before logging in.',
          );
          this.isLogin.set(true); // Switch to login so they can sign in after confirming
          this.authForm.get('name')?.clearValidators();
          this.authForm.get('name')?.updateValueAndValidity();
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
