import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';
import { RouterLink } from '@angular/router';

/**
 * ChronologyComponent
 * Organizes archival items by their production or acquisition year,
 * displaying them in a vertical timeline with proportional spacing.
 */
@Component({
  selector: 'app-chronology',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chronology.component.html',
  styleUrl: './chronology.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChronologyComponent {
  private archive = inject(ArchiveService);

  /** Reference to the global loading state from the ArchiveService. */
  isLoading = this.archive.loading;

  private collection = this.archive.collection;

  /**
   * Internal computed signal that returns the collection sorted chronologically by year.
   */
  private sortedCollection = computed(() => {
    return [...this.collection()].sort((a, b) => (a.year || 0) - (b.year || 0));
  });

  /**
   * Groups items by year to handle multiple items in the same year and calculates gaps between years.
   */
  groupedByYear = computed(() => {
    const groups: { year: number; items: CollectionItem[]; gap: number }[] = [];
    const yearMap = new Map<number, CollectionItem[]>();
    let lastYear = 0;

    for (const item of this.sortedCollection()) {
      if (!item.year) continue; // Skip items without a year
      if (!yearMap.has(item.year)) {
        yearMap.set(item.year, []);
      }
      yearMap.get(item.year)?.push(item);
    }

    yearMap.forEach((items, year) => {
      const gap = lastYear ? year - lastYear : 0;
      groups.push({ year, items, gap });
      lastYear = year;
    });

    return groups;
  });

  /**
   * Determines the visual spacing (gap) between chronological entries based on the time elapsed.
   * @param gap The number of years between the current entry and the previous one.
   * @returns A numeric value representing the rem units for the CSS margin-top.
   */
  calculateGap(gap: number): number {
    if (gap === 0) {
      // Remove space above first year
      return 0;
    }

    const typicalGap = 2; // 2rem for consecutive years
    if (gap === 1) {
      return typicalGap;
    }

    // For missed years
    const baseMissedYearGap = 4; // A larger base gap for any missed years
    const perYearGap = 0.5; // And a more noticeable per-year gap

    return baseMissedYearGap + (gap - 2) * perYearGap;
  }
}
