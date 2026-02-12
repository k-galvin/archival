import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainNavComponent } from './main-nav.component';
import { ArchiveService } from '../../services/archive.service';
import { signal } from '@angular/core';

describe('MainNavComponent', () => {
  let component: MainNavComponent;
  let fixture: ComponentFixture<MainNavComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj('ArchiveService', ['signOut'], {
      user: signal(null),
    });
    // Configure the signOut spy to set the user signal to null when called
    mockArchiveService.signOut.and.callFake(async () => {
      mockArchiveService.user.set(null);
      return Promise.resolve(); // Simulate async signOut
    });

    await TestBed.configureTestingModule({
      imports: [MainNavComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MainNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display navigation links', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(component.navLinks.length);
    expect(navLinks[0].textContent).toContain('gallery');
    expect(navLinks[1].textContent).toContain('collections');
  });

  it('should have isMenuOpen set to false initially', () => {
    expect(component.isMenuOpen).toBe(false);
  });

  it('should toggle isMenuOpen when toggleMenu() is called', () => {
    component.toggleMenu();
    expect(component.isMenuOpen).toBe(true);
    component.toggleMenu();
    expect(component.isMenuOpen).toBe(false);
  });

  it('should add "open" class to nav-links when menu is open', () => {
    component.isMenuOpen = true;
    fixture.detectChanges();
    const navLinksDiv = fixture.nativeElement.querySelector('.nav-links');
    expect(navLinksDiv.classList).toContain('open');
  });

  it('should remove "open" class from nav-links when menu is closed', () => {
    component.isMenuOpen = false;
    fixture.detectChanges();
    const navLinksDiv = fixture.nativeElement.querySelector('.nav-links');
    expect(navLinksDiv.classList).not.toContain('open');
  });

  it('should display sign-in link when user is null', () => {
    mockArchiveService.user.set(null);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.auth-link')).not.toBeNull();
    expect(compiled.querySelector('.logout')).toBeNull();
  });

  it('should display logout button and avatar when user is present', () => {
    mockArchiveService.user.set({
      id: '123',
      email: 'test@example.com',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.auth-link')).toBeNull();
    expect(compiled.querySelector('.logout')).not.toBeNull();
  });

  it('should reset user to null on logout', () => {
    mockArchiveService.user.set({
      id: '123',
      email: 'test@example.com',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    fixture.detectChanges();

    component.logout();

    expect(mockArchiveService.user()).toBeNull();
  });
});
