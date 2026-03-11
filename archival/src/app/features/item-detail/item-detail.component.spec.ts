import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { ItemDetailComponent } from './item-detail.component';
import { ArchiveService } from '../../core/services/archive.service';
import {
  CollectionItem,
  Room,
  UserCollection,
  Movement,
  City,
} from '../../shared/models/archive.models';

// --- Mocks ---
const mockItem: CollectionItem = {
  id: '1',
  name: 'Test Item',
  year: 2023,
  designer: 'Test Designer',
  origin: 'Test Origin',
  image:
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  category: 'decor',
  note: 'Test Note',
  movementId: 'm1',
  movementName: 'Test Movement',
  room: 'r1',
};

class MockArchiveService {
  collection = signal<CollectionItem[]>([mockItem]);
  rooms = signal<Room[]>([{ id: 'r1', name: 'Test Room', x: 0, y: 0 }]);
  userCollections = signal<UserCollection[]>([]);
  movements = signal<Movement[]>([
    {
      id: 'm1',
      name: 'Test Movement',
      category: 'decor',
      era: '2020s',
      description: 'Test Description',
    },
  ]);
  cities = signal<City[]>([]);

  updateItem = jasmine.createSpy('updateItem').and.resolveTo(mockItem);
  deleteItem = jasmine.createSpy('deleteItem').and.resolveTo(undefined);
  addToUserCollection = jasmine
    .createSpy('addToUserCollection')
    .and.resolveTo(undefined);
  uploadImage = jasmine
    .createSpy('uploadImage')
    .and.resolveTo('http://uploaded.com/new.jpg');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('ItemDetailComponent', () => {
  let component: ItemDetailComponent;
  let fixture: ComponentFixture<ItemDetailComponent>;
  let archiveService: MockArchiveService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDetailComponent, FormsModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (_key: string) => '1' }),
          },
        },
        { provide: ArchiveService, useClass: MockArchiveService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
    archiveService = TestBed.inject(
      ArchiveService,
    ) as unknown as MockArchiveService;
    router = TestBed.inject(Router) as unknown as MockRouter;

    fixture.detectChanges(); // ngOnInit will be called
  });

  it('should create and fetch the correct item on init', () => {
    expect(component).toBeTruthy();
    expect(component.item()).toEqual(mockItem);
  });

  it('should identify formatted covers (books/albums)', () => {
    component.item.set({ ...mockItem, image: 'https://books.google.com/test.jpg' });
    expect(component.isFormattedCover()).toBe(true);

    component.item.set({ ...mockItem, image: 'https://discogs.com/test.jpg' });
    expect(component.isFormattedCover()).toBe(true);

    component.item.set({ ...mockItem, image: 'https://other.com/photo.jpg' });
    expect(component.isFormattedCover()).toBe(false);
  });

  it('should compute related items based on designer or movement', () => {
    const item1: CollectionItem = {
      ...mockItem,
      id: '1',
      designer: 'Designer A',
      movementId: 'm1',
    };
    const item2: CollectionItem = {
      ...mockItem,
      id: '2',
      designer: 'Designer A',
      movementId: 'm2',
    }; // Same designer
    const item3: CollectionItem = {
      ...mockItem,
      id: '3',
      designer: 'Designer B',
      movementId: 'm1',
    }; // Same movement
    const item4: CollectionItem = {
      ...mockItem,
      id: '4',
      designer: 'Designer C',
      movementId: 'm3',
    }; // Unrelated

    archiveService.collection.set([item1, item2, item3, item4]);
    component.item.set(item1);

    const related = component.relatedItems();
    expect(related.length).toBe(2);
    expect(related).toContain(item2);
    expect(related).toContain(item3);
    expect(related).not.toContain(item1);
    expect(related).not.toContain(item4);
  });

  it('should filter movements based on the item category', () => {
    // mockItem category is 'decor'
    const decorMovement = {
      id: 'm1',
      name: 'Decor Movement',
      category: 'decor',
      era: '2020s',
      description: 'Test',
    } as Movement;
    const musicMovement = {
      id: 'm2',
      name: 'Music Genre',
      category: 'music',
      era: '2020s',
      description: 'Test',
    } as Movement;

    archiveService.movements.set([decorMovement, musicMovement]);

    expect(component.filteredMovements()).toEqual([decorMovement]);
  });

  it('should start editing by creating a copy of the item and normalizing origin/IDs', () => {
    // cities signal has [{ name: 'Paris', ... }]
    archiveService.cities.set([{ id: 1, name: 'Paris', country: 'France' } as City]);

    const testItem: CollectionItem = {
      ...mockItem,
      origin: 'paris', // Lowercase to test normalization
      roomId: 'r1',
      movementId: 'm1'
    };
    component.item.set(testItem);

    component.startEdit();
    expect(component.isEditing()).toBe(true);
    expect(component.editableItem()?.origin).toBe('Paris');
    expect(component.editableItem()?.room).toBe('r1');
    expect(component.editableItem()?.movementId).toBe('m1');
  });

  it('should save an edit and update the item', async () => {
    component.startEdit();
    const editedName = 'Updated Name';

    // Create a copy of the editable item and modify it
    const editedItem = { ...component.editableItem(), name: editedName };
    component.editableItem.set(editedItem);

    await component.saveEdit();

    // The component now sends a specific set of properties
    const expectedUpdates: Partial<CollectionItem> = {
      name: editedItem.name,
      year: editedItem.year,
      designer: editedItem.designer,
      origin: editedItem.origin,
      note: editedItem.note,
      room: editedItem.room,
      movementId: editedItem.movementId,
      image: editedItem.image,
    };

    expect(archiveService.updateItem).toHaveBeenCalledWith(
      '1',
      expectedUpdates,
    );
    expect(component.isEditing()).toBe(false);
  });

  it('should call uploadImage in saveEdit if a new file is selected', async () => {
    component.startEdit();
    const testFile = new File([''], 'new.jpg', { type: 'image/jpeg' });
    component.selectedFile.set(testFile);

    await component.saveEdit();

    expect(archiveService.uploadImage).toHaveBeenCalledWith(testFile);
    expect(archiveService.updateItem).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.objectContaining({
        image: 'http://uploaded.com/new.jpg',
      }),
    );
  });

  it('should set selectedFile and imagePreview when onFileSelected is called', (done) => {
    const testFile = new File([''], 'test.png', { type: 'image/png' });
    const event = {
      target: {
        files: [testFile],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile()).toBe(testFile);

    // We need to wait for FileReader onload
    setTimeout(() => {
      expect(component.imagePreview()).toBeTruthy();
      done();
    }, 100);
  });

  it('should open delete confirmation modal when deleteItem is called', () => {
    component.deleteItem();
    expect(component.deleteConfirmOpen()).toBe(true);
  });

  it('should call archiveService.deleteItem and navigate on confirmDelete', async () => {
    component.deleteConfirmOpen.set(true);
    await component.confirmDelete();
    expect(archiveService.deleteItem).toHaveBeenCalledWith('1');
    expect(router.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(component.deleteConfirmOpen()).toBe(false);
  });

  it('should close the modal and not delete on cancelDelete', () => {
    component.deleteConfirmOpen.set(true);
    component.cancelDelete();
    expect(component.deleteConfirmOpen()).toBe(false);
    expect(archiveService.deleteItem).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should open the collection picker modal', () => {
    component.openCollectionPicker();
    expect(component.collectionPickerOpen()).toBe(true);
  });

  it('should add item to collection and close the picker', () => {
    const collectionId = 'c1';
    component.openCollectionPicker();
    component.addToCollection(collectionId);
    expect(archiveService.addToUserCollection).toHaveBeenCalledWith(
      collectionId,
      '1',
    );
    expect(component.collectionPickerOpen()).toBe(false);
  });
});
