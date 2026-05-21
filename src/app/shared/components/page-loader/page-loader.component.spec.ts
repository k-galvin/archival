import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLoaderComponent } from './page-loader.component';

describe('PageLoaderComponent', () => {
  let component: PageLoaderComponent;
  let fixture: ComponentFixture<PageLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the loader and text when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loader-container')).not.toBeNull();
    expect(compiled.querySelector('.loading-text')?.textContent).toContain(
      'Loading',
    );
  });

  it('should not display the loader and text when isLoading is false', () => {
    component.isLoading = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loader-container')).toBeNull();
  });

  it('should display custom loading text', () => {
    component.isLoading = true;
    component.loadingText = 'Please wait...';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-text')?.textContent).toContain(
      'Please wait...',
    );
  });
});
