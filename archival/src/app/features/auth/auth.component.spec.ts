import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthComponent } from './auth.component';
import { ArchiveService } from '../../core/services/archive.service';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, Session } from '@supabase/supabase-js';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      ['signUp', 'signIn'],
      {
        authError: signal(null),
        isLoggingIn: signal(false),
      }
    );

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AuthComponent, HttpClientTestingModule],
      providers: [
        { provide: ArchiveService, useValue: mockArchiveService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
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
    mockArchiveService.signIn.and.returnValue(Promise.resolve({
      user: { id: '123', email: 'test@example.com' } as User,
      session: { user: { id: '123', email: 'test@example.com' } } as unknown as Session,
    }));

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(mockArchiveService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(component.successMessage()).toBeNull(); // Ensure no success message on login
  });

  it('should handle login error via handleSubmit()', async () => {
    component.isLogin.set(true);
    component.authData = { email: 'test@example.com', password: 'password123', name: '' };
    const error = new Error('Login failed');
    mockArchiveService.signIn.and.callFake(() => {
      mockArchiveService.authError.set('Login failed');
      return Promise.reject(error);
    });

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(mockArchiveService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    // The component catches the error, but the ArchiveService should set the authError signal.
    // The test ensures the component's state management (isSubmitting) is correct.
    expect(mockArchiveService.authError()).not.toBeNull();
  });

  it('should handle successful sign-up (with session) via handleSubmit()', async () => {
    component.isLogin.set(false); // Switch to sign-up mode
    component.authData = { email: 'new@example.com', password: 'password123', name: 'New User' };
    mockArchiveService.signUp.and.returnValue(Promise.resolve({
      user: { id: '456', email: 'new@example.com' } as User,
      session: { user: { id: '456', email: 'new@example.com' } } as unknown as Session,
    }));

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(mockArchiveService.signUp).toHaveBeenCalledWith('new@example.com', 'password123', 'New User');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/gallery']);
    expect(component.successMessage()).toBeNull();
  });

  it('should handle successful sign-up (no session, email confirmation) via handleSubmit()', async () => {
    component.isLogin.set(false); // Switch to sign-up mode
    component.authData = { email: 'confirm@example.com', password: 'password123', name: 'Confirm User' };
    mockArchiveService.signUp.and.returnValue(Promise.resolve({
      user: { id: '789', email: 'confirm@example.com' } as User,
      session: null, // Simulate email confirmation required
    }));

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(mockArchiveService.signUp).toHaveBeenCalledWith('confirm@example.com', 'password123', 'Confirm User');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.successMessage()).toBe('Registration successful. Please check your email inbox to confirm your account before logging in.');
    expect(component.isLogin()).toBe(true);
  });

  it('should handle sign-up error via handleSubmit()', async () => {
    component.isLogin.set(false); // Switch to sign-up mode
    component.authData = { email: 'fail@example.com', password: 'password123', name: 'Fail User' };
    const error = new Error('Sign-up failed');
    mockArchiveService.signUp.and.callFake(() => {
      mockArchiveService.authError.set('Sign-up failed');
      return Promise.reject(error);
    });

    await component.handleSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(mockArchiveService.signUp).toHaveBeenCalledWith('fail@example.com', 'password123', 'Fail User');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.successMessage()).toBeNull();
    // The component catches the error, but the ArchiveService should set the authError signal.
    expect(mockArchiveService.authError()).not.toBeNull();
  });
});
