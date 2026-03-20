import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CollectionsComponent } from './collections.component';
import { ArchiveService } from '../../core/services/archive.service';
import {
  CollectionItem,
  UserCollection,
} from '../../shared/models/archive.models';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('CollectionsComponent', () => {
  let component: CollectionsComponent;
  let fixture: ComponentFixture<CollectionsComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  const mockItems: CollectionItem[] = [
    {
      id: '1',
      name: 'Item 1',
      category: 'decor',
      origin: 'orig1',
      year: 2020,
      image: '',
      designer: '',
      note: '',
      movementId: '',
      room: '',
      movementName: '',
    },
    {
      id: '2',
      name: 'Item 2',
      category: 'music',
      origin: 'orig2',
      year: 1995,
      image: '',
      designer: '',
      note: '',
      movementId: '',
      room: '',
      movementName: '',
    },
  ];

  const mockUserCollections: UserCollection[] = [
    { id: '1', title: 'Collection 1', itemIds: ['1', '2'] },
    { id: '2', title: 'Collection 2', itemIds: ['2'] },
  ];

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      ['addCollection', 'deleteCollection', 'removeFromCollection'],
      {
        collection: signal(mockItems),
        userCollections: signal(mockUserCollections),
        loading: signal(false),
      },
    );

    await TestBed.configureTestingModule({
      imports: [CollectionsComponent, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArchiveService, useValue: mockArchiveService },
        { provide: ActivatedRoute, useValue: { paramMap: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render existing collections and their items', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const collectionElements = compiled.querySelectorAll('.collection-card');
    expect(collectionElements.length).toBe(2);

    const firstCollection = collectionElements[0];
    const firstCollectionItems = firstCollection.querySelectorAll(
      '.item-thumb-wrapper',
    );
    expect(firstCollectionItems.length).toBe(2);
    expect(firstCollection.querySelector('.col-title')?.textContent).toContain(
      'Collection 1',
    );
    expect(
      firstCollectionItems[0].querySelector('.thumb-label')?.textContent,
    ).toContain('Item 1');
    expect(
      firstCollectionItems[1].querySelector('.thumb-label')?.textContent,
    ).toContain('Item 2');
  });

  it('should add a new collection', () => {
    component.newCollectionTitle.set('New Collection');
    component.createCollection();
    expect(mockArchiveService.addCollection).toHaveBeenCalledWith(
      'New Collection',
    );
    expect(component.newCollectionTitle()).toBe('');
  });

  it('should open delete confirmation modal when deleteCollection is called', () => {
    component.deleteCollection('1');
    expect(component.deleteConfirmOpen()).toBe(true);
    expect(component.collectionToDelete()?.id).toBe('1');
  });

  it('should call archiveService.deleteCollection and close modal on confirmDelete', async () => {
    component.collectionToDelete.set({ id: '1', title: 'Collection 1' });
    component.deleteConfirmOpen.set(true);

    await component.confirmDelete();

    expect(mockArchiveService.deleteCollection).toHaveBeenCalledWith('1');
    expect(component.deleteConfirmOpen()).toBe(false);
    expect(component.collectionToDelete()).toBeNull();
  });

  it('should close the modal and not delete on closeDeleteModal', () => {
    component.collectionToDelete.set({ id: '1', title: 'Collection 1' });
    component.deleteConfirmOpen.set(true);

    component.closeDeleteModal();

    expect(component.deleteConfirmOpen()).toBe(false);
    expect(component.collectionToDelete()).toBeNull();
    expect(mockArchiveService.deleteCollection).not.toHaveBeenCalled();
  });

  it('should remove an item from a collection', () => {
    component.removeFromCollection('1', '1');
    expect(mockArchiveService.removeFromCollection).toHaveBeenCalledWith(
      '1',
      '1',
    );
  });
});
