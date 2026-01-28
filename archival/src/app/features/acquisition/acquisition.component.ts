import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

@Component({
  selector: 'app-acquisition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acquisition.component.html',
  styleUrl: './acquisition.component.scss',
})
export class AcquisitionComponent {
  private archive = inject(ArchiveService);

  // Form State
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  // Image Upload State
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Archive signals for dropdowns
  rooms = this.archive.rooms;
  movements = this.archive.movements; // Make movements signal available

  newItem: Partial<CollectionItem> = {
    category: 'decor',
    name: '',
    designer: '',
    year: 2024,
    origin: '',
    note: '',
    room: '', // Initialize room property
    movementId: '', // Initialize movementId property
  };

  // Filter movements based on the selected category
  filteredMovements = computed(() => {
    const selectedCategory = this.newItem.category;
    return this.movements().filter(
      (m) => m.category === selectedCategory,
    );
  });

  /**
   * Handles local file selection and generates a preview
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
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

  /**
   * Orchestrates the upload and registration protocol
   */
  async handleSubmit(): Promise<void> {
    if (!this.newItem.name) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    try {
      let imageUrl = '';

      // 1. Upload to Supabase Storage if a file was selected
      const file = this.selectedFile();
      if (file) {
        const uploadedUrl = await this.archive.uploadImage(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      // 2. Register the full record with the image URL
      const newItemData = await this.archive.addItem({
        ...this.newItem,
        image:
          imageUrl ||
          'https://images.unsplash.com/photo-1581553676106-de07185c7097?q=80&w=800', // Fallback
      } as CollectionItem);

      if (newItemData) {
        this.successMessage.set('Record successfully integrated into archive.');
        this.resetForm();
      } else {
        // Optionally, set an error message here if needed.
        // For now, just ensuring success message isn't shown on failure.
      }
    } catch (err) {
      console.error('Acquisition failed:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    this.newItem = {
      category: 'decor',
      name: '',
      designer: '',
      year: 2024,
      origin: '',
      note: '',
    };
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }
}
