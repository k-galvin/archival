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

/**
 * GalleryComponent
 * Manages the display of archival items in a responsive grid, including
 * search and advanced filtering by category, origin, era, and movement.
 */
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
  /** Signal indicating whether the filter tray is currently visible. */
  showFilters = signal(false);

  /** Signal containing the active search string for filtering items by name, designer, or notes. */
  searchQuery = signal('');

  /** Signal containing the current filter selections for each category. */
  activeFilters = signal<Record<string, string>>({
    category: 'all',
    origin: 'all',
    era: 'all',
    movement: 'all',
  });

  // Direct access to the Supabase-driven signals from the ArchiveService
  /** Reference to the global collection of archival items from the ArchiveService. */
  items = this.archive.collection;

  /** Reference to the global loading state from the ArchiveService. */
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

  /**
   * Toggles the visibility of the advanced filter tray.
   */
  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  /**
   * Updates a specific filter category with a new value.
   * @param tray The filter category to update (e.g., 'category', 'origin').
   * @param value The new value to apply to the filter.
   */
  setFilter(tray: string, value: string): void {
    this.activeFilters.update((prev) => ({ ...prev, [tray]: value }));
  }

  /**
   * Updates the search query signal based on user input.
   * @param event The input event containing the new search value.
   */
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}
