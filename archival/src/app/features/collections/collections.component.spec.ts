import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CollectionsComponent } from './collections.component';
import { ArchiveService } from '../../core/services/archive.service';
import { MockArchiveService } from '../../core/services/archive.service.mock';
import { CollectionItem, UserCollection } from '../../shared/models/archive.models';
import { FormsModule } from '@angular/forms';

describe('CollectionsComponent', () => {
  let component: CollectionsComponent;
  let fixture: ComponentFixture<CollectionsComponent>;
  let service: MockArchiveService;

  const mockItems: CollectionItem[] = [
    { id: '1', name: 'Item 1', category: 'decor', origin: 'orig1', year: 2020, image: '', designer: '', note: '', movementId: '', room: '', movementName: '' },
    { id: '2', name: 'Item 2', category: 'music', origin: 'orig2', year: 1995, image: '', designer: '', note: '', movementId: '', room: '', movementName: '' },
  ];

  const mockUserCollections: UserCollection[] = [
    { id: '1', title: 'Collection 1', itemIds: ['1', '2'] },
    { id: '2', title: 'Collection 2', itemIds: ['2'] },
  ];

  beforeEach(async () => {
    const mockArchiveService = new MockArchiveService();
    mockArchiveService.collection.set(mockItems);
    mockArchiveService.userCollections.set(mockUserCollections);

    await TestBed.configureTestingModule({
      imports: [CollectionsComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ArchiveService) as MockArchiveService;
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
    const firstCollectionItems = firstCollection.querySelectorAll('.item-thumb-wrapper');
    expect(firstCollectionItems.length).toBe(2);
    expect(firstCollection.querySelector('.col-title')?.textContent).toContain('Collection 1');
    expect(firstCollectionItems[0].querySelector('.thumb-label')?.textContent).toContain('Item 1');
    expect(firstCollectionItems[1].querySelector('.thumb-label')?.textContent).toContain('Item 2');
  });

  it('should add a new collection', () => {
    spyOn(service, 'addCollection');
    component.newCollectionTitle.set('New Collection');
    component.createCollection();
    expect(service.addCollection).toHaveBeenCalledWith('New Collection');
    expect(component.newCollectionTitle()).toBe('');
  });

  it('should delete a collection', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(service, 'deleteCollection');
    component.deleteCollection('1');
    expect(window.confirm).toHaveBeenCalled();
    expect(service.deleteCollection).toHaveBeenCalledWith('1');
  });

  it('should not delete a collection if confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(service, 'deleteCollection');
    component.deleteCollection('1');
    expect(window.confirm).toHaveBeenCalled();
    expect(service.deleteCollection).not.toHaveBeenCalled();
  });

  it('should remove an item from a collection', () => {
    spyOn(service, 'removeFromCollection');
    component.removeFromCollection('1', '1');
    expect(service.removeFromCollection).toHaveBeenCalledWith('1', '1');
  });
});
