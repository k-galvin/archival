import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User, Session } from '@supabase/supabase-js';
import { of } from 'rxjs';

class MockArchiveService {
  user = signal<User | null>(null);
  loading = signal(false);
  authError = signal<string | null>(null);
  isLoggingOut = signal(false);
  isLoggingIn = signal(false);

  // Define as regular methods, then spyOn them in beforeEach
  async signUp(_email: string, _password: string, _name: string): Promise<{ user: User, session: Session | null }> { return { user: {} as User, session: {} as Session }; }
  async signIn(_email: string, _password: string): Promise<{ user: User, session: Session }> { return { user: {} as User, session: {} as Session }; }
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let mockArchiveService: MockArchiveService;
  let mockRouter: MockRouter;

  let signUpSpy: jasmine.Spy;
  let signInSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent], // Removed HttpClientTestingModule
      providers: [
        { provide: ArchiveService, useClass: MockArchiveService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useValue: { paramMap: of({}) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    mockArchiveService = TestBed.inject(ArchiveService) as unknown as MockArchiveService;
    mockRouter = TestBed.inject(Router) as unknown as MockRouter;

    // Now, create the spies on the injected instance methods
    signUpSpy = spyOn(mockArchiveService, 'signUp').and.callThrough();
    signInSpy = spyOn(mockArchiveService, 'signIn').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isLogin, reset successMessage and authError on toggleMode()', () => {
    // Set initial state
    component.isLogin.set(true);
    component.successMessage.set('Some success message');
    mockArchiveService.authError.set('Some error');

    component.toggleMode();

    expect(component.isLogin()).toBe(false);
    expect(component.successMessage()).toBeNull();
    expect(mockArchiveService.authError()).toBeNull();

    component.toggleMode();

    expect(component.isLogin()).toBe(true);
    expect(component.successMessage()).toBeNull();
    expect(mockArchiveService.authError()).toBeNull();
  });

  it('should handle successful login via handleSubmit()', async () => {
    component.isLogin.set(true);
    component.authData = { email: 'test@example.com', password: 'password123', name: '' };
    signInSpy.and.returnValue(Promise.resolve({
      user: { id: '123', email: 'test@example.com' } as User,
      session: { user: { id: '123', email: 'test@example.com' } } as unknown as Session,
    }));

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(signInSpy).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(component.successMessage()).toBeNull(); // Ensure no success message on login
  });

  it('should handle login error via handleSubmit()', async () => {
    spyOn(console, 'error'); // Suppress noise from expected error
    component.isLogin.set(true);
    component.authData = { email: 'test@example.com', password: 'password123', name: '' };
    const error = new Error('Login failed');
    signInSpy.and.callFake(() => {
      mockArchiveService.authError.set('Login failed');
      return Promise.reject(error);
    });

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(signInSpy).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    // The component catches the error, but the ArchiveService should set the authError signal.
    // The test ensures the component's state management (isSubmitting) is correct.
    expect(mockArchiveService.authError()).not.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle successful sign-up (with session) via handleSubmit()', async () => {
    component.isLogin.set(false); // Switch to sign-up mode
    component.authData = { email: 'new@example.com', password: 'password123', name: 'New User' };
    signUpSpy.and.returnValue(Promise.resolve({
      user: { id: '456', email: 'new@example.com' } as User,
      session: { user: { id: '456', email: 'new@example.com' } } as unknown as Session,
    }));

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(signUpSpy).toHaveBeenCalledWith('new@example.com', 'password123', 'New User');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(component.successMessage()).toBeNull();
  });

  it('should handle successful sign-up (no session, email confirmation) via handleSubmit()', async () => {
    component.isLogin.set(false); // Switch to sign-up mode
    component.authData = { email: 'confirm@example.com', password: 'password123', name: 'Confirm User' };
    signUpSpy.and.returnValue(Promise.resolve({
      user: { id: '789', email: 'confirm@example.com' } as User,
      session: null, // Simulate email confirmation required
    }));

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(signUpSpy).toHaveBeenCalledWith('confirm@example.com', 'password123', 'Confirm User');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.successMessage()).toBe('Registration successful. Please check your email inbox to confirm your account before logging in.');
    expect(component.isLogin()).toBe(true);
  });

  it('should handle sign-up error via handleSubmit()', async () => {
    spyOn(console, 'error'); // Suppress noise from expected error
    component.isLogin.set(false); // Switch to sign-up mode
    component.authData = { email: 'fail@example.com', password: 'password123', name: 'Fail User' };
    const error = new Error('Sign-up failed');
    signUpSpy.and.callFake(() => {
      mockArchiveService.authError.set('Sign-up failed');
      return Promise.reject(error);
    });

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(signUpSpy).toHaveBeenCalledWith('fail@example.com', 'password123', 'Fail User');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.successMessage()).toBeNull();
    // The component catches the error, but the ArchiveService should set the authError signal.
    expect(mockArchiveService.authError()).not.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
