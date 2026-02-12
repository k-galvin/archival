import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WritableSignal, signal } from '@angular/core';

import { privateGuard } from './private.guard';
import { ArchiveService } from '../services/archive.service';
import { User } from '@supabase/supabase-js';

describe('privateGuard', () => {
  let mockArchiveService: {
    loading: WritableSignal<boolean>;
    user: WritableSignal<User | null>;
  };
  let mockRouter: Router;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => privateGuard(...guardParameters));

  beforeEach(() => {
    mockArchiveService = {
      loading: signal(false),
      user: signal(null),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }],
    });

    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'createUrlTree').and.callThrough();
  });

  it('should return true if the user is logged in', async () => {
    mockArchiveService.user.set({ id: '123' } as User);

    const canActivate = await executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(canActivate).toBe(true);
  });

  it('should redirect to the landing page if the user is not logged in', async () => {
    const canActivate = await executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(canActivate instanceof UrlTree).toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['']);
  });

  it('should wait for the auth state to be loaded', async () => {
    mockArchiveService.loading.set(true);
    mockArchiveService.user.set(null);

    const promise = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    // Change the loading state after a short delay
    setTimeout(() => {
      mockArchiveService.loading.set(false);
    }, 100);

    const canActivate = await promise;
    expect(canActivate instanceof UrlTree).toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['']);
  });
});
