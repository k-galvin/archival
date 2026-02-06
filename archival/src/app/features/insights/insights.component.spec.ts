import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InsightsComponent } from './insights.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';

describe('InsightsComponent', () => {
  let component: InsightsComponent;
  let fixture: ComponentFixture<InsightsComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      [], // No methods are called directly in InsightsComponent's spec that need spying
      {
        collection: signal([]),
        movements: signal([]),
        cities: signal([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [InsightsComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
