import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';
import { RouterLink } from '@angular/router';

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
  newCollectionTitle = signal('');

  // Access central state signals from the service
  userCollections = this.archive.userCollections;
  isLoading = this.archive.loading;

  // Modal state for deletion confirmation
  deleteConfirmOpen = signal(false);
  collectionToDelete = signal<{ id: string; title: string } | null>(null);

  /**
   * Creates a new empty collection based on user input
   */
  createCollection(): void {
    const title = this.newCollectionTitle().trim();
    if (!title) return;

    this.archive.addCollection(title); // Call the service to persist the new collection
    this.newCollectionTitle.set('');
  }

  /**
   * Opens the confirmation modal for deleting a collection
   */
  deleteCollection(id: string): void {
    const col = this.userCollections().find((c) => c.id === id);
    if (col) {
      this.collectionToDelete.set({ id: col.id, title: col.title });
      this.deleteConfirmOpen.set(true);
    }
  }

  /**
   * Triggers the actual deletion via the ArchiveService
   */
  async confirmDelete(): Promise<void> {
    const col = this.collectionToDelete();
    if (col) {
      await this.archive.deleteCollection(col.id);
      this.closeDeleteModal();
    }
  }

  /**
   * Resets deletion modal state
   */
  closeDeleteModal(): void {
    this.deleteConfirmOpen.set(false);
    this.collectionToDelete.set(null);
  }

  /**
   * Removes a specific item reference from a collection
   */
  removeFromCollection(colId: string, itemId: string): void {
    this.archive.removeFromCollection(colId, itemId);
  }

  /**
   * Helper to retrieve full item metadata for display within the collection strip
   */
  getItemById(id: string) {
    return this.archive.collection().find((i) => i.id === id);
  }
}
