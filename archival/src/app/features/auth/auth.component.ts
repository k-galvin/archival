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
  private archive = inject(ArchiveService);
  private router = inject(Router);

  // UI State
  isLogin = signal(true);

  // Form Data
  authData = {
    email: '',
    password: '',
    name: '',
  };

  /**
   * Toggles between Login and Registration views
   */
  toggleMode(): void {
    this.isLogin.update((v) => !v);
  }

  /**
   * Simulates authentication and updates the global user state
   */
  handleSubmit(): void {
    // Basic validation
    if (!this.authData.email || !this.authData.password) return;

    // In a real app, this would be an API call.
    // Here we update the central signal in the ArchiveService.
    this.archive.user.set({
      name: this.authData.name || 'Senior Archivist',
    });

    // Redirect to the main index after successful authentication
    this.router.navigate(['/gallery']);
  }
}
