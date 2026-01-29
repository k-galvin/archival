import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
} from 'rxjs';

@Component({
  selector: 'app-acquisition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acquisition.component.html',
  styleUrl: './acquisition.component.scss',
})
export class AcquisitionComponent implements OnInit, OnDestroy {
  private archive = inject(ArchiveService);

  // Form State
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  // Image Upload State
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Book Search State
  bookSearchResults = signal<any[]>([]);
  isSearchingBooks = signal(false);
  private bookSearch$ = new Subject<string>();
  private bookSearchSubscription!: Subscription;

  // Archive signals for dropdowns
  rooms = this.archive.rooms;
  movements = this.archive.movements;

  // Form data as a signal
  newItem = signal<Partial<CollectionItem>>({
    category: 'decor',
    name: '',
    designer: '',
    year: 2024,
    origin: '',
    note: '',
    room: '',
    movementId: '',
    image: '', // For book cover URL
  });

  // Filter movements based on the selected category from the signal
  filteredMovements = computed(() => {
    const selectedCategory = this.newItem().category;
    if (!selectedCategory) {
      return this.movements();
    }
    return this.movements().filter((m) => m.category === selectedCategory);
  });

  ngOnInit(): void {
    this.bookSearchSubscription = this.bookSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || this.newItem().category !== 'books') {
            this.bookSearchResults.set([]);
            return of({ items: [] });
          }
          this.isSearchingBooks.set(true);
          return this.archive.searchBooks(query).pipe(
            catchError(() => {
              this.isSearchingBooks.set(false);
              return of({ items: [] });
            }),
          );
        }),
      )
      .subscribe((results) => {
        this.isSearchingBooks.set(false);
        this.bookSearchResults.set(results.items || []);
      });
  }

  ngOnDestroy(): void {
    this.bookSearchSubscription.unsubscribe();
  }

  onNomenclatureChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.newItem.update((item) => ({ ...item, name: query }));
    this.bookSearch$.next(query);
  }

  selectBook(book: any): void {
    const volumeInfo = book.volumeInfo;
    const year = volumeInfo.publishedDate
      ? parseInt(volumeInfo.publishedDate.substring(0, 4))
      : this.newItem().year;

    const imageUrl = volumeInfo.imageLinks?.thumbnail?.replace(
      /^http:\/\//i,
      'https://',
    );

    this.newItem.update((item) => ({
      ...item,
      name: volumeInfo.title,
      designer: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
      year: year,
      image: imageUrl || '',
      note: volumeInfo.description || '', // Auto-populate description
    }));

    this.imagePreview.set(imageUrl || null);
    this.bookSearchResults.set([]);
    this.selectedFile.set(null);
  }

  /**
   * Handles category changes to reset dependent selections
   */
  onCategoryChange(newCategory: 'decor' | 'music' | 'books' | 'fashion'): void {
    this.newItem.update((item) => ({
      ...item,
      category: newCategory,
      movementId: '',
    }));
    // If category is not books, clear search results
    if (newCategory !== 'books') {
      this.bookSearchResults.set([]);
    }
  }

  /**
   * Handles local file selection and generates a preview
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.imagePreview.set(URL.createObjectURL(file));
      // Clear book image if a local file is chosen
      this.newItem.update((item) => ({ ...item, image: '' }));
    }
  }

  /**
   * Orchestrates the upload and registration protocol
   */
  async handleSubmit(): Promise<void> {
    const currentItem = this.newItem();
    if (!currentItem.name) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    try {
      let imageUrl = currentItem.image || ''; // Use book cover URL if available

      // 1. Upload to Supabase Storage if a local file was selected
      const file = this.selectedFile();
      if (file && !imageUrl) {
        const uploadedUrl = await this.archive.uploadImage(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      // 2. Register the full record with the image URL
      const newItemData = await this.archive.addItem({
        ...currentItem,
        image:
          imageUrl ||
          'https://images.unsplash.com/photo-1581553676106-de07185c7097?q=80&w=800',
      } as CollectionItem);

      if (newItemData) {
        this.successMessage.set('Record successfully integrated into archive.');
        this.resetForm();
      }
    } catch (err) {
      console.error('Acquisition failed:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    this.newItem.set({
      category: 'decor',
      name: '',
      designer: '',
      year: 2024,
      origin: '',
      note: '',
      room: '',
      movementId: '',
      image: '',
    });
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.bookSearchResults.set([]);
    this.isSearchingBooks.set(false);
  }
}
