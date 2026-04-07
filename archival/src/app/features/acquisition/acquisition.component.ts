import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  effect,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  map,
  timeout,
} from 'rxjs';

/**
 * AcquisitionComponent manages the intake process for new archival objects.
 * Features:
 * - Real-time discovery via Google Books API and Discogs API
 * - Local storage persistence for draft entries
 * - Image upload to Supabase Storage with local preview
 * - Category-aware movement/genre filtering
 * - Duplicate detection and manual entry fallback
 */
@Component({
  selector: 'app-acquisition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './acquisition.component.html',
  styleUrl: './acquisition.component.scss',
})
export class AcquisitionComponent implements OnInit {
  private archive = inject(ArchiveService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // --- UI State Signals ---
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  searchError = signal<string | null>(null);
  showDuplicateWarning = signal(false);

  // --- Form & Category Metadata ---
  categories: CategoryType[] = ['decor', 'music', 'books', 'fashion'];
  currentYear = new Date().getFullYear();

  // --- Resource State Signals ---
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // --- External Discovery Signals ---
  bookSearchResults = signal<Volume[]>([]);
  isSearchingBooks = signal(false);
  albumSearchResults = signal<DiscogsRelease[]>([]);
  isSearchingMusic = signal(false);

  // --- Reactive Search Streams ---
  private search$ = new Subject<string>();

  // --- Shared Data References ---
  rooms = this.archive.rooms;
  movements = this.archive.movements;
  cities = this.archive.cities;
  isOnline = this.archive.isOnline;

  /**
   * Reactive form for the archival item.
   * Replaces the previous newItem signal for better validation and state management.
   */
  acquisitionForm: FormGroup = this.fb.group({
    category: ['decor' as CategoryType],
    name: ['', Validators.required],
    designer: [''],
    year: [
      new Date().getFullYear(),
      [Validators.min(1000), Validators.max(new Date().getFullYear())],
    ],
    origin: [''],
    note: [''],
    room: [''],
    movementId: [''],
    image: [''],
  });

  /** Signal reflecting the current form value for use in computed properties. */
  formValue = toSignal(this.acquisitionForm.valueChanges, {
    initialValue: this.acquisitionForm.value,
  });

  private STORAGE_KEY = 'archival_pending_acquisition';

  constructor() {
    // Restore partial save from previous session
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (this.isValidDraft(parsed)) {
          this.acquisitionForm.patchValue(parsed, { emitEvent: false });
          if (parsed.image) {
            this.imagePreview.set(parsed.image);
          }
        }
      } catch (e) {
        console.error('Failed to restore partial save', e);
      }
    }

