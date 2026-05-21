import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';
import { RouterLink } from '@angular/router';

/**
 * CollectionsComponent
 * Provides an interface for creating, viewing, and managing custom groupings
 * of archival records.
 */
@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent {
  private archive = inject(ArchiveService);

  // Local state for the collection creation form
  /** Signal containing the pending title for a new collection being created. */
  newCollectionTitle = signal('');

  // Access central state signals from the service
  /** Reference to the global list of user-defined collections from the ArchiveService. */
  userCollections = this.archive.userCollections;

  /** Reference to the global loading state from the ArchiveService. */
  isLoading = this.archive.loading;

  // Modal state for deletion confirmation
  /** Signal indicating whether the deletion confirmation modal is visible. */
  deleteConfirmOpen = signal(false);

  /** Signal containing the metadata of the collection currently targeted for deletion. */
  collectionToDelete = signal<{ id: string; title: string } | null>(null);

  /**
   * Creates a new empty collection based on user input.
   */
  createCollection(): void {
    const title = this.newCollectionTitle().trim();
    if (!title) return;

    this.archive.addCollection(title); // Call the service to persist the new collection
    this.newCollectionTitle.set('');
  }

  /**
   * Opens the confirmation modal for deleting a collection.
   * @param id The unique ID of the collection to delete.
   */
  deleteCollection(id: string): void {
    const col = this.userCollections().find((c) => c.id === id);
    if (col) {
      this.collectionToDelete.set({ id: col.id, title: col.title });
      this.deleteConfirmOpen.set(true);
    }
  }

  /**
   * Triggers the actual deletion via the ArchiveService after confirmation.
   * @returns A promise that resolves when the deletion is complete.
   */
  async confirmDelete(): Promise<void> {
    const col = this.collectionToDelete();
    if (col) {
      await this.archive.deleteCollection(col.id);
      this.closeDeleteModal();
    }
  }

  /**
   * Resets the deletion modal state and clears the targeted collection.
   */
  closeDeleteModal(): void {
    this.deleteConfirmOpen.set(false);
    this.collectionToDelete.set(null);
  }

  /**
   * Removes a specific item reference from a curated collection.
   * @param colId The ID of the collection.
   * @param itemId The ID of the item to remove.
   */
  removeFromCollection(colId: string, itemId: string): void {
    this.archive.removeFromCollection(colId, itemId);
  }

  /**
   * Helper to retrieve full item metadata for display within the collection strip.
   * @param id The unique ID of the item to retrieve.
   * @returns The CollectionItem object if found, otherwise undefined.
   */
  getItemById(id: string) {
    return this.archive.collection().find((i) => i.id === id);
  }
}
