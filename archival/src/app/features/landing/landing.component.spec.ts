import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a button to navigate to auth', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('access registry');
  });

  it('should call navigateToAuth when the button is clicked', () => {
    spyOn(component, 'navigateToAuth');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.navigateToAuth).toHaveBeenCalled();
  });

  it('should navigate to /auth when navigateToAuth is called', () => {
    spyOn(router, 'navigate');
    component.navigateToAuth();
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });
});
