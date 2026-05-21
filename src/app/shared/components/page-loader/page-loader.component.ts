import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PageLoaderComponent displays a full-screen loading overlay.
 * Used to indicate background data fetching or state transitions.
 */
@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.scss',
})
export class PageLoaderComponent {
  /** Whether the loading overlay should be visible. */
  @Input() isLoading = false;
  /** Optional message displayed below the loading animation. */
  @Input() loadingText = 'Loading';
}
