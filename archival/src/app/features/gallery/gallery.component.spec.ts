import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GalleryComponent } from './gallery.component';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;
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
    {
      id: '3',
      name: 'Item 3',
      category: 'decor',
      origin: 'orig1',
      year: 2021,
      image: '',
      designer: '',
      note: '',
      movementId: '',
      room: '',
      movementName: '',
    },
  ];

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj('ArchiveService', ['setFilter'], {
      collection: signal(mockItems),
      loading: signal(false),
      isOnline: signal(true),
    });

    await TestBed.configureTestingModule({
      imports: [GalleryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArchiveService, useValue: mockArchiveService },
        { provide: ActivatedRoute, useValue: { paramMap: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all items initially', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(3);
  });

  it('should have "all" at the top of all filter options', () => {
    const options = component.filterOptions();
    expect(options.category[0]).toBe('all');
    expect(options.origin[0]).toBe('all');
    expect(options.movement[0]).toBe('all');
    expect(options.era[0]).toBe('all');
  });

  it('should filter items by category', () => {
    component.setFilter('category', 'music');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(1);
    expect(itemElements[0].querySelector('.item-name')?.textContent).toContain(
      'Item 2',
    );
  });

  it('should filter items by origin', () => {
    component.setFilter('origin', 'orig2');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(1);
    expect(itemElements[0].querySelector('.item-name')?.textContent).toContain(
      'Item 2',
    );
  });

  it('should filter items by era', () => {
    component.setFilter('era', '1990s');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(1);
    expect(itemElements[0].querySelector('.item-name')?.textContent).toContain(
      'Item 2',
    );
  });

  it('should filter items by movement', () => {
    // Add movement name to one of the items
    const items = [...mockItems];
    items[1].movementName = 'Bauhaus';
    mockArchiveService.collection.set(items);
    fixture.detectChanges();

    component.setFilter('movement', 'Bauhaus');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(1);
    expect(itemElements[0].querySelector('.item-name')?.textContent).toContain(
      'Item 2',
    );
  });

  it('should filter items by search query (name)', () => {
    component.searchQuery.set('Item 3');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(1);
    expect(itemElements[0].querySelector('.item-name')?.textContent).toContain(
      'Item 3',
    );
  });

  it('should filter items by search query (designer)', () => {
    const items = [...mockItems];
    items[0].designer = 'Famous Designer';
    mockArchiveService.collection.set(items);
    fixture.detectChanges();

    component.searchQuery.set('Famous');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(1);
    expect(itemElements[0].querySelector('.item-name')?.textContent).toContain(
      'Item 1',
    );
  });

  it('should show no items if search query has no match', () => {
    component.searchQuery.set('Non-existent');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(0);
  });

  it('should update searchQuery on input event', () => {
    const event = {
      target: { value: 'test query' } as HTMLInputElement,
    } as unknown as Event;
    component.onSearchChange(event);
    expect(component.searchQuery()).toBe('test query');
  });

  it('should show no items if no filter match', () => {
    component.setFilter('category', 'cat3');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(0);
  });
});
