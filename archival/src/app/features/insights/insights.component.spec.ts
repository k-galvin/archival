import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InsightsComponent } from './insights.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal, WritableSignal } from '@angular/core';
import {
  CollectionItem,
  City,
  Movement,
} from '../../shared/models/archive.models';

describe('InsightsComponent', () => {
  let component: InsightsComponent;
  let fixture: ComponentFixture<InsightsComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;
  let collectionSignal: WritableSignal<CollectionItem[]>;

  const mockCities: City[] = [
    { id: 1, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
    { id: 2, name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  ];

  const mockMovements: Movement[] = [
    { id: '1', category: 'decor', name: 'Bauhaus', era: '1920s', description: 'Rational design.' },
    { id: '2', category: 'music', name: 'IDM', era: '1990s', description: 'Digital synthesis.' },
  ];

  let mockCollection: CollectionItem[];

  beforeEach(async () => {
    mockCollection = [
      {
        id: '1',
        name: 'Item A',
        category: 'decor',
        origin: 'Paris',
        year: 1925,
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
        year: 1998,
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
        year: 1930,
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
        category: 'decor',
        origin: 'Berlin',
        year: 1928,
        image: '',
        designer: '',
        note: '',
        movementId: '1',
        movementName: 'Bauhaus',
        room: '',
      },
    ];

    collectionSignal = signal(mockCollection);
    mockArchiveService = jasmine.createSpyObj('ArchiveService', [], {
      collection: collectionSignal,
      movements: signal(mockMovements),
      cities: signal(mockCities),
    });

    // Mock the global fetch function
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        json: () =>
          Promise.resolve({
            type: 'FeatureCollection',
            features: [],
          }),
      }) as Promise<Response>,
    );

    await TestBed.configureTestingModule({
      imports: [InsightsComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }],
    }).compileComponents();

    fixture = TestBed.createComponent(InsightsComponent);
    component = fixture.componentInstance;

    // Mock the ElementRef for mapContainer
    component.mapElement = { nativeElement: document.createElement('div') };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly map origins with item counts', () => {
    const mappedOrigins = component.mappedOrigins();
    expect(mappedOrigins.length).toBe(2); // Paris and London
    expect(mappedOrigins.find((o) => o.name === 'paris')?.items.length).toBe(2);
    expect(mappedOrigins.find((o) => o.name === 'london')?.items.length).toBe(
      1,
    );
  });

  it('should correctly calculate origin counts', () => {
    const originCounts = component.originCounts();
    expect(originCounts.length).toBe(2);
    expect(originCounts[0].name).toBe('paris');
    expect(originCounts[0].count).toBe(2);
    expect(originCounts[1].name).toBe('london');
    expect(originCounts[1].count).toBe(1);
  });

  it('should correctly generate temporal distribution data', () => {
    const temporalData = component.temporalData();
    expect(temporalData.decades.length).toBeGreaterThan(0);
    
    const d1920 = temporalData.decades.find((d) => d.decade === 1920);
    expect(d1920?.counts['decor']).toBe(2); // Item A and D
    
    const d1990 = temporalData.decades.find((d) => d.decade === 1990);
    expect(d1990?.counts['music']).toBe(1); // Item B
    
    const d1930 = temporalData.decades.find((d) => d.decade === 1930);
    expect(d1930?.counts['decor']).toBe(1); // Item C
  });

  it('should correctly calculate taxonomy counts for a given category', () => {
    const decorTaxonomy: { label: string; count: number }[] =
      component.getTaxonomyCounts('decor');
    expect(decorTaxonomy.length).toBe(1);
    expect(decorTaxonomy[0].label).toBe('Bauhaus');
    expect(decorTaxonomy[0].count).toBe(3); // Item A, C, D
  });

  it('should not include movements without items in taxonomy counts', () => {
    const musicTaxonomy: { label: string; count: number }[] =
      component.getTaxonomyCounts('music');
    expect(musicTaxonomy.length).toBe(1);
    expect(musicTaxonomy[0].label).toBe('IDM');
    expect(musicTaxonomy[0].count).toBe(1); // Item B
  });

  it('should correctly calculate top designers leaderboard', () => {
    // Add items with designers to mock collection
    mockCollection[0].designer = 'Designer X'; // Item A
    mockCollection[1].designer = 'Designer Y'; // Item B
    mockCollection[2].designer = 'Designer X'; // Item C
    // Item D stays empty
    
    collectionSignal.set([...mockCollection]);
    
    const topDesigners = component.topDesigners();
    expect(topDesigners.length).toBe(2);
    expect(topDesigners[0].name).toBe('Designer X');
    expect(topDesigners[0].count).toBe(2);
    expect(topDesigners[1].name).toBe('Designer Y');
    expect(topDesigners[1].count).toBe(1);
  });
});
