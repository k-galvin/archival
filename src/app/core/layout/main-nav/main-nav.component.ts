import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ArchiveService } from '../../services/archive.service';

/**
 * MainNavComponent handles primary navigation across the archival platform.
 * Features include:
 * - Dynamic navigation link list
 * - User authentication state management (via ArchiveService)
 * - Mobile responsive menu toggle
 */
@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
})
export class MainNavComponent {
  /** Service for archive data access and user session status. */
  archive = inject(ArchiveService);
  /** Reactive signal tracking current user session state. */
  user = this.archive.user;
  /** UI state for the mobile/hamburger menu. */
  isMenuOpen = false;

  /** Master list of application navigation routes and their labels. */
  navLinks = [
    { path: '/gallery', label: 'gallery' },
    { path: '/collections', label: 'collections' },
    { path: '/blueprint', label: 'blueprint' },
    { path: '/insights', label: 'insights' },
    { path: '/chronology', label: 'chronology' },
  ];

  /** Clears the current user session via ArchiveService. */
  logout(): void {
    this.archive.signOut();
  }

  /** Toggles the mobile menu open/closed state. */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /** Forces the mobile menu to a closed state. */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
