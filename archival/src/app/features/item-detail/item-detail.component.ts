import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  // Helper for detecting book/album covers
  isFormattedCover = computed(() => {
    const current = this.item();
    if (!current) return false;
    return (
      current.image.includes('books.google.com') ||
      current.image.includes('discogs.com')
    );
  });

  // Filter movements based on the selected item's category
  filteredMovements = computed(() => {
    const category = this.item()?.category;
    const allMovements = this.archive.movements();
    if (!category) return allMovements;
    return allMovements.filter((m) => m.category === category);
  });

  movementLabel = computed(() => {
    const category = this.item()?.category;
    if (category === 'books' || category === 'music') return 'Genre';
    return 'Movement';
  });

  designerLabel = computed(() => {
    const category = this.item()?.category;
    if (category === 'books') return 'Author';
    if (category === 'music') return 'Artist';
    return 'Designer';
  });

  // Identify related items based on designer or movement
  relatedItems = computed(() => {
    const currentItem = this.item();
    if (!currentItem) return [];

    const allOtherItems = this.archive
      .collection()
      .filter((item) => item.id !== currentItem.id);

    // 1. Prioritize same designer
    const sameDesigner = allOtherItems.filter((item) => {
      return (
        currentItem.designer &&
        item.designer &&
        currentItem.designer.toLowerCase().trim() ===
          item.designer.toLowerCase().trim()
      );
    });

    // 2. Fallback to same movement (excluding those already matched by designer)
    const sameMovement = allOtherItems.filter((item) => {
      if (sameDesigner.some((d) => d.id === item.id)) return false;

      const currentMoveId = currentItem.movementId || currentItem.movement_id;
      const itemMoveId = item.movementId || item.movement_id;
      return currentMoveId && itemMoveId && currentMoveId === itemMoveId;
    });

    return [...sameDesigner, ...sameMovement].slice(0, 3);
  });

  // Image Edit State
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  isOnline = this.archive.isOnline;
  showDuplicateWarning = signal(false);

  currentYear = new Date().getFullYear();

  // Getters for easy access in the template
  get rooms() {
    return this.archive.rooms;
  }
  get userCollections() {
    return this.archive.userCollections;
  }
  get cities() {
    return this.archive.cities;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const itemId = params.get('id');
      if (itemId) {
        // Try to find the item in the collection signal
        const foundItem = this.archive
          .collection()
          .find((i) => i.id === itemId);
        if (foundItem) {
          this.item.set(foundItem);
        } else {
          // If not found, it might be because the collection signal hasn't been populated yet.
          this.router.navigate(['/gallery']);
        }
      }
    });
  }

  startEdit(): void {
    const current = this.item();
    if (!current) return;

    // Normalize origin to match the dropdown value (case-insensitive check)
    const cityMatch = this.archive
      .cities()
      .find(
        (c) => c.name.toLowerCase() === (current.origin || '').toLowerCase(),
      );
    const origin = cityMatch ? cityMatch.name : current.origin;

    // Use raw IDs from the database if available, otherwise find by name as a fallback
    const roomId =
      current.roomId ||
      this.archive
        .rooms()
        .find((r) => r.name === current.room)
        ?.id?.toString() ||
      '';
    const movementId =
      current.movementId ||
      this.archive.movements().find((m) => m.name === current.movementName)
        ?.id ||
      '';

    // Create a mutable copy for editing
    this.editableItem.set({
      ...current,
      origin: origin,
      room: roomId, // Bind ID to the room property used by the select
      movementId: movementId, // Bind ID to the movementId property used by the select
    });
    this.imagePreview.set(current.image);
    this.selectedFile.set(null);
    this.errorMessage.set(null);
    this.isEditing.set(true);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Enforce 5MB size limit
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Archival photographs must be less than 5MB.');
        return;
      }
      this.errorMessage.set(null);
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
      // Duplicate Item Check (Error Handling)
      const isDuplicate = this.archive
        .collection()
        .some(
          (item) =>
            item.id !== original.id &&
            item.name.toLowerCase().trim() ===
              editable.name?.toLowerCase().trim() &&
            item.designer.toLowerCase().trim() ===
              editable.designer?.toLowerCase().trim(),
        );

      if (isDuplicate) {
        this.showDuplicateWarning.set(true);
        this.isSubmitting.set(false);
        return;
      }

      await this.processUpdate();
    } catch (err) {
      console.error('Update failed:', err);
      this.errorMessage.set(
        'An error occurred while updating the record. Please try again.',
      );
      this.isSubmitting.set(false);
    }
  }

  async confirmDuplicate(): Promise<void> {
    this.showDuplicateWarning.set(false);
    this.isSubmitting.set(true);
    await this.processUpdate();
  }

  cancelDuplicate(): void {
    this.showDuplicateWarning.set(false);
  }

  private async processUpdate(): Promise<void> {
    const editable = this.editableItem();
    const original = this.item();
    if (!editable || !original) return;

    try {
      let imageUrl = original.image;

      const file = this.selectedFile();
      if (file) {
        const uploadedUrl = await this.archive.uploadImage(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      // We only want to send properties that changed or are relevant
      const updates: Partial<CollectionItem> = {
        name: editable.name,
        year: editable.year,
        designer: editable.designer,
        origin: editable.origin,
        note: editable.note,
        room: original.category === 'decor' ? editable.room : '',
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
      console.error('Update processing failed:', err);
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
