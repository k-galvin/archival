import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChronologyComponent } from './chronology.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';
import { CollectionItem } from '../../shared/models/archive.models';
import { of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

describe('ChronologyComponent', () => {
  let component: ChronologyComponent;
  let fixture: ComponentFixture<ChronologyComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  const mockCollection: CollectionItem[] = [
    {
      id: '1',
      name: 'Item A',
      category: 'decor',
      origin: 'Paris',
      year: 1995,
      image: '',
      designer: '',
      note: '',
      movementId: '1',
      movementName: 'Bauhaus',
      room: '',
    },
    {
      id: '2',
      name: 'Item B',
      category: 'music',
      origin: 'London',
      year: 2005,
      image: '',
      designer: '',
      note: '',
      movementId: '2',
      movementName: 'IDM',
      room: '',
    },
    {
      id: '3',
      name: 'Item C',
      category: 'decor',
      origin: 'Paris',
      year: 1995,
      image: '',
      designer: '',
      note: '',
      movementId: '1',
      movementName: 'Bauhaus',
      room: '',
    },
    {
      id: '4',
      name: 'Item D',
      category: 'books',
      origin: 'Berlin',
      year: 1980,
      image: '',
      designer: '',
      note: '',
      movementId: '3',
      movementName: 'Postmodern',
      room: '',
    },
    {
      id: '5',
      name: 'Item E',
      category: 'fashion',
      origin: 'Milan',
      year: 2005,
      image: '',
      designer: '',
      note: '',
      movementId: '4',
      movementName: 'Minimalism',
      room: '',
    },
  ];

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj('ArchiveService', [], {
      collection: signal(mockCollection),
      movements: signal([]),
      cities: signal([]),
      loading: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [ChronologyComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArchiveService, useValue: mockArchiveService },
        { provide: ActivatedRoute, useValue: { paramMap: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChronologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list all years with items in ascending order', () => {
    const groupedYears = component.groupedByYear();
    expect(groupedYears.length).toBe(3); // 1980, 1995, 2005
    expect(groupedYears[0].year).toBe(1980);
    expect(groupedYears[1].year).toBe(1995);
    expect(groupedYears[2].year).toBe(2005);
  });

  it('should show all items for a given year', () => {
    const groupedYears = component.groupedByYear();

    const year1995 = groupedYears.find((g) => g.year === 1995);
    expect(year1995).toBeDefined();
    expect(year1995?.items.length).toBe(2);
    expect(year1995?.items.map((item) => item.name)).toEqual(
      jasmine.arrayContaining(['Item A', 'Item C']),
    );

    const year2005 = groupedYears.find((g) => g.year === 2005);
    expect(year2005).toBeDefined();
    expect(year2005?.items.length).toBe(2);
    expect(year2005?.items.map((item) => item.name)).toEqual(
      jasmine.arrayContaining(['Item B', 'Item E']),
    );
  });

  it('should correctly calculate the gap between years', () => {
    const groupedYears = component.groupedByYear();
    // 1980 (gap 0), 1995 (gap 15), 2005 (gap 10)
    expect(groupedYears[0].gap).toBe(0);
    expect(groupedYears[1].gap).toBe(15);
    expect(groupedYears[2].gap).toBe(10);

    expect(component.calculateGap(groupedYears[0].gap)).toBe(0); // Year 1980
    expect(component.calculateGap(groupedYears[1].gap)).toBeGreaterThan(0); // Year 1995
    expect(component.calculateGap(groupedYears[2].gap)).toBeGreaterThan(0); // Year 2005
  });
});
