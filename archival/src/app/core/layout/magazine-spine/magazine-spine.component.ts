import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * MagazineSpineComponent renders a vertical, magazine-style sidebar element.
 * Displays current date information as a "publication issue" metadata.
 */
@Component({
  selector: 'app-magazine-spine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magazine-spine.component.html',
  styleUrl: './magazine-spine.component.scss',
})
export class MagazineSpineComponent {
  /** The current month as a zero-padded string (e.g., "05" for May). */
  currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  /** The current full year (e.g., 2024). */
  currentYear = new Date().getFullYear();
}
