import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem, Movement } from '../../shared/models/archive.models';

@Component({
  selector: 'app-acquisition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acquisition.component.html',
  styleUrl: './acquisition.component.scss',
})
export class AcquisitionComponent {
  private archive = inject(ArchiveService);
  private router = inject(Router);

  // Available rooms for spatial assignment from the central service
  rooms = this.archive.rooms;

  // Local state for the acquisition form
  newItem: Partial<CollectionItem> = {
    category: 'decor',
    room: 'living room',
    movementId: 'm1',
  };

  // Curated movement metadata for registration
  // In a production environment, these would be managed via the ArchiveService
  movements: Movement[] = [
    { id: 'm1', category: 'decor', name: 'Bauhaus', era: '1919–1933' },
    {
      id: 'm2',
      category: 'decor',
      name: 'Mid-Century Modern',
      era: '1945–1969',
    },
    { id: 'm3', category: 'decor', name: 'Space Age', era: '1950s–1970s' },
    { id: 'm4', category: 'music', name: 'IDM', era: '1990s' },
    { id: 'm5', category: 'music', name: 'Cool Jazz', era: '1940s–1950s' },
    { id: 'm7', category: 'books', name: 'Modernism', era: '1890s–1940s' },
    { id: 'm9', category: 'fashion', name: 'Mod', era: '1960s' },
  ];

  /**
   * Filters the available design movements based on the active category
   */
  getMovementsByCategory(cat: string) {
    return this.movements.filter((m) => m.category === cat);
  }

  /**
   * Updates the selected category and resets the default movement selection
   */
  setCategory(cat: 'decor' | 'music' | 'books' | 'fashion') {
    this.newItem.category = cat;
    const firstMove = this.getMovementsByCategory(cat)[0];
    if (firstMove) this.newItem.movementId = firstMove.id;
  }

  /**
   * Registers the new item in the global archive and redirects to index gallery
   */
  registerRecord(): void {
    if (!this.newItem.name || !this.newItem.year) return;

    const record: CollectionItem = {
      ...(this.newItem as CollectionItem),
      id: Math.random().toString(36).substring(2, 8),
      // Default archival placeholder image for new acquisitions
      image:
        'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800',
    };

    this.archive.addItem(record);
    this.router.navigate(['/gallery']);
  }
}
