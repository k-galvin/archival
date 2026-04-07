import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * LandingComponent
 * Displays the initial marketing or welcome screen and provides navigation
 * to the authentication flow.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private router = inject(Router);

  /**
   * Redirects the user to the authentication page.
   */
  navigateToAuth() {
    this.router.navigate(['/auth']);
  }
}
