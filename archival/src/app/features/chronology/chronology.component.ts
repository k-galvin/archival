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
  selector: 'app-chronology',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chronology.component.html',
  styleUrl: './chronology.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChronologyComponent {
  private archive = inject(ArchiveService);

  private collection = this.archive.collection;

  private sortedCollection = computed(() => {
    return [...this.collection()].sort((a, b) => (a.year || 0) - (b.year || 0));
  });

  // Group items by year to handle multiple items in the same year
  groupedByYear = computed(() => {
    const groups: { year: number; items: any[]; gap: number }[] = [];
    const yearMap = new Map<number, any[]>();
    let lastYear = 0;

    for (const item of this.sortedCollection()) {
      if (!item.year) continue; // Skip items without a year
      if (!yearMap.has(item.year)) {
        yearMap.set(item.year, []);
      }
      yearMap.get(item.year)!.push(item);
    }

    yearMap.forEach((items, year) => {
      const gap = lastYear ? year - lastYear : 0;
      groups.push({ year, items, gap });
      lastYear = year;
    });

    return groups;
  });

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
