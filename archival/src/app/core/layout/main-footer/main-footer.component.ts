import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from '../../services/archive.service';

@Component({
  selector: 'app-main-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-footer.component.html',
  styleUrl: './main-footer.component.scss',
})
export class MainFooterComponent {
  private archive = inject(ArchiveService);

  itemCount = computed(() => this.archive.collection().length);
  collectionCount = computed(() => this.archive.userCollections().length);
}
