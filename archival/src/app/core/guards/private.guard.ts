import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { ArchiveService } from '../services/archive.service';

export const privateGuard: CanActivateFn = async () => {
  const archiveService = inject(ArchiveService);
  const router = inject(Router);

  // Wait for the auth state to be loaded reactively
  if (archiveService.loading()) {
    await firstValueFrom(
      toObservable(archiveService.loading).pipe(filter((loading) => !loading)),
    );
  }

  if (archiveService.user()) {
    return true; // Allow access if logged in
  } else {
    // Redirect to the landing page if not logged in
    return router.createUrlTree(['']);
  }
};
