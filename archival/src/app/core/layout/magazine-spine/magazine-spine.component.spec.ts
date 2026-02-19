import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagazineSpineComponent } from './magazine-spine.component';

describe('MagazineSpineComponent', () => {
  let component: MagazineSpineComponent;
  let fixture: ComponentFixture<MagazineSpineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagazineSpineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagazineSpineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the branding logo and meta information', () => {
    fixture.detectChanges(); // Ensure component is rendered
    const compiled = fixture.nativeElement as HTMLElement;

    // Check for the logo text
    expect(compiled.querySelector('.spine-logo')?.textContent).toContain('archival');

    // Check for the top meta label
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear();
    expect(compiled.querySelector('.spine-top .meta-label')?.textContent).toContain(`Issue ${currentMonth} / ${currentYear}`);

    // Check for the bottom meta label
    expect(compiled.querySelector('.spine-bottom .meta-label')?.textContent).toContain('EST. 2026');
  });
});

