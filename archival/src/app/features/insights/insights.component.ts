import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../core/services/archive.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsComponent {
  private archive = inject(ArchiveService);

  // Local UI State
  hoveredMovement = signal<string | null>(null);

  // Reference signals from central service
  collection = this.archive.collection;

  // Static Metadata (Movements)
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

  uniqueOriginsCount = computed(
    () => [...new Set(this.collection().map((i) => i.origin))].length,
  );

  /**
   * Aggregates item counts by decade for the temporal chart.
   */
  temporalData = computed(() => {
    const decades = [
      1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020,
    ];
    const counts: Record<number, number> = {};
    decades.forEach((d) => (counts[d] = 0));

    this.collection().forEach((item) => {
      const year = parseInt(item.year);
      if (!isNaN(year)) {
        const d = Math.floor(year / 10) * 10;
        if (d in counts) counts[d]++;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([decade, count]) => ({ decade: Number(decade), count }));
  });

  /**
   * Generates an SVG path string for the temporal line chart.
   */
  temporalLinePath = computed(() => {
    const data = this.temporalData();
    const width = 1000;
    const height = 100;
    const max = Math.max(...data.map((d) => d.count), 1);

    return data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.count / max) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  });

  /**
   * Returns top 5 design movements for a specific category.
   */
  getTaxonomyCounts(category: string) {
    const items = this.collection().filter((i) => i.category === category);
    const counts: Record<string, number> = {};

    items.forEach((i) => {
      counts[i.movementId] = (counts[i.movementId] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));
  }

  getMovementDescription(name: string): string {
    return (
      this.MOVEMENT_DESCRIPTIONS[name.toLowerCase()] ||
      'Archival movement defining a specific era of stylistic and structural innovation.'
    );
  }
}
