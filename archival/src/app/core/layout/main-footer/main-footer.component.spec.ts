import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MainFooterComponent } from './main-footer.component';
import { ArchiveService } from '../../services/archive.service';
import { signal } from '@angular/core';

describe('MainFooterComponent', () => {
  let component: MainFooterComponent;
  let fixture: ComponentFixture<MainFooterComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      [], // No methods are called directly in MainFooterComponent's spec that need spying
      {
        user: signal(null), // Default to null for not logged in
        collection: signal([]),
        userCollections: signal([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [MainFooterComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
