import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ArchiveService } from '../../services/archive.service';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
})
export class MainNavComponent {
  // Inject the ArchiveService to handle user authentication state
  archive = inject(ArchiveService);
  user = this.archive.user;

  // Navigation configuration
  navLinks = [
    { path: '/gallery', label: 'gallery' },
    { path: '/collections', label: 'collections' },
    { path: '/map', label: 'map' },
    { path: '/insights', label: 'insights' },
    { path: '/chronology', label: 'chronology' },
  ];

  logout(): void {
    this.archive.user.set(null);
  }
}
