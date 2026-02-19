import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss',
})
export class ItemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public archive = inject(ArchiveService);

  item = signal<CollectionItem | null>(null);
  editableItem = signal<Partial<CollectionItem> | null>(null);
  isEditing = signal(false);
  collectionPickerOpen = signal(false);
  deleteConfirmOpen = signal(false);

  // Image Edit State
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  currentYear = new Date().getFullYear();

  // Getters for easy access in the template
  get rooms() {
    return this.archive.rooms;
  }
  get userCollections() {
    return this.archive.userCollections;
  }
  get movements() {
    return this.archive.movements;
  }
  get cities() {
    return this.archive.cities;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const itemId = params.get('id');
      if (itemId) {
        // Try to find the item in the collection signal
        const foundItem = this.archive.collection().find((i) => i.id === itemId);
        if (foundItem) {
          this.item.set(foundItem);
        } else {
          // If not found, it might be because the collection signal hasn't been populated yet.
          // We can't reliably fetch a single item here without a dedicated service method.
          // For now, we'll navigate away. A more robust solution would be to add a
          // `getSingleItem(id)` method to the ArchiveService.
          this.router.navigate(['/gallery']);
        }
      }
    });
  }

  startEdit(): void {
    const current = this.item();
    if (!current) return;

    // Create a mutable copy for editing
    this.editableItem.set({ ...current });
    this.imagePreview.set(current.image);
    this.selectedFile.set(null);
    this.errorMessage.set(null);
    this.isEditing.set(true);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedFile.set(file);

      // Generate a local preview for immediate visual feedback
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async saveEdit(): Promise<void> {
    const editable = this.editableItem();
    const original = this.item();
    this.errorMessage.set(null);

    if (!editable || !original) return;

    if (!editable.name) {
      this.errorMessage.set('Object nomenclature is required.');
      return;
    }

    // Year validation
    if (
      editable.year &&
      (editable.year < 1000 || editable.year > this.currentYear)
    ) {
      this.errorMessage.set(
        `Please enter a valid archival year (1000-${this.currentYear}).`,
      );
      return;
    }

    this.isSubmitting.set(true);

    try {
      let imageUrl = original.image;

      const file = this.selectedFile();
      if (file) {
        const uploadedUrl = await this.archive.uploadImage(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      // We only want to send properties that changed or are relevant
      // ArchiveService.updateItem handles the mapping to DB columns.
      const updates: Partial<CollectionItem> = {
        name: editable.name,
        year: editable.year,
        designer: editable.designer,
        origin: editable.origin,
        note: editable.note,
        room: editable.room, // Note: template was using room_id, fixing to use room (which stores ID)
        movementId: editable.movementId,
        image: imageUrl,
      };

      const updatedItem = await this.archive.updateItem(original.id, updates);
      if (updatedItem) {
        this.item.set(updatedItem as CollectionItem);
      }
      this.isEditing.set(false);
      this.editableItem.set(null);
      this.selectedFile.set(null);
      this.imagePreview.set(null);
    } catch (err) {
      console.error('Update failed:', err);
      this.errorMessage.set(
        'An error occurred while updating the record. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteItem(): Promise<void> {
    this.deleteConfirmOpen.set(true);
  }

  async confirmDelete(): Promise<void> {
    const currentItem = this.item();
    if (!currentItem) return;

    await this.archive.deleteItem(currentItem.id);
    this.deleteConfirmOpen.set(false);
    this.router.navigate(['/gallery']);
  }

  cancelDelete(): void {
    this.deleteConfirmOpen.set(false);
  }

  openCollectionPicker(): void {
    this.collectionPickerOpen.set(true);
  }

  addToCollection(colId: string): void {
    const currentItem = this.item();
    if (currentItem) {
      this.archive.addToUserCollection(colId, currentItem.id);
      this.collectionPickerOpen.set(false);
    }
  }
}
