import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../core/services/archive.service';
import { Room } from '../../shared/models/archive.models';

@Component({
  selector: 'app-blueprint',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blueprint.component.html',
  styleUrl: './blueprint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlueprintComponent {
  private archive = inject(ArchiveService);

  // Local UI State for form inputs and hover interactions
  newRoomName = signal('');
  hoveredRoomId = signal<string | number | null>(null);

  // Reference signals from the global Archive Service
  rooms = this.archive.rooms;
  collection = this.archive.collection;

  /**
   * Calculates a dynamic square grid size for the blueprint.
   * Ensures a balanced layout even with a small number of volumes.
   */
  gridSize = computed(() => {
    const roomCount = this.rooms().length;
    const size = Math.max(2, Math.ceil(Math.sqrt(roomCount || 1)));
    const cells = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        cells.push({ x, y });
      }
    }
    return { cells, size };
  });

  /**
   * Registers a new spatial volume in the archive
   */
  addRoom(): void {
    const name = this.newRoomName().trim();
    if (!name) return;

    this.archive.addRoom(name.toLowerCase());
    this.newRoomName.set('');
  }

  /**
   * Removes a room from the spatial index
   */
  deleteRoom(id: string | number): void {
    this.archive.deleteRoom(id);
  }

  /**
   * Helper to identify which room occupies a specific grid coordinate
   */
  getRoomAt(x: number, y: number): Room | undefined {
    return this.rooms().find((r) => r.x === x && r.y === y);
  }

  /**
   * Filters the main collection to find items located in a specific room
   */
  getItemsInRoom(roomName: string) {
    return this.collection().filter(
      (item) =>
        (item.room ?? '').toLowerCase().trim() === roomName.toLowerCase().trim(),
    );
  }
}
