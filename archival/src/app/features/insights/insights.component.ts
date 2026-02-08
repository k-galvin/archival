import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem } from '../../shared/models/archive.models';

import * as L from 'leaflet';



@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsComponent implements OnInit, AfterViewInit {
  private archive = inject(ArchiveService);

  @ViewChild('mapContainer') mapElement!: ElementRef;
  private map: L.Map | null = null;
  private leafletReady = false;

  // --- Local UI State ---
  hoveredMovement = signal<string | null>(null);

  // --- Reference signals from central service ---
  collection = this.archive.collection;
  cities = this.archive.cities;

  // --- Static Metadata ---
  MOVEMENT_DESCRIPTIONS: Record<string, string> = {
    bauhaus:
      'Rational, functional design from Germany (1919-1933) emphasizing geometric forms and the union of art and industry.',
    'mid-century modern':
      'Post-WWII movement characterized by organic curves, clean lines, and an integration of nature.',
    'space age':
      'Optimistic design inspired by space travel, featuring futuristic circular forms and plastic silhouettes.',
    minimalism:
      'Focused on essential elements, clean lines, and neutral palettes.',
    idm: 'Intelligent Dance Music; complex electronic patterns focusing on texture and digital synthesis.',
    modernism:
      'Broad movement emphasizing structural honesty and the rejection of traditional ornament.',
  };

  // --- Analytical Computeds ---

  mappedOrigins = computed(() => {
    const grouped: Record<string, { lat: number; lng: number; items: CollectionItem[] }> = {};
    const cityMap = new Map(this.cities().map(c => [c.name.toLowerCase(), c]));

    this.collection().forEach(item => {
      if (item.origin) {
        const originKey = item.origin.toLowerCase();
        const city = cityMap.get(originKey);
        if (city) {
          if (!grouped[originKey]) {
            grouped[originKey] = { lat: city.lat, lng: city.lng, items: [] };
          }
          grouped[originKey].items.push(item);
        }
      }
    });
    return Object.entries(grouped).map(([name, data]) => ({ name, ...data }));
  });

  /**
   * Returns all mapped origins sorted by item count.
   */
  originCounts = computed(() => {
    return this.mappedOrigins()
      .map(o => ({ name: o.name, count: o.items.length }))
      .sort((a, b) => b.count - a.count);
  });

  temporalData = computed(() => {
    const decades = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
    const counts: Record<number, number> = {};
    decades.forEach(d => (counts[d] = 0));

    this.collection().forEach(item => {
      const year = item.year;
      if (!isNaN(year)) {
        const d = Math.floor(year / 10) * 10;
        if (d in counts) counts[d]++;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([decade, count]) => ({ decade: Number(decade), count }));
  });

  temporalLinePath = computed(() => {
    const data = this.temporalData();
    const width = 1000;
    const height = 100;
    const max = Math.max(...data.map(d => d.count), 1);

    return data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.count / max) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  });

  // --- Lifecycle Hooks ---

  ngOnInit() {
    this.loadLeafletAssets();
  }

  ngAfterViewInit() {
    this.checkLeafletReady();
  }

  // --- Map Initialization ---

  private loadLeafletAssets() {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        this.leafletReady = true;
        this.checkLeafletReady();
      };
      document.head.appendChild(script);
    } else {
      this.leafletReady = true;
    }
  }

  private checkLeafletReady() {
    if (this.leafletReady && this.mapElement) {
      this.initMap();
    } else {
      setTimeout(() => this.checkLeafletReady(), 100);
    }
  }

  private async initMap() {
    if (!this.mapElement || this.map) return;

    // Define the boundaries of the world
    const bounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

    this.map = L.map(this.mapElement.nativeElement, {
      center: [30, 10],
      zoom: 2,
      minZoom: 2,
      zoomControl: false,
      attributionControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    });

    const geoUrl =
      'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson';


    try {
      const response = await fetch(geoUrl);
      const data = await response.json();
      L.geoJSON(data, {
        style: {
          fillColor: '#ffffff',
          fillOpacity: 1,
          color: '#0047AB',
          weight: 0.5,
        },
      }).addTo(this.map!);
    } catch (e) {
      console.warn('GeoJSON load failed. Map will be empty.', e);
    }

    this.mappedOrigins().forEach(origin => {
      const marker = L.circleMarker([origin.lat, origin.lng], {
        radius: 5,
        fillColor: '#0047AB',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(this.map!);

      const content = `
        <div style="font-family: ui-monospace, monospace; font-size: 10px; text-transform: uppercase; color: #0047AB; margin-bottom: 6px; font-weight: bold;">${origin.name}</div>
        <ul style="margin: 0; padding: 0; list-style: none; font-size: 11px; color: #1A1A1A;">
          ${origin.items.map(i => `<li style="border-bottom: 1px solid #f0f0f0; padding: 4px 0;">${i.name}</li>`).join('')}
        </ul>
      `;

      marker.bindPopup(content, { className: 'archival-popup', closeButton: false });
      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());
    });
  }

  // --- Helper Methods ---

  getTaxonomyCounts(category: string) {
    const items = this.collection().filter((i) => i.category === category);
    const counts: Record<string, number> = {};

    items.forEach((i) => {
      if (i.movementName) {
        counts[i.movementName] = (counts[i.movementName] || 0) + 1;
      }
    });

    return (Object.entries(counts) as [string, number][])
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]: [string, number]) => ({ label, count }));
  }

  getMovementDescription(name: string): string {
    return (
      this.MOVEMENT_DESCRIPTIONS[name.toLowerCase()] ||
      'Archival movement defining a specific era of stylistic and structural innovation.'
    );
  }
}
