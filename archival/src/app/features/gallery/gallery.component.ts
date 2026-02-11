import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
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

  // Modal state for routing items to personal collections
  collectionPickerItem = signal<CollectionItem | null>(null);

  // Direct access to the Supabase-driven signals from the ArchiveService
  items = this.archive.collection;
  userCollections = this.archive.userCollections;

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

  /**
   * Opens the collection routing modal for a specific archival record.
   */
  openCollectionPicker(item: CollectionItem): void {
    this.collectionPickerItem.set(item);
  }

  /**
   * Triggers the Supabase junction table insertion via the ArchiveService.
   */
  addToCollection(colId: string): void {
    const item = this.collectionPickerItem();
    if (item) {
      this.archive.addToUserCollection(colId, item.id);
      this.collectionPickerItem.set(null);
    }
  }

  deleteItem(id: string): void {
    this.archive.deleteItem(id);
  }
}
