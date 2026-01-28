import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chronology.component.html',
  styleUrl: './chronology.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChronologyComponent {
  private archive = inject(ArchiveService);

  // Local UI State for scaling the temporal rail
  zoom = signal(1);

  // Reference the global collection and sort it chronologically
  collection = this.archive.collection;

  sortedCollection = computed(() => {
    return [...this.collection()].sort((a, b) => (a.year || 0) - (b.year || 0));
  });

  // Define the temporal bounds of the archive
  readonly START_YEAR = 1920;
  readonly END_YEAR = 2030;
  readonly TOTAL_YEARS = this.END_YEAR - this.START_YEAR;

  // Static markers for the rail background
  decadeMarkers = [1920, 1940, 1960, 1980, 2000, 2020];

  /**
   * Calculates the horizontal percentage position of a year on the rail
   */
  getTimelinePos(year: string | number): number {
    const yr = typeof year === 'string' ? parseInt(year) : year;
    if (isNaN(yr)) return 0;
    return ((yr - this.START_YEAR) / this.TOTAL_YEARS) * 100;
  }

  zoomIn(): void {
    this.zoom.update((v) => Math.min(4, v + 0.5));
  }

  zoomOut(): void {
    this.zoom.update((v) => Math.max(1, v - 0.5));
  }
}
