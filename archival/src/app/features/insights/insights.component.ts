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
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexFill,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ChartType,
} from 'ng-apexcharts';

export interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  colors: string[];
  tooltip: ApexTooltip;
}

import * as L from 'leaflet';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
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
  hoveredPoint = signal<{
    decade: number;
    category: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // --- Reference signals from central service ---
  collection = this.archive.collection;
  cities = this.archive.cities;

  // --- ApexCharts Options ---

  pieOptions = computed<Partial<PieChartOptions>>(() => {
    const data = this.originCounts();
    return {
      series: data.map((d) => d.count),
      labels: data.map((d) => d.name),
      chart: {
        type: 'pie' as ChartType,
        height: 280,
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        toolbar: { show: false },
      },
      stroke: { show: false },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        fontSize: '10px',
        markers: {
          width: 8,
          height: 8,
        },
        formatter: (
          name: string,
          opts: { w: { globals: { series: number[] } }; seriesIndex: number },
        ) => {
          return `${name}: ${opts.w.globals.series[opts.seriesIndex]}`;
        },
      },
      colors: data.map((d) => d.color),
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: 'light',
        style: { fontSize: '10px' },
      },
    };
  });

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

  ORIGIN_COLORS = ['#b9d3a4', '#1e3a8a', '#e9d5ff', '#fbcfe8', '#e0f2fe'];

  // --- Analytical Computeds ---

  mappedOrigins = computed(() => {
    const grouped: Record<
      string,
      { lat: number; lng: number; items: CollectionItem[] }
    > = {};
    const cityMap = new Map(
      this.cities().map((c) => [c.name.toLowerCase(), c]),
    );

    this.collection().forEach((item) => {
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
   * Returns all mapped origins sorted by item count with pie chart segment data and dynamic colors.
   */
  originCounts = computed(() => {
    const origins = this.mappedOrigins()
      .map((o) => ({ name: o.name, count: o.items.length }))
      .sort((a, b) => b.count - a.count);

    const total = origins.reduce((acc, curr) => acc + curr.count, 0);
    let cumulativePercent = 0;

    return origins.map((o, i) => {
      const startPercent = cumulativePercent;
      const percent = (o.count / total) * 100;
      cumulativePercent += percent;

      const hue = 210;
      const saturation = 30 + ((i * 10) % 40);
      const lightness = 35 + ((i * 15) % 45);
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      return {
        ...o,
        startPercent,
        percent,
        color,
        gradientSegment: `${color} ${startPercent.toFixed(2)}% ${cumulativePercent.toFixed(2)}%`,
      };
    });
  });

  temporalData = computed(() => {
    const items = this.collection();
    const categories: string[] = ['decor', 'music', 'books', 'fashion'];

    if (items.length === 0) {
      return { decades: [], categoryPaths: [], maxVal: 1 };
    }

    const years = items.map((i) => i.year).filter((y) => !isNaN(y));
    if (years.length === 0) {
      return { decades: [], categoryPaths: [], maxVal: 1 };
    }

    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const startDecade = Math.floor(minYear / 10) * 10;
    const endDecade = Math.floor(maxYear / 10) * 10;

    const decades: number[] = [];
    for (let d = startDecade; d <= endDecade; d += 10) {
      decades.push(d);
    }

    const counts: Record<number, Record<string, number>> = {};
    decades.forEach((d) => {
      counts[d] = {};
      categories.forEach((cat) => (counts[d][cat] = 0));
    });

    items.forEach((item) => {
      const year = item.year;
      if (!isNaN(year)) {
        const d = Math.floor(year / 10) * 10;
        if (d in counts && item.category in counts[d]) {
          counts[d][item.category]++;
        }
      }
    });

    const chartWidth = 1000;
    const baselineY = 100;
    const paddingTop = 10;
    const paddingX = 5;
    const effectiveWidth = chartWidth - paddingX * 2;
    const effectiveHeight = baselineY - paddingTop;

    const decadeList = decades.map((decade, i) => ({
      decade,
      x:
        paddingX +
        (decades.length > 1
          ? (i / (decades.length - 1)) * effectiveWidth
          : effectiveWidth / 2),
      counts: counts[decade],
    }));

    let maxVal = 1;
    decades.forEach((d) => {
      categories.forEach((cat) => {
        if (counts[d][cat] > maxVal) maxVal = counts[d][cat];
      });
    });

    // Generate paths for each category
    const categoryPaths = categories.map((cat) => {
      const points = decadeList.map((d) => ({
        x: d.x,
        y: baselineY - (d.counts[cat] / maxVal) * effectiveHeight,
      }));

      const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

      return {
        category: cat,
        path: linePath,
        points,
      };
    });

    return {
      decades: decadeList,
      categoryPaths,
      maxVal,
    };
  });

  /**
   * Provenance Leaderboard - Top Designers/Authors/Artists
   */
  topDesigners = computed(() => {
    const counts: Record<string, number> = {};
    this.collection().forEach((item) => {
      const name = item.designer?.trim();
      if (
        name &&
        name.toLowerCase() !== 'unknown' &&
        name.toLowerCase() !== 'unknown artist'
      ) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
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

    this.mappedOrigins().forEach((origin) => {
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
        <ul style="margin: 0; padding: 0; list-style: none; font-size: 11px; color: #1A1A1A; max-height: 240px; overflow-y: auto; padding-right: 4px;">
          ${origin.items.map((i) => `<li style="border-bottom: 1px solid #f0f0f0; padding: 4px 0;">${i.name}</li>`).join('')}
        </ul>
      `;

      marker.bindPopup(content, {
        className: 'archival-popup',
        closeButton: false,
      });
      marker.on('mouseover', () => marker.openPopup());
      marker.on('click', () => marker.openPopup());
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

    const sorted = (Object.entries(counts) as [string, number][])
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]: [string, number]) => ({ label, count }));

    const max = sorted.length > 0 ? sorted[0].count : 1;

    return sorted.map((s) => ({
      ...s,
      percent: (s.count / max) * 100,
    }));
  }

  getMovementDescription(name: string): string {
    const movement = this.archive
      .movements()
      .find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (movement && movement.description) {
      return movement.description;
    }

    return (
      this.MOVEMENT_DESCRIPTIONS[name.toLowerCase()] ||
      'Archival movement defining a specific era of stylistic and structural innovation.'
    );
  }

  getOriginColor(index: number): string {
    return this.ORIGIN_COLORS[index % this.ORIGIN_COLORS.length];
  }
}
