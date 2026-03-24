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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private archive = inject(ArchiveService);

  // Local UI State for filters and interaction
  showFilters = signal(false);
  searchQuery = signal('');
  activeFilters = signal<Record<string, string>>({
    category: 'all',
    origin: 'all',
    era: 'all',
    movement: 'all',
  });

  // Direct access to the Supabase-driven signals from the ArchiveService
  items = this.archive.collection;
  isLoading = this.archive.loading;

  /**
   * Computes the filtered list of records based on active UI selections and search query.
   */
  filteredItems = computed(() => {
    const items = this.items();
    const filters = this.activeFilters();
    const query = this.searchQuery().toLowerCase().trim();

    return items.filter((item) => {
      // 1. Search Query Match
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.designer.toLowerCase().includes(query) ||
        item.note?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Filter Matches
      const catMatch =
        filters['category'] === 'all' || item.category === filters['category'];
      const origMatch =
        filters['origin'] === 'all' || item.origin === filters['origin'];
      const moveMatch =
        filters['movement'] === 'all' ||
        item.movementName === filters['movement'];

      const yr = item.year;
      const decade = !yr ? 'unknown' : Math.floor(yr / 10) * 10 + 's';
      const eraMatch = filters['era'] === 'all' || decade === filters['era'];

      return catMatch && origMatch && eraMatch && moveMatch;
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
      movement: [
        'all',
        ...new Set(items.map((i) => i.movementName).filter((m) => !!m)),
      ].sort(),
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

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}
