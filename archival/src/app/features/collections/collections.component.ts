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

    this.archive.addCollection(title); // Call the service to persist the new collection
    this.newCollectionTitle.set('');
  }

  /**
   * Removes an entire collection record from the state
   */
  deleteCollection(id: string): void {
    // Confirmation before deleting
    if (confirm('Are you sure you want to delete this entire collection?')) {
      this.archive.deleteCollection(id);
    }
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
