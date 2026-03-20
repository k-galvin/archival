import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
    });

    await TestBed.configureTestingModule({
      imports: [GalleryComponent, HttpClientTestingModule],
      providers: [
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

  it('should show no items if no filter match', () => {
    component.setFilter('category', 'cat3');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('.record-card');
    expect(itemElements.length).toBe(0);
  });
});