    // Effect to automatically persist form changes to LocalStorage
    effect(() => {
      const currentVal = this.formValue();
      if (currentVal) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentVal));
      }
    });
  }

  /**
   * Type Guard to strictly validate the parsed JSON draft from localStorage.
   */
  isValidDraft(data: unknown): data is Partial<CollectionItem> {
    if (!data || typeof data !== 'object') return false;

    const typedData = data as Record<string, unknown>;
    const validCategories: CategoryType[] = [
      'decor',
      'music',
      'books',
      'fashion',
    ];
    if (
      typedData['category'] &&
      !validCategories.includes(typedData['category'] as CategoryType)
    )
      return false;

    if (typedData['name'] && typeof typedData['name'] !== 'string') return false;
    if (typedData['designer'] && typeof typedData['designer'] !== 'string')
      return false;
    if (typedData['year'] && typeof typedData['year'] !== 'number') return false;

    return true;
  }

  /**
   * Filters the master movements list based on the currently selected category.
   * Ensures 'Genres' are shown for music/books and 'Movements' for design.
   */
  filteredMovements = computed(() => {
    const selectedCategory = this.formValue()?.category;
    if (!selectedCategory) {
      return this.movements();
    }
    return this.movements().filter((m) => m.category === selectedCategory);
  });

  /** Dynamic label for the creator field based on category. */
  designerLabel = computed(() => {
    const category = this.formValue()?.category;
    if (category === 'books') return 'Author';
    if (category === 'music') return 'Artist';
    return 'Designer';
  });

  /** Dynamic label for stylistic movement based on category. */
  movementLabel = computed(() => {
    const category = this.formValue()?.category;
    if (category === 'books' || category === 'music') return 'Genre';
    return 'Movement';
  });

  /**
   * Sets up the debounced search stream for external discovery services.
   * Handles timeouts and error states for robust offline support.
   */
  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((query) => {
          const category = this.acquisitionForm.get('category')?.value;

          this.isSearchingBooks.set(false);
          this.isSearchingMusic.set(false);
          this.searchError.set(null);

          if (!query) {
            this.bookSearchResults.set([]);
            this.albumSearchResults.set([]);
            return of(null);
          }

          if (category === 'books') {
            this.isSearchingBooks.set(true);
            return this.archive.searchBooks(query).pipe(
              timeout(1500),
              map((results) => ({
                data: results?.items || [],
                category: 'books',
              })),
              catchError((err) => {
                const msg =
                  err.name === 'TimeoutError'
                    ? 'API response exceeded 1.5s threshold. Please proceed with manual entry.'
                    : 'External discovery service unreachable. Manual entry enabled.';
                this.searchError.set(msg);
                return of({ data: [], category: 'books' });
              }),
            );
          } else if (category === 'music') {
            this.isSearchingMusic.set(true);
            return this.archive.searchDiscogs(query).pipe(
              timeout(1500),
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
                    ? 'API response exceeded 1.5s threshold. Please proceed with manual entry.'
                    : 'External discovery service unreachable. Manual entry enabled.';
                this.searchError.set(msg);
                return of({ data: [], category: 'music' });
              }),
            );
          }

          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
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

  /**
   * Triggers the external search stream when the nomenclature (name) field changes.
   */
  onNomenclatureChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.acquisitionForm.patchValue({ name: query });
    this.search$.next(query);
  }

  /**
   * Auto-populates the form with metadata from a Google Books volume.
   */
  selectBook(book: Volume): void {
    const volumeInfo = book.volumeInfo;
    const year = volumeInfo.publishedDate
      ? parseInt(volumeInfo.publishedDate.substring(0, 4))
      : this.acquisitionForm.get('year')?.value;

    const imageUrl = volumeInfo.imageLinks?.thumbnail?.replace(
      'http://',
      'https://',
    );

    this.acquisitionForm.patchValue({
      name: volumeInfo.title,
      designer: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
      year: year,
      image: imageUrl || '',
      note: volumeInfo.description || '',
    });

    this.imagePreview.set(imageUrl || null);
    this.bookSearchResults.set([]);
    this.selectedFile.set(null);
  }

  /**
   * Auto-populates the form with metadata from a Discogs release.
   */
  selectDiscogsRelease(release: DiscogsRelease): void {
    const imageUrl = release.cover_image;
    const parts = release.title.split(' - ');
    const artist = parts.length > 1 ? parts[0] : 'Unknown Artist';
    const albumName =
      parts.length > 1 ? parts.slice(1).join(' - ') : release.title;

    this.acquisitionForm.patchValue({
      name: albumName,
      designer: artist,
      year: release.year ? parseInt(release.year, 10) : undefined,
      image: imageUrl || '',
      note: `Format: ${release.format?.join(', ') || 'N/A'}\nLabel: ${
        release.label?.join(', ') || 'N/A'
      }`,
    });

    this.imagePreview.set(imageUrl || null);
    this.albumSearchResults.set([]);
    this.selectedFile.set(null);
  }

  /**
   * Resets searches and contextual fields when the archival category changes.
   */
  onCategoryChange(newCategory: CategoryType): void {
    this.acquisitionForm.patchValue({
      category: newCategory,
      movementId: '',
      room:
        newCategory === 'decor' ? this.acquisitionForm.get('room')?.value : '',
    });
    this.bookSearchResults.set([]);
    this.albumSearchResults.set([]);
  }

  /**
   * Handles local archival photography selection and generates an immediate preview.
   * Enforces a 5MB size limit.
   */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Archival photographs must be less than 5MB.');
        return;
      }
      this.errorMessage.set(null);
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);

      this.acquisitionForm.patchValue({ image: '' });
    }
  }

  /**
   * Validates and submits the archival intake form.
   * Performs duplicate detection before final integration.
   */
  async handleSubmit(): Promise<void> {
    if (this.acquisitionForm.invalid) {
      this.errorMessage.set('Please correct the errors in the form.');
      return;
    }

    const currentItem = this.acquisitionForm.value;
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!currentItem.name) {
      this.errorMessage.set('Object nomenclature is required.');
      return;
    }

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

  /**
   * Proceeds with submission after user acknowledges a potential duplicate.
   */
  async confirmDuplicate(): Promise<void> {
    this.showDuplicateWarning.set(false);
    this.isSubmitting.set(true);
    await this.processSubmission();
  }

  cancelDuplicate(): void {
    this.showDuplicateWarning.set(false);
  }

  /**
   * Orchestrates the final submission: uploading images to storage and registering the record.
   */
  private async processSubmission(): Promise<void> {
    const currentItem = this.acquisitionForm.value;
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

  /**
   * Clears form state and local storage after successful integration.
   */
  private resetForm(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.acquisitionForm.reset({
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
