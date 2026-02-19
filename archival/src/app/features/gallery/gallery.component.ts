import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private archive = inject(ArchiveService);

  // Local UI State for filters and interaction
  showFilters = signal(false);
  activeFilters = signal<Record<string, string>>({
    category: 'all',
    origin: 'all',
    era: 'all',
  });

  // Direct access to the Supabase-driven signals from the ArchiveService
  items = this.archive.collection;

  /**
   * Computes the filtered list of records based on active UI selections.
   */
  filteredItems = computed(() => {
    const items = this.items();
    const filters = this.activeFilters();

    return items.filter((item) => {
      const catMatch =
        filters['category'] === 'all' || item.category === filters['category'];
      const origMatch =
        filters['origin'] === 'all' || item.origin === filters['origin'];

      const yr = item.year;
      const decade = !yr ? 'unknown' : Math.floor(yr / 10) * 10 + 's';
      const eraMatch = filters['era'] === 'all' || decade === filters['era'];

      return catMatch && origMatch && eraMatch;
    });
  });

  /**
   * Generates dynamic filter categories based on the current archival data set.
   */
  filterOptions = computed(() => {
    const items = this.items();
    return {
      category: ['all', ...new Set(items.map((i) => i.category))].sort(),
      origin: ['all', ...new Set(items.map((i) => i.origin))].sort(),
      era: [
        'all',
        ...new Set(
          items.map((i) => {
            const yr = i.year;
            return !yr ? 'unknown' : Math.floor(yr / 10) * 10 + 's';
          }),
        ),
      ].sort(),
    };
  });

  // --- Interaction Logic ---

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  setFilter(tray: string, value: string): void {
    this.activeFilters.update((prev) => ({ ...prev, [tray]: value }));
  }
}
