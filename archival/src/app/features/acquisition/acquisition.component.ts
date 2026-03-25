import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';
import {
  CollectionItem,
  Volume,
  DiscogsRelease,
  DiscogsResponse,
  CategoryType,
} from '../../shared/models/archive.models';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  map,
  timeout,
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
  errorMessage = signal<string | null>(null);
  searchError = signal<string | null>(null);
  showDuplicateWarning = signal(false);

  // Categories
  categories: CategoryType[] = ['decor', 'music', 'books', 'fashion'];

  // Current year for validation
  currentYear = new Date().getFullYear();

  // Image Upload State
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Book Search State
  bookSearchResults = signal<Volume[]>([]);
  isSearchingBooks = signal(false);

  // Album Search State
  albumSearchResults = signal<DiscogsRelease[]>([]);
  isSearchingMusic = signal(false);

  private search$ = new Subject<string>();
  private searchSubscription?: Subscription;

  rooms = this.archive.rooms;
  movements = this.archive.movements;
  cities = this.archive.cities;
  isOnline = this.archive.isOnline;

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

  private STORAGE_KEY = 'archival_pending_acquisition';

  constructor() {
    // Restore partial save (Error Handling)
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.newItem.set(parsed);
        if (parsed.image) {
          this.imagePreview.set(parsed.image);
        }
      } catch (e) {
        console.error('Failed to restore partial save', e);
      }
    }

    // Persist changes to localStorage (Error Handling)
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.newItem()));
    });
  }

  // Filter movements based on the selected category from the signal
  filteredMovements = computed(() => {
    const selectedCategory = this.newItem().category;
    if (!selectedCategory) {
      return this.movements();
    }
    return this.movements().filter((m) => m.category === selectedCategory);
  });

  designerLabel = computed(() => {
    const category = this.newItem().category;
    if (category === 'books') return 'Author';
    if (category === 'music') return 'Artist';
    return 'Designer';
  });

  movementLabel = computed(() => {
    const category = this.newItem().category;
    if (category === 'books' || category === 'music') return 'Genre';
    return 'Movement';
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
          this.searchError.set(null);

          if (!query) {
            this.bookSearchResults.set([]);
            this.albumSearchResults.set([]);
            return of(null);
          }

          if (category === 'books') {
            // If the category is books, search Google Books API
            this.isSearchingBooks.set(true);
            return this.archive.searchBooks(query).pipe(
              timeout(1000),
              map((results) => ({
                data: results?.items || [],
                category: 'books',
              })),
              catchError((err) => {
                const msg =
                  err.name === 'TimeoutError'
                    ? 'API response exceeded 1.0 second threshold. Please proceed with manual entry.'
                    : 'External discovery service unreachable. Manual entry enabled.';
                this.searchError.set(msg);
                return of({ data: [], category: 'books' });
              }),
            );
          } else if (category === 'music') {
            // If the category is music, search Discogs API
            this.isSearchingMusic.set(true);
            return this.archive.searchDiscogs(query).pipe(
              timeout(1000),
              map(
                (response: {
                  data: DiscogsResponse | null;
                  error: unknown | null;
                }) => {
                  const items = response.data?.results || [];
                  return {
                    data: items,
                    category: 'music',
                  };
                },
              ),
              catchError((err) => {
                const msg =
                  err.name === 'TimeoutError'
                    ? 'API response exceeded 1.0 second threshold. Please proceed with manual entry.'
                    : 'External discovery service unreachable. Manual entry enabled.';
                this.searchError.set(msg);
                return of({ data: [], category: 'music' });
              }),
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
            this.bookSearchResults.set(result.data as Volume[]);
          } else if (result.category === 'music') {
            this.albumSearchResults.set(result.data as DiscogsRelease[]);
          }
        } else {
          this.bookSearchResults.set([]);
          this.albumSearchResults.set([]);
        }
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onNomenclatureChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.newItem.update((item) => ({ ...item, name: query }));
    this.search$.next(query);
  }

  selectBook(book: Volume): void {
    const volumeInfo = book.volumeInfo;
    const year = volumeInfo.publishedDate
      ? parseInt(volumeInfo.publishedDate.substring(0, 4))
      : this.newItem().year;

    const imageUrl = volumeInfo.imageLinks?.thumbnail?.replace(
      'http://',
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

  selectDiscogsRelease(release: DiscogsRelease): void {
    const imageUrl = release.cover_image;
    const parts = release.title.split(' - ');
    const artist = parts.length > 1 ? parts[0] : 'Unknown Artist';
    const albumName =
      parts.length > 1 ? parts.slice(1).join(' - ') : release.title;

    this.newItem.update((item) => ({
      ...item,
      name: albumName,
      designer: artist,
      year: release.year ? parseInt(release.year, 10) : undefined,
      image: imageUrl || '',
      note: `Format: ${release.format?.join(', ') || 'N/A'}\nLabel: ${
        release.label?.join(', ') || 'N/A'
      }`,
    }));

    this.imagePreview.set(imageUrl || null);
    this.albumSearchResults.set([]);
    this.selectedFile.set(null);
  }

  onCategoryChange(newCategory: CategoryType): void {
    this.newItem.update((item) => ({
      ...item,
      category: newCategory,
      movementId: '',
      room: newCategory === 'decor' ? item.room : '',
    }));
    this.bookSearchResults.set([]);
    this.albumSearchResults.set([]);
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

      // Clear any external image URL
      this.newItem.update((item) => ({ ...item, image: '' }));
    }
  }

  async handleSubmit(): Promise<void> {
    const currentItem = this.newItem();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!currentItem.name) {
      this.errorMessage.set('Object nomenclature is required.');
      return;
    }

    // Year validation
    if (
      currentItem.year &&
      (currentItem.year < 1000 || currentItem.year > this.currentYear)
    ) {
      this.errorMessage.set(
        `Please enter a valid archival year (1000-${this.currentYear}).`,
      );
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Duplicate Item Check (Error Handling)
      const isDuplicate = this.archive.collection().some(
        (item) =>
          item.name.toLowerCase().trim() ===
            currentItem.name?.toLowerCase().trim() &&
          item.designer.toLowerCase().trim() ===
            currentItem.designer?.toLowerCase().trim(),
      );

      if (isDuplicate) {
        this.showDuplicateWarning.set(true);
        this.isSubmitting.set(false);
        return;
      }

      await this.processSubmission();
    } catch (err) {
      console.error('Acquisition failed:', err);
      this.errorMessage.set(
        'An error occurred while integrating the record. Please try again.',
      );
      this.isSubmitting.set(false);
    }
  }

  async confirmDuplicate(): Promise<void> {
    this.showDuplicateWarning.set(false);
    this.isSubmitting.set(true);
    await this.processSubmission();
  }

  cancelDuplicate(): void {
    this.showDuplicateWarning.set(false);
  }

  private async processSubmission(): Promise<void> {
    const currentItem = this.newItem();
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
      this.errorMessage.set(
        'An error occurred while integrating the record. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    localStorage.removeItem(this.STORAGE_KEY);
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
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
