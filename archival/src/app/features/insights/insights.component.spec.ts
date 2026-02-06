import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InsightsComponent } from './insights.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';
import { CollectionItem, City, Movement } from '../../shared/models/archive.models';

describe('InsightsComponent', () => {
  let component: InsightsComponent;
  let fixture: ComponentFixture<InsightsComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  const mockCities: City[] = [
    { id: 1, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
    { id: 2, name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  ];

  const mockMovements: Movement[] = [
    { id: '1', category: 'decor', name: 'Bauhaus', era: '1920s' },
    { id: '2', category: 'music', name: 'IDM', era: '1990s' },
  ];

  const mockCollection: CollectionItem[] = [
    { id: '1', name: 'Item A', category: 'decor', origin: 'Paris', year: 1925, image: '', designer: '', note: '', movementId: '1', movementName: 'Bauhaus', room: '' },
    { id: '2', name: 'Item B', category: 'music', origin: 'London', year: 1998, image: '', designer: '', note: '', movementId: '2', movementName: 'IDM', room: '' },
    { id: '3', name: 'Item C', category: 'decor', origin: 'Paris', year: 1930, image: '', designer: '', note: '', movementId: '1', movementName: 'Bauhaus', room: '' },
    { id: '4', name: 'Item D', category: 'decor', origin: 'Berlin', year: 1928, image: '', designer: '', note: '', movementId: '1', movementName: 'Bauhaus', room: '' },
  ];

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      [], // No methods are called directly from ArchiveService in InsightsComponent's spec that need spying
      {
        collection: signal(mockCollection),
        movements: signal(mockMovements),
        cities: signal(mockCities),
      }
    );

    await TestBed.configureTestingModule({
      imports: [InsightsComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

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
    expect(mappedOrigins.length).toBe(2); // Paris and London, Berlin is not in mockCities
    expect(mappedOrigins.find(o => o.name === 'paris')?.items.length).toBe(2);
    expect(mappedOrigins.find(o => o.name === 'london')?.items.length).toBe(1);
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
    expect(temporalData.length).toBeGreaterThan(0);
    expect(temporalData.find(d => d.decade === 1920)?.count).toBe(2);
    expect(temporalData.find(d => d.decade === 1990)?.count).toBe(1);
    expect(temporalData.find(d => d.decade === 1930)?.count).toBe(1); // Item C
  });

  it('should correctly calculate taxonomy counts for a given category', () => {
    const decorTaxonomy = component.getTaxonomyCounts('decor');
    expect(decorTaxonomy.length).toBe(1);
    expect(decorTaxonomy[0].label).toBe('Bauhaus');
    expect(decorTaxonomy[0].count).toBe(3); // Item A, C, D
  });

  it('should not include movements without items in taxonomy counts', () => {
    const musicTaxonomy = component.getTaxonomyCounts('music');
    expect(musicTaxonomy.length).toBe(1);
    expect(musicTaxonomy[0].label).toBe('IDM');
    expect(musicTaxonomy[0].count).toBe(1); // Item B
  });
});
