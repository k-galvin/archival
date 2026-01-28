import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  private archive = inject(ArchiveService);

  // Local UI State
  showFilters = signal(false);
  activeFilters = signal<Record<string, string>>({
    category: 'all',
    origin: 'all',
    era: 'all',
  });

  // Picker State for Routing Items to Collections
  collectionPickerItem = signal<CollectionItem | null>(null);

  // Derived State from Central Service
  items = this.archive.collection;
  userCollections = this.archive.userCollections;

  filteredItems = computed(() => {
    const items = this.items();
    const filters = this.activeFilters();

    return items.filter((item) => {
      const catMatch =
        filters['category'] === 'all' || item.category === filters['category'];
      const origMatch =
        filters['origin'] === 'all' || item.origin === filters['origin'];

      const yearInt = parseInt(item.year);
      const decade = isNaN(yearInt)
        ? 'unknown'
        : Math.floor(yearInt / 10) * 10 + 's';
      const eraMatch = filters['era'] === 'all' || decade === filters['era'];

      return catMatch && origMatch && eraMatch;
    });
  });

  filterOptions = computed(() => {
    const items = this.items();
    return {
      category: ['all', ...new Set(items.map((i) => i.category))].sort(),
      origin: ['all', ...new Set(items.map((i) => i.origin))].sort(),
      era: [
        'all',
        ...new Set(
          items.map((i) => {
            const y = parseInt(i.year);
            return isNaN(y) ? 'unknown' : Math.floor(y / 10) * 10 + 's';
          }),
        ),
      ].sort(),
    };
  });

  // --- Actions ---

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  setFilter(tray: string, value: string): void {
    this.activeFilters.update((prev) => ({ ...prev, [tray]: value }));
  }

  /**
   * Opens the routing picker for a specific record
   */
  openCollectionPicker(item: CollectionItem): void {
    this.collectionPickerItem.set(item);
  }

  /**
   * Routes an item to a specific personal archive
   */
  addToCollection(colId: string, itemId: string): void {
    this.archive.addToUserCollection(colId, itemId);
    this.collectionPickerItem.set(null);
  }
}
