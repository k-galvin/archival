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
    mockArchiveService = jasmine.createSpyObj('ArchiveService', [], {
      user: signal(null),
      collection: signal([]),
      userCollections: signal([]),
    });

    await TestBed.configureTestingModule({
      imports: [MainFooterComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MainFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct item count', () => {
    mockArchiveService.collection.set([
      { id: '1', name: 'Item 1' } as any,
      { id: '2', name: 'Item 2' } as any,
    ]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('.stat-item:first-child .stat-value')?.textContent,
    ).toContain('2');
  });

  it('should display the correct collection count', () => {
    mockArchiveService.userCollections.set([
      { id: 'col1', title: 'Collection 1' } as any,
      { id: 'col2', title: 'Collection 2' } as any,
      { id: 'col3', title: 'Collection 3' } as any,
    ]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('.stat-item:last-child .stat-value')?.textContent,
    ).toContain('3');
  });

  it('should display the current year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentYear = new Date().getFullYear().toString();
    expect(
      compiled.querySelector('.branding-group .archival-overline:last-child')
        ?.textContent,
    ).toContain(currentYear);
  });
});
