import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { ArchiveService } from '../services/archive.service';

/**
 * A functional guard that restricts access to public-only routes (like Landing or Auth).
 * It ensures the application has finished its initial auth check before deciding.
 * If the user is already authenticated, it redirects them to the gallery.
 * Otherwise, it allows access to the public route.
 */
export const publicGuard: CanActivateFn = async () => {
  const archiveService = inject(ArchiveService);
  const router = inject(Router);

  // Wait for the auth state to be loaded reactively
  if (archiveService.loading()) {
    await firstValueFrom(
      toObservable(archiveService.loading).pipe(filter((loading) => !loading)),
    );
  }

  if (archiveService.user()) {
    // If user is logged in, redirect to gallery
    return router.createUrlTree(['/gallery']);
  } else {
    // If user is not logged in, allow access to the route
    return true;
  }
};
