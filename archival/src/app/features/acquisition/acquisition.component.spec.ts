import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AcquisitionComponent } from './acquisition.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';

describe('AcquisitionComponent', () => {
  let component: AcquisitionComponent;
  let fixture: ComponentFixture<AcquisitionComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      ['searchBooks', 'searchDiscogs', 'uploadImage', 'addRoom', 'addItem'],
      {
        movements: signal([]),
        rooms: signal([]),
        cities: signal([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [AcquisitionComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcquisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
