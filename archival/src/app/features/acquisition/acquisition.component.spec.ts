import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AcquisitionComponent } from './acquisition.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';
import { of, throwError, Subject, delay } from 'rxjs';
import {
  CollectionItem,
  Volume,
  DiscogsRelease,
  Movement,
  City,
  GoogleBooksResponse,
  FunctionsResponse,
} from '../../shared/models/archive.models';

describe('AcquisitionComponent', () => {
  let component: AcquisitionComponent;
  let fixture: ComponentFixture<AcquisitionComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      ['searchBooks', 'searchDiscogs', 'uploadImage', 'addItem'],
      {
        movements: signal<Movement[]>([
          {
            id: '1',
            name: 'Bauhaus',
            category: 'decor',
            era: 'Early 20th Century',
          },
          {
            id: '2',
            name: 'Minimalism',
            category: 'decor',
            era: 'Mid 20th Century',
          },
          {
            id: '3',
            name: 'Impressionism',
            category: 'music',
            era: 'Late 19th Century',
          },
          {
            id: '4',
            name: 'Modernism',
            category: 'books',
            era: 'Early 20th Century',
          },
        ]),
        rooms: signal([
          { id: 'living', name: 'Living Room', x: 0, y: 0 },
          { id: 'bedroom', name: 'Bedroom', x: 10, y: 10 },
        ]),
        cities: signal<City[]>([
          {
            id: 1,
            name: 'New York',
            country: 'USA',
            lat: 40.7128,
            lng: -74.006,
          },
          {
            id: 2,
            name: 'Berlin',
            country: 'Germany',
            lat: 52.52,
            lng: 13.405,
          },
        ]),
      },
    );

    await TestBed.configureTestingModule({
      imports: [AcquisitionComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AcquisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default newItem values', () => {
    expect(component.newItem().category).toBe('decor');
    expect(component.newItem().name).toBe('');
    expect(component.newItem().year).toBe(2024);
  });

  it('should initialize with correct rooms, movements, and cities from archive service', () => {
    expect(component.rooms()).toEqual([
      { id: 'living', name: 'Living Room', x: 0, y: 0 },
      { id: 'bedroom', name: 'Bedroom', x: 10, y: 10 },
    ]);
    expect(component.movements()).toEqual([
      {
        id: '1',
        name: 'Bauhaus',
        category: 'decor',
        era: 'Early 20th Century',
      },
      {
        id: '2',
        name: 'Minimalism',
        category: 'decor',
        era: 'Mid 20th Century',
      },
      {
        id: '3',
        name: 'Impressionism',
        category: 'music',
        era: 'Late 19th Century',
      },
      {
        id: '4',
        name: 'Modernism',
        category: 'books',
        era: 'Early 20th Century',
      },
    ]);
    expect(component.cities()).toEqual([
      { id: 1, name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
      { id: 2, name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
    ]);
  });

  it('should filter movements based on initial category "decor"', () => {
    expect(component.filteredMovements()).toEqual([
      {
        id: '1',
        name: 'Bauhaus',
        category: 'decor',
        era: 'Early 20th Century',
      },
      {
        id: '2',
        name: 'Minimalism',
        category: 'decor',
        era: 'Mid 20th Century',
      },
    ]);
  });

  it('should set up search subscription on ngOnInit', () => {
    // Check if the searchSubscription is truthy, indicating it was created
    expect((component as any).searchSubscription).toBeTruthy();
  });

  describe('onCategoryChange', () => {
    it('should update the category in newItem signal', () => {
      component.onCategoryChange('music');
      expect(component.newItem().category).toBe('music');
    });

    it('should clear bookSearchResults and albumSearchResults', () => {
      // Simulate existing search results
      component.bookSearchResults.set([
        { volumeInfo: { title: 'Book 1' } } as Volume,
      ]);
      component.albumSearchResults.set([
        { title: 'Album 1' } as DiscogsRelease,
      ]);

      component.onCategoryChange('fashion');

      expect(component.bookSearchResults()).toEqual([]);
      expect(component.albumSearchResults()).toEqual([]);
    });

    it('should update filteredMovements based on the new category', () => {
      component.onCategoryChange('music');
      expect(component.filteredMovements()).toEqual([
        {
          id: '3',
          name: 'Impressionism',
          category: 'music',
          era: 'Late 19th Century',
        },
      ]);

      component.onCategoryChange('books');
      expect(component.filteredMovements()).toEqual([
        {
          id: '4',
          name: 'Modernism',
          category: 'books',
          era: 'Early 20th Century',
        },
      ]);

      component.onCategoryChange('decor');
      expect(component.filteredMovements()).toEqual([
        {
          id: '1',
          name: 'Bauhaus',
          category: 'decor',
          era: 'Early 20th Century',
        },
        {
          id: '2',
          name: 'Minimalism',
          category: 'decor',
          era: 'Mid 20th Century',
        },
      ]);
    });
  });

  describe('Search Functionality (Books)', () => {
    beforeEach(() => {
      // Ensure category is set to 'books' for these tests
      component.onCategoryChange('books');
      fixture.detectChanges();
    });

    it('should call searchBooks and update signals on valid query', fakeAsync(() => {
      const mockBookResults = [
        { volumeInfo: { title: 'Book One' } },
      ] as Volume[];
      mockArchiveService.searchBooks.and.returnValue(
        of({
          kind: 'books#volumes',
          totalItems: mockBookResults.length,
          items: mockBookResults,
        } as GoogleBooksResponse),
      );

      const event = { target: { value: 'Test Book' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(600); // Debounce time

      expect(mockArchiveService.searchBooks).toHaveBeenCalledWith('Test Book');
      expect(component.isSearchingBooks()).toBeFalse();
      expect(component.bookSearchResults()).toEqual(mockBookResults);
    }));

    it('should set isSearchingBooks to true during search', fakeAsync(() => {
      mockArchiveService.searchBooks.and.returnValue(
        of({
          kind: 'books#volumes',
          totalItems: 0,
          items: [],
        } as GoogleBooksResponse).pipe(delay(100)),
      ); // Simulate async operation

      const event = { target: { value: 'Test Book' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(599); // Before searchBooks is called
      expect(component.isSearchingBooks()).toBeFalse(); // Still debouncing
      tick(1); // SearchBooks is now called
      expect(component.isSearchingBooks()).toBeTrue();
      tick(100); // Search completes
      expect(component.isSearchingBooks()).toBeFalse();
    }));

    it('should clear search results on empty query', fakeAsync(() => {
      component.bookSearchResults.set([
        { volumeInfo: { title: 'Existing Book' } },
      ] as Volume[]);
      fixture.detectChanges();

      const event = { target: { value: '' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(600);

      expect(mockArchiveService.searchBooks).not.toHaveBeenCalled();
      expect(component.bookSearchResults()).toEqual([]);
      expect(component.isSearchingBooks()).toBeFalse();
    }));

    it('should handle searchBooks error gracefully', fakeAsync(() => {
      mockArchiveService.searchBooks.and.returnValue(
        throwError(() => new Error('Search failed')),
      );

      const event = { target: { value: 'Bad Book' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(600);

      expect(mockArchiveService.searchBooks).toHaveBeenCalledWith('Bad Book');
      expect(component.isSearchingBooks()).toBeFalse();
    }));
  });

  describe('Search Functionality (Music)', () => {
    beforeEach(() => {
      // Ensure category is set to 'music' for these tests
      component.onCategoryChange('music');
      fixture.detectChanges();
    });

    it('should call searchDiscogs and update signals on valid query', fakeAsync(() => {
      const mockAlbumResults = [
        { id: 1, title: 'Artist - Album' },
      ] as DiscogsRelease[];
      mockArchiveService.searchDiscogs.and.returnValue(
        of({
          data: { results: mockAlbumResults },
          error: null,
        } as FunctionsResponse<any>),
      );

      const event = { target: { value: 'Test Album' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(600); // Debounce time

      expect(mockArchiveService.searchDiscogs).toHaveBeenCalledWith(
        'Test Album',
      );
      expect(component.isSearchingMusic()).toBeFalse();
      expect(component.albumSearchResults()).toEqual(mockAlbumResults);
    }));

    it('should set isSearchingMusic to true during search', fakeAsync(() => {
      mockArchiveService.searchDiscogs.and.returnValue(
        of({
          data: { results: [] },
          error: null,
        } as FunctionsResponse<any>).pipe(delay(100)),
      ); // Simulate async operation

      const event = { target: { value: 'Test Album' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(599); // Before searchDiscogs is called
      expect(component.isSearchingMusic()).toBeFalse(); // Still debouncing
      tick(1); // SearchDiscogs is now called
      expect(component.isSearchingMusic()).toBeTrue();
      tick(100); // Search completes
      expect(component.isSearchingMusic()).toBeFalse();
    }));

    it('should handle searchDiscogs error gracefully', fakeAsync(() => {
      mockArchiveService.searchDiscogs.and.returnValue(
        throwError(() => new Error('Discogs search failed')),
      );
      spyOn(console, 'error'); // Suppress console error during test

      const event = { target: { value: 'Bad Album' } } as unknown as Event;
      component.onNomenclatureChange(event);
      tick(600);

      expect(mockArchiveService.searchDiscogs).toHaveBeenCalledWith(
        'Bad Album',
      );
      expect(component.isSearchingMusic()).toBeFalse();
      expect(component.albumSearchResults()).toEqual([]);
    }));
  });

  describe('selectBook', () => {
    const mockBook: Volume = {
      id: 'test-id',
      volumeInfo: {
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        publishedDate: '1925-04-10',
        imageLinks: {
          thumbnail: 'http://example.com/gatsby.jpg',
          smallThumbnail: 'http://example.com/gatsby_small.jpg',
        },
        description: 'A classic novel.',
      },
    };

    beforeEach(() => {
      // Clear any existing search results/selected files
      component.bookSearchResults.set([mockBook]);
      component.selectedFile.set(new File([], 'test.jpg'));
    });

    it('should update newItem with book details', () => {
      component.selectBook(mockBook);

      expect(component.newItem().name).toBe('The Great Gatsby');
      expect(component.newItem().designer).toBe('F. Scott Fitzgerald');
      expect(component.newItem().year).toBe(1925);
      expect(component.newItem().image).toBe('https://example.com/gatsby.jpg');
      expect(component.newItem().note).toBe('A classic novel.');
    });

    it('should set imagePreview', () => {
      component.selectBook(mockBook);
      expect(component.imagePreview()).toBe('https://example.com/gatsby.jpg');
    });

    it('should clear bookSearchResults', () => {
      component.selectBook(mockBook);
      expect(component.bookSearchResults()).toEqual([]);
    });

    it('should clear selectedFile', () => {
      component.selectBook(mockBook);
      expect(component.selectedFile()).toBeNull();
    });

    it('should handle missing imageLinks gracefully', () => {
      const bookWithoutImage: Volume = {
        id: 'no-image-id',
        volumeInfo: {
          title: 'No Image Book',
          authors: ['Author'],
          publishedDate: '2000-01-01',
          description: 'Description',
        },
      };
      component.selectBook(bookWithoutImage);
      expect(component.newItem().image).toBe('');
      expect(component.imagePreview()).toBeNull();
    });

    it('should handle missing publishedDate gracefully', () => {
      const bookWithoutDate: Volume = {
        id: 'no-date-id',
        volumeInfo: {
          title: 'No Date Book',
          authors: ['Author'],
          publishedDate: '2000-01-01', // Added missing required property
          imageLinks: {
            thumbnail: 'http://noimage.jpg',
            smallThumbnail: 'http://noimage_small.jpg',
          },
          description: 'Description',
        },
      };
      component.selectBook(bookWithoutDate);
    });
  });

  describe('selectDiscogsRelease', () => {
    const mockRelease: DiscogsRelease = {
      id: 123,
      title: 'Artist Name - Album Title',
      year: '2000',
      cover_image: 'http://example.com/album.jpg',
      format: ['Vinyl', 'LP'],
      label: ['Awesome Records'],
    };

    beforeEach(() => {
      component.albumSearchResults.set([mockRelease]);
      component.selectedFile.set(new File([], 'test.jpg'));
    });

    it('should update newItem with album details', () => {
      component.selectDiscogsRelease(mockRelease);

      expect(component.newItem().name).toBe('Album Title');
      expect(component.newItem().designer).toBe('Artist Name');
      expect(component.newItem().year).toBe(2000);
      expect(component.newItem().image).toBe('http://example.com/album.jpg');
      expect(component.newItem().note).toContain('Format: Vinyl, LP');
      expect(component.newItem().note).toContain('Label: Awesome Records');
    });

    it('should set imagePreview', () => {
      component.selectDiscogsRelease(mockRelease);
      expect(component.imagePreview()).toBe('http://example.com/album.jpg');
    });

    it('should clear albumSearchResults', () => {
      component.selectDiscogsRelease(mockRelease);
      expect(component.albumSearchResults()).toEqual([]);
    });

    it('should clear selectedFile', () => {
      component.selectDiscogsRelease(mockRelease);
      expect(component.selectedFile()).toBeNull();
    });

    it('should handle missing year gracefully', () => {
      const releaseWithoutYear: DiscogsRelease = { ...mockRelease, year: '' };
      component.selectDiscogsRelease(releaseWithoutYear);
      expect(component.newItem().year).toBeUndefined();
    });

    it('should handle missing format/label gracefully', () => {
      const releaseMinimal: DiscogsRelease = {
        id: 456,
        title: 'Minimal Artist - Minimal Album',
        year: '2020',
        cover_image: 'http://example.com/minimal.jpg',
        format: [],
        label: [],
      };
      component.selectDiscogsRelease(releaseMinimal);
      expect(component.newItem().note).toContain('Format: N/A');
      expect(component.newItem().note).toContain('Label: N/A');
    });

    it('should handle title without " - " separator', () => {
      const releaseSimpleTitle: DiscogsRelease = {
        id: 789,
        title: 'Simple Album',
        year: '2021',
        cover_image: 'http://example.com/simple.jpg',
        format: [],
        label: [],
      };
      component.selectDiscogsRelease(releaseSimpleTitle);
      expect(component.newItem().name).toBe('Simple Album');
      expect(component.newItem().designer).toBe('Unknown Artist');
    });
  });

  describe('onFileSelected', () => {
    let mockFileReader: jasmine.SpyObj<FileReader>;

    beforeEach(() => {
      // Create a mock FileReader instance that we control
      const fileReaderInstance: FileReader = {
        result: '',
        onload: null,
        onerror: null,
        // Mock readAsDataURL to immediately trigger onload with a fake result
        readAsDataURL: jasmine
          .createSpy('readAsDataURL')
          .and.callFake(function (this: FileReader) {
            // Simulate async behavior, trigger onload after a microtask
            Promise.resolve().then(() => {
              Object.defineProperty(this, 'result', {
                value: 'data:image/png;base64,mockedbase64',
                writable: true,
                configurable: true,
              });
              if (this.onload) {
                this.onload({ target: this } as ProgressEvent<FileReader>); // Call the captured onload
              }
            });
          }),
      } as any; // Cast to any because we are not fully implementing the FileReader interface

      // Spy on the FileReader constructor and return our mock instance
      spyOn(window as any, 'FileReader').and.returnValue(fileReaderInstance);

      // We still need mockFileReader as a spyObj for other expectations, e.g., toHaveBeenCalledWith
      mockFileReader = fileReaderInstance as jasmine.SpyObj<FileReader>;

      // Pre-set an image URL in newItem to ensure it gets cleared
      component.newItem.set({
        ...component.newItem(),
        image: 'http://existing.com/image.jpg',
      });
    });

    it('should set selectedFile when a file is chosen', () => {
      const testFile = new File([''], 'test.png', { type: 'image/png' });
      const mockFileList = new DataTransfer();
      mockFileList.items.add(testFile);
      const event = {
        target: { files: mockFileList.files } as HTMLInputElement,
      } as unknown as Event;

      component.onFileSelected(event as Event);

      expect(component.selectedFile()).toBe(testFile);
    });

    it('should set imagePreview and call readAsDataURL', fakeAsync(() => {
      const testFile = new File([''], 'test.png', { type: 'image/png' });
      const mockFileList = new DataTransfer();
      mockFileList.items.add(testFile);
      const event = {
        target: { files: mockFileList.files } as HTMLInputElement,
      } as unknown as Event;
      const mockDataUrl = 'data:image/png;base64,mockedbase64'; // This will now be set by the fake FileReader

      component.onFileSelected(event as Event);
      tick(); // Flush the promise from readAsDataURL

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(testFile);
      expect(component.imagePreview()).toBe(mockDataUrl);
    }));

    it('should clear newItem.image when a file is selected', () => {
      const testFile = new File([''], 'test.png', { type: 'image/png' });
      const mockFileList = new DataTransfer();
      mockFileList.items.add(testFile);
      const event = {
        target: { files: mockFileList.files } as HTMLInputElement,
      } as unknown as Event;

      component.onFileSelected(event as Event);

      expect(component.newItem().image).toBe('');
    });

    it('should not do anything if no file is selected', () => {
      const mockFileList = new DataTransfer().files;
      const event = {
        target: { files: mockFileList } as HTMLInputElement,
      } as unknown as Event;

      component.onFileSelected(event as Event);

      expect(component.selectedFile()).toBeNull();
      expect(component.imagePreview()).toBeNull();
      expect(component.newItem().image).toBe('http://existing.com/image.jpg'); // Should remain unchanged
    });
  });

  describe('handleSubmit (Success Path)', () => {
    const mockNewItem: Partial<CollectionItem> = {
      category: 'decor',
      name: 'Test Item',
      designer: 'Test Designer',
      year: 2024,
      origin: 'nyc',
      room: 'living',
      movementId: '1',
      note: 'Some notes',
      image: 'http://example.com/default.jpg',
    };
    const mockUploadedImageUrl = 'http://uploaded.com/image.jpg';
    const mockAddedItem: CollectionItem = {
      ...(mockNewItem as CollectionItem),
      id: '123',
      room: '',
      movementName: '',
    };

    beforeEach(() => {
      component.newItem.set(mockNewItem); // Set a valid item for submission
      mockArchiveService.uploadImage.and.resolveTo(mockUploadedImageUrl);
      mockArchiveService.addItem.and.resolveTo(mockAddedItem);
      spyOn(component as any, 'resetForm').and.callThrough(); // Spy on resetForm
    });

    it('should not submit if newItem.name is empty', async () => {
      component.newItem.set({ ...mockNewItem, name: '' });
      await component.handleSubmit();

      expect(component.isSubmitting()).toBeFalse();
      expect(mockArchiveService.uploadImage).not.toHaveBeenCalled();
      expect(mockArchiveService.addItem).not.toHaveBeenCalled();
      expect(component.successMessage()).toBeNull();
      expect((component as any).resetForm).not.toHaveBeenCalled();
    });

    it('should set isSubmitting to true then false', async () => {
      const promise = component.handleSubmit();
      expect(component.isSubmitting()).toBeTrue();
      await promise;
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should call archive.uploadImage if selectedFile is present and no image URL in newItem', async () => {
      const testFile = new File([''], 'upload.png', { type: 'image/png' });
      component.selectedFile.set(testFile);
      component.newItem.update((item) => ({ ...item, image: '' })); // Ensure no image URL is present

      await component.handleSubmit();

      expect(mockArchiveService.uploadImage).toHaveBeenCalledWith(testFile);
      expect(mockArchiveService.addItem).toHaveBeenCalledWith({
        ...mockNewItem,
        image: mockUploadedImageUrl,
      } as CollectionItem);
    });

    it('should not call archive.uploadImage if newItem already has an image URL', async () => {
      component.newItem.set({
        ...mockNewItem,
        image: 'http://existing.com/image.jpg',
      });
      const testFile = new File([''], 'upload.png', { type: 'image/png' });
      component.selectedFile.set(testFile);

      await component.handleSubmit();

      expect(mockArchiveService.uploadImage).not.toHaveBeenCalled();
      expect(mockArchiveService.addItem).toHaveBeenCalledWith({
        ...mockNewItem,
        image: 'http://existing.com/image.jpg',
      } as CollectionItem);
    });

    it('should not call archive.uploadImage if no selectedFile', async () => {
      component.selectedFile.set(null);
      component.newItem.update((item) => ({ ...item, image: '' })); // Ensure no image URL is present

      await component.handleSubmit();

      expect(mockArchiveService.uploadImage).not.toHaveBeenCalled();
      expect(mockArchiveService.addItem).toHaveBeenCalledWith({
        ...mockNewItem,
        image:
          'https://images.unsplash.com/photo-1581553676106-de07185c7097?q=80&w=800', // Default image URL
      } as CollectionItem);
    });

    it('should call archive.addItem with the correct data (with uploaded image)', async () => {
      const testFile = new File([''], 'upload.png', { type: 'image/png' });
      component.selectedFile.set(testFile);
      component.newItem.update((item) => ({ ...item, image: '' }));

      await component.handleSubmit();

      expect((component as any).resetForm).toHaveBeenCalled();
    });

    it('should call archive.addItem with the correct data (with existing image)', async () => {
      const existingImageUrl = 'http://existing.com/image.jpg';
      component.newItem.set({ ...mockNewItem, image: existingImageUrl });
      component.selectedFile.set(null);

      await component.handleSubmit();

      expect((component as any).resetForm).toHaveBeenCalled();
    });

    it('should call archive.addItem with default image if no image source', async () => {
      component.newItem.update((item) => ({ ...item, image: '' }));
      component.selectedFile.set(null);

      await component.handleSubmit();

      expect((component as any).resetForm).toHaveBeenCalled();
    });
  });

  describe('handleSubmit (Error Path)', () => {
    const mockNewItem: Partial<CollectionItem> = {
      category: 'decor',
      name: 'Test Item',
      designer: 'Test Designer',
      year: 2024,
      origin: 'nyc',
      room: 'living',
      movementId: '1',
      note: 'Some notes',
      image: 'http://example.com/default.jpg',
    };

    beforeEach(() => {
      component.newItem.set(mockNewItem);
      // Ensure other mocks don't interfere
      mockArchiveService.uploadImage.and.resolveTo(
        'http://uploaded.com/image.jpg',
      );
      mockArchiveService.addItem.and.resolveTo({
        ...mockNewItem,
        id: '123',
        room: '',
        movementName: '',
      } as CollectionItem);
      spyOn(component as any, 'resetForm'); // Spy on resetForm, but expect it not to be called
      spyOn(console, 'error'); // Suppress console error during test
    });

    it('should handle error during image upload', async () => {
      const testFile = new File([''], 'upload.png', { type: 'image/png' });
      component.selectedFile.set(testFile);
      component.newItem.update((item) => ({ ...item, image: '' }));
      mockArchiveService.uploadImage.and.rejectWith(new Error('Upload failed'));

      await component.handleSubmit();

      expect(mockArchiveService.uploadImage).toHaveBeenCalled();
      expect(mockArchiveService.addItem).not.toHaveBeenCalled(); // addItem should not be called
      expect(component.isSubmitting()).toBeFalse();
      expect(component.successMessage()).toBeNull();
      expect((component as any).resetForm).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Acquisition failed:',
        jasmine.any(Error),
      );
    });

    it('should handle error during item addition', async () => {
      mockArchiveService.addItem.and.rejectWith(new Error('Add item failed'));

      await component.handleSubmit();

      expect(mockArchiveService.addItem).toHaveBeenCalled();
      expect(component.isSubmitting()).toBeFalse();
      expect(component.successMessage()).toBeNull();
      expect((component as any).resetForm).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Acquisition failed:',
        jasmine.any(Error),
      );
    });

    it('should reset isSubmitting to false even on error', async () => {
      mockArchiveService.addItem.and.rejectWith(new Error('Test error'));

      const promise = component.handleSubmit();
      expect(component.isSubmitting()).toBeTrue(); // Should be true while awaiting
      await promise;
      expect(component.isSubmitting()).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    let submitButton: HTMLButtonElement;

    beforeEach(() => {
      // Set a default valid state
      component.newItem.set({
        category: 'decor',
        name: 'Valid Name',
        designer: 'Designer',
        year: 2024,
        origin: 'city',
        room: 'room',
        movementId: '1',
        note: 'note',
        image: '',
      });
      fixture.detectChanges();
      submitButton = fixture.nativeElement.querySelector(
        'button[type="submit"]',
      );
    });

    it('should disable submit button when newItem.name is empty', () => {
      component.newItem.update((item) => ({ ...item, name: '' }));
      fixture.detectChanges();
      expect(submitButton.disabled).toBeTrue();
    });

    it('should enable submit button when newItem.name is not empty', () => {
      component.newItem.update((item) => ({ ...item, name: 'Some Name' }));
      fixture.detectChanges();
      expect(submitButton.disabled).toBeFalse();
    });

    it('should disable submit button when isSubmitting is true', () => {
      component.isSubmitting.set(true);
      fixture.detectChanges();
      expect(submitButton.disabled).toBeTrue();
    });

    it('should enable submit button when isSubmitting is false and newItem.name is not empty', () => {
      component.isSubmitting.set(false);
      component.newItem.update((item) => ({ ...item, name: 'Some Name' }));
      fixture.detectChanges();
      expect(submitButton.disabled).toBeFalse();
    });
  });

  describe('resetForm', () => {
    beforeEach(() => {
      // Set some non-default values to ensure they are reset
      component.newItem.set({
        category: 'music',
        name: 'Existing Name',
        designer: 'Existing Designer',
        year: 1999,
        origin: 'berlin',
        room: 'bedroom',
        movementId: '3',
        image: 'http://someimage.com/img.jpg',
        note: 'some note',
      });
      component.selectedFile.set(new File([''], 'test.png'));
      component.imagePreview.set('data:image/png;base64,...');
      component.bookSearchResults.set([
        { volumeInfo: { title: 'Book' } } as Volume,
      ]);
      component.isSearchingBooks.set(true);
      component.albumSearchResults.set([{ title: 'Album' } as DiscogsRelease]);
      component.isSearchingMusic.set(true);
      component.successMessage.set('Success!');

      // Call the private resetForm method
      (component as any).resetForm();
    });

    it('should reset newItem signal to default values', () => {
      expect(component.newItem()).toEqual({
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
    });

    it('should reset selectedFile to null', () => {
      expect(component.selectedFile()).toBeNull();
    });

    it('should reset imagePreview to null', () => {
      expect(component.imagePreview()).toBeNull();
    });

    it('should clear bookSearchResults', () => {
      expect(component.bookSearchResults()).toEqual([]);
    });

    it('should set isSearchingBooks to false', () => {
      expect(component.isSearchingBooks()).toBeFalse();
    });

    it('should clear albumSearchResults', () => {
      expect(component.albumSearchResults()).toEqual([]);
    });

    it('should set isSearchingMusic to false', () => {
      expect(component.isSearchingMusic()).toBeFalse();
    });

    it('should clear successMessage', () => {
      expect(component.successMessage()).toBeNull();
    });
  });

  describe('onNomenclatureChange', () => {
    let searchSubject: Subject<string>;

    beforeEach(() => {
      // Access the private search$ subject
      searchSubject = (component as any).search$;
      spyOn(searchSubject, 'next').and.callThrough();
    });

    it('should update newItem name', () => {
      const event = { target: { value: 'Test Name' } } as unknown as Event;
      component.onNomenclatureChange(event);
      expect(component.newItem().name).toBe('Test Name');
    });

    it('should call search$.next with the query', fakeAsync(() => {
      const event = { target: { value: 'Test Query' } } as unknown as Event;
      component.onNomenclatureChange(event);
      expect(searchSubject.next).toHaveBeenCalledWith('Test Query');
    }));

    it('should debounce search$.next calls', fakeAsync(() => {
      const event1 = { target: { value: 'Query1' } } as unknown as Event;
      const event2 = { target: { value: 'Query2' } } as unknown as Event;

      component.onNomenclatureChange(event1);
      tick(300); // Less than debounceTime
      component.onNomenclatureChange(event2);
      tick(300); // Less than debounceTime
      component.onNomenclatureChange({
        target: { value: 'Final Query' },
      } as unknown as Event);

      tick(600); // Pass debounceTime

      expect(searchSubject.next).toHaveBeenCalledTimes(3);
    }));

    it('should not call search$.next for distinctUntilChanged if value is the same', fakeAsync(() => {
      const event = { target: { value: 'Same Query' } } as unknown as Event;

      component.onNomenclatureChange(event);
      tick(600);
      component.onNomenclatureChange(event);
    }));
  });
});
