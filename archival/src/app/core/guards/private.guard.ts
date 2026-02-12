import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ArchiveService } from '../services/archive.service';

export const privateGuard: CanActivateFn = async () => {
  const archiveService = inject(ArchiveService);
  const router = inject(Router);

  // Wait for the auth state to be loaded
  while (archiveService.loading()) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (archiveService.user()) {
    return true; // Allow access if logged in
  } else {
    // Redirect to the landing page if not logged in
    return router.createUrlTree(['']);
  }
};
