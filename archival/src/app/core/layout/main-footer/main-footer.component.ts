import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../services/archive.service';

/**
 * MainFooterComponent provides a global footer with archive-wide statistics.
 * Tracks total item count and individual collection growth across the platform.
 */
@Component({
  selector: 'app-main-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-footer.component.html',
  styleUrl: './main-footer.component.scss',
})
export class MainFooterComponent {
  private archive = inject(ArchiveService);

  /** Computed signal tracking total number of records across the entire archive. */
  itemCount = computed(() => this.archive.collection().length);
  /** Computed signal tracking total number of public collections available. */
  collectionCount = computed(() => this.archive.userCollections().length);
}
