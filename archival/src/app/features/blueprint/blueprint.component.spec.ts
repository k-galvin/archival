import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BlueprintComponent } from './blueprint.component';
import { ArchiveService } from '../../core/services/archive.service';
import { CollectionItem, Room } from '../../shared/models/archive.models';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';

describe('BlueprintComponent', () => {
  let component: BlueprintComponent;
  let fixture: ComponentFixture<BlueprintComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  const mockRooms: Room[] = [
    { id: '1', name: 'rooma', x: 0, y: 0 },
    { id: '2', name: 'roomb', x: 1, y: 0 },
  ];

  const mockItems: CollectionItem[] = [
    { id: 'item1', name: 'Item A', category: 'decor', origin: 'orig1', year: 2000, image: '', designer: '', note: '', movementId: '', room: 'rooma', movementName: '' },
    { id: 'item2', name: 'Item B', category: 'music', origin: 'orig2', year: 2010, image: '', designer: '', note: '', movementId: '', room: 'rooma', movementName: '' },
    { id: 'item3', name: 'Item C', category: 'books', origin: 'orig3', year: 2020, image: '', designer: '', note: '', movementId: '', room: 'roomb', movementName: '' },
  ];

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      ['addRoom', 'deleteRoom'],
      {
        rooms: signal(mockRooms),
        collection: signal(mockItems),
      }
    );

    await TestBed.configureTestingModule({
      imports: [BlueprintComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlueprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the rooms list correctly', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const roomListItems = compiled.querySelectorAll('.room-list-item');

    expect(roomListItems.length).toBe(mockRooms.length);
    expect(roomListItems[0].querySelector('.room-label')?.textContent).toContain('rooma');
    expect(roomListItems[0].querySelector('.item-count')?.textContent).toContain('2 items');
    expect(roomListItems[1].querySelector('.room-label')?.textContent).toContain('roomb');
    expect(roomListItems[1].querySelector('.item-count')?.textContent).toContain('1 items');
  });

  it('should render the blueprint grid with rooms', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const gridCells = compiled.querySelectorAll('.grid-cell');

    // Assuming a 2x2 grid for 2 rooms based on gridSize computed property
    expect(gridCells.length).toBe(4); // Math.max(2, Math.ceil(Math.sqrt(2 || 1))) -> 2*2=4
    expect(gridCells[0].querySelector('.cell-name')?.textContent).toContain('rooma');
    expect(gridCells[1].querySelector('.cell-name')?.textContent).toContain('roomb');
    expect(gridCells[2].querySelector('.cell-name')).toBeNull(); // Empty cell
    expect(gridCells[3].querySelector('.cell-name')).toBeNull(); // Empty cell
  });

  it('should add a new room', () => {
    component.newRoomName.set('newroom');
    component.addRoom();
    expect(mockArchiveService.addRoom).toHaveBeenCalledWith('newroom');
    expect(component.newRoomName()).toBe('');
  });

  it('should delete a room', () => {
    component.deleteRoom('1');
    expect(mockArchiveService.deleteRoom).toHaveBeenCalledWith('1');
  });
});
