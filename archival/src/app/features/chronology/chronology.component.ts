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

  private collection = this.archive.collection;

  private sortedCollection = computed(() => {
    return [...this.collection()].sort((a, b) => (a.year || 0) - (b.year || 0));
  });

  // Group items by year to handle multiple items in the same year
  groupedByYear = computed(() => {
    const groups: { year: number; items: any[] }[] = [];
    const yearMap = new Map<number, any[]>();

    for (const item of this.sortedCollection()) {
      if (!yearMap.has(item.year)) {
        yearMap.set(item.year, []);
      }
      yearMap.get(item.year)!.push(item);
    }

    yearMap.forEach((items, year) => {
      groups.push({ year, items });
    });

    return groups;
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
