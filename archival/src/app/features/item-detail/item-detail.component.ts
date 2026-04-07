import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

/**
 * ItemDetailComponent
 * Manages the detailed display of a single archival record, including its metadata,
 * related items, and administrative functions like editing and deletion.
 */
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
  /** Reference to the global ArchiveService for data operations. */
  public archive = inject(ArchiveService);

  /** Signal containing the current archival item being viewed. */
  item = signal<CollectionItem | null>(null);

  /** Signal containing a mutable partial copy of the item used during editing. */
  editableItem = signal<Partial<CollectionItem> | null>(null);

  /** Signal indicating whether the component is in edit mode. */
  isEditing = signal(false);

  /** Signal indicating whether the collection selection overlay is visible. */
  collectionPickerOpen = signal(false);

  /** Signal indicating whether the deletion confirmation modal is visible. */
  deleteConfirmOpen = signal(false);

  /**
   * Helper for detecting if the item's image is a formatted cover from an external API (Google Books or Discogs).
   */
  isFormattedCover = computed(() => {
    const current = this.item();
    if (!current) return false;
    return (
      current.image.includes('books.google.com') ||
      current.image.includes('discogs.com')
    );
  });

  /**
   * Filters historical movements based on the selected item's category (e.g., 'furniture' vs 'music').
   */
  filteredMovements = computed(() => {
    const category = this.item()?.category;
    const allMovements = this.archive.movements();
    if (!category) return allMovements;
    return allMovements.filter((m) => m.category === category);
  });

  /**
   * Computes the appropriate semantic label for the 'movement' field based on the item's category.
   */
  movementLabel = computed(() => {
    const category = this.item()?.category;
    if (category === 'books' || category === 'music') return 'Genre';
    return 'Movement';
  });

  /**
   * Computes the appropriate semantic label for the 'designer' field based on the item's category.
   */
  designerLabel = computed(() => {
    const category = this.item()?.category;
    if (category === 'books') return 'Author';
    if (category === 'music') return 'Artist';
    return 'Designer';
  });

  /**
   * Identifies up to three related archival items based on shared designer/author or movement/genre.
   */
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
  /** Signal containing the locally selected image file for upload. */
  selectedFile = signal<File | null>(null);

  /** Signal containing the base64 preview string for the selected image. */
  imagePreview = signal<string | null>(null);

  /** Signal indicating whether a save or delete operation is in progress. */
  isSubmitting = signal(false);

  /** Signal containing the latest error message from user interactions. */
  errorMessage = signal<string | null>(null);

  /** Signal tracking the browser's connectivity status. */
  isOnline = this.archive.isOnline;

  /** Signal indicating whether a duplicate record warning should be displayed. */
  showDuplicateWarning = signal(false);

  /** The current calendar year for date validation. */
  currentYear = new Date().getFullYear();

  /**
   * Getter for archival rooms from the central service.
   */
  get rooms() {
    return this.archive.rooms;
  }

  /**
   * Getter for user-defined collections from the central service.
   */
  get userCollections() {
    return this.archive.userCollections;
  }

  /**
   * Getter for city/geographic data from the central service.
   */
  get cities() {
    return this.archive.cities;
  }

  /**
   * Initializes the component by fetching the item ID from the route and locating the record.
   */
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

  /**
   * Transitions the component into edit mode and prepares the mutable item copy.
   */
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

  /**
   * Handles local file selection for updating the archival photograph.
   * @param event The file input change event.
   */
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

  /**
   * Validates and prepares the item updates for persistence.
   * Checks for duplicates before proceeding.
   */
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

  /**
   * Confirms the intent to create a duplicate record.
   */
  async confirmDuplicate(): Promise<void> {
    this.showDuplicateWarning.set(false);
    this.isSubmitting.set(true);
    await this.processUpdate();
  }

  /**
   * Cancels the duplicate record creation.
   */
  cancelDuplicate(): void {
    this.showDuplicateWarning.set(false);
  }

  /**
   * Orchestrates the persistence of item updates, including optional image uploads.
   */
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

  /**
   * Triggers the deletion confirmation modal.
   */
  async deleteItem(): Promise<void> {
    this.deleteConfirmOpen.set(true);
  }

  /**
   * Performs the actual deletion via the ArchiveService and navigates back to the gallery.
   */
  async confirmDelete(): Promise<void> {
    const currentItem = this.item();
    if (!currentItem) return;

    await this.archive.deleteItem(currentItem.id);
    this.deleteConfirmOpen.set(false);
    this.router.navigate(['/gallery']);
  }

  /**
   * Dismisses the deletion confirmation modal.
   */
  cancelDelete(): void {
    this.deleteConfirmOpen.set(false);
  }

  /**
   * Opens the collection assignment overlay.
   */
  openCollectionPicker(): void {
    this.collectionPickerOpen.set(true);
  }

  /**
   * Assigns the current item to a curated collection.
   * @param colId The ID of the target collection.
   */
  addToCollection(colId: string): void {
    const currentItem = this.item();
    if (currentItem) {
      this.archive.addToUserCollection(colId, currentItem.id);
      this.collectionPickerOpen.set(false);
    }
  }
}
