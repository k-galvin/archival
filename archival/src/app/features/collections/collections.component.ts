import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent {
  private archive = inject(ArchiveService);

  // Local state for the collection creation form
  newCollectionTitle = signal('');

  // Access central state signals from the service
  userCollections = this.archive.userCollections;

  /**
   * Creates a new empty collection based on user input
   */
  createCollection(): void {
    const title = this.newCollectionTitle().trim();
    if (!title) return;

    const newCol = {
      id: Math.random().toString(36).substring(2, 11),
      title: title.toLowerCase(),
      itemIds: [],
    };

    this.archive.userCollections.update((prev) => [newCol, ...prev]);
    this.newCollectionTitle.set('');
  }

  /**
   * Removes an entire collection record from the state
   */
  deleteCollection(id: string): void {
    this.archive.userCollections.update((prev) =>
      prev.filter((c) => c.id !== id),
    );
  }

  /**
   * Removes a specific item reference from a collection
   */
  removeFromCollection(colId: string, itemId: string): void {
    this.archive.userCollections.update((cols) =>
      cols.map((c) => {
        if (c.id === colId) {
          return { ...c, itemIds: c.itemIds.filter((id) => id !== itemId) };
        }
        return c;
      }),
    );
  }

  /**
   * Helper to retrieve full item metadata for display within the collection strip
   */
  getItemById(id: string) {
    return this.archive.collection().find((i) => i.id === id);
  }
}
