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
  map,
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

  // Album Search State
  albumSearchResults = signal<any[]>([]);
  isSearchingMusic = signal(false);

  private search$ = new Subject<string>();
  private searchSubscription!: Subscription;

  // Archive signals for dropdowns
  rooms = this.archive.rooms;
  movements = this.archive.movements;
  cities = this.archive.cities;

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
    image: '', // For book/album cover URL
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
    this.searchSubscription = this.search$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((query) => {
          const category = this.newItem().category;

          this.isSearchingBooks.set(false);
          this.isSearchingMusic.set(false);

          if (!query) {
            this.bookSearchResults.set([]);
            this.albumSearchResults.set([]);
            return of(null);
          }

          if (category === 'books') {
            this.isSearchingBooks.set(true);
            return this.archive.searchBooks(query).pipe(
              map((results) => ({
                data: results?.items || [],
                category: 'books',
              })),
              catchError(() => of({ data: [], category: 'books' })),
            );
          } else if (category === 'music') {
            this.isSearchingMusic.set(true);
            return this.archive.searchDiscogs(query).pipe(
              map((results) => ({
                data: results?.results || [],
                category: 'music',
              })),
              catchError(() => of({ data: [], category: 'music' })),
            );
          }

          return of(null);
        }),
      )
      .subscribe((result) => {
        this.isSearchingBooks.set(false);
        this.isSearchingMusic.set(false);

        if (result) {
          if (result.category === 'books') {
            this.bookSearchResults.set(result.data);
          } else if (result.category === 'music') {
            this.albumSearchResults.set(result.data);
          }
        } else {
          this.bookSearchResults.set([]);
          this.albumSearchResults.set([]);
        }
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  onNomenclatureChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.newItem.update((item) => ({ ...item, name: query }));
    this.search$.next(query);
  }

  selectBook(book: any): void {
    const volumeInfo = book.volumeInfo;
    const year = volumeInfo.publishedDate
      ? parseInt(volumeInfo.publishedDate.substring(0, 4))
      : this.newItem().year;

    const imageUrl = volumeInfo.imageLinks?.thumbnail?.replace(
      /^http:\/\//i, // Corrected regex literal
      'https://',
    );

    this.newItem.update((item) => ({
      ...item,
      name: volumeInfo.title,
      designer: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
      year: year,
      image: imageUrl || '',
      note: volumeInfo.description || '',
    }));

    this.imagePreview.set(imageUrl || null);
    this.bookSearchResults.set([]);
    this.selectedFile.set(null);
  }

  selectDiscogsRelease(release: any): void {
    const imageUrl = release.cover_image;
    const parts = release.title.split(' - ');
    const artist = parts.length > 1 ? parts[0] : 'Unknown Artist';
    const albumName =
      parts.length > 1 ? parts.slice(1).join(' - ') : release.title;

    this.newItem.update((item) => ({
      ...item,
      name: albumName,
      designer: artist,
      year: release.year,
      image: imageUrl || '',
      note: `Format: ${release.format?.join(', ') || 'N/A'}\nLabel: ${
        release.label?.join(', ') || 'N/A'
      }`,
    }));

    this.imagePreview.set(imageUrl || null);
    this.albumSearchResults.set([]);
    this.selectedFile.set(null);
  }

  onCategoryChange(newCategory: 'decor' | 'music' | 'books' | 'fashion'): void {
    this.newItem.update((item) => ({
      ...item,
      category: newCategory,
      movementId: '',
    }));
    this.bookSearchResults.set([]);
    this.albumSearchResults.set([]);
  }

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
      
      // Clear any external image URL
      this.newItem.update((item) => ({ ...item, image: '' }));
    }
  }

  async handleSubmit(): Promise<void> {
    const currentItem = this.newItem();
    if (!currentItem.name) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    try {
      let imageUrl = currentItem.image || '';

      const file = this.selectedFile();
      if (file && !imageUrl) {
        const uploadedUrl = await this.archive.uploadImage(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

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
    this.albumSearchResults.set([]);
    this.isSearchingMusic.set(false);
  }
}
