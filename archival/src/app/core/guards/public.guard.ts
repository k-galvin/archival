import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ArchiveService } from '../services/archive.service';

export const publicGuard: CanActivateFn = async () => {
  const archiveService = inject(ArchiveService);
  const router = inject(Router);

  // Wait for the auth state to be loaded
  while (archiveService.loading()) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (archiveService.user()) {
    // If user is logged in, redirect to gallery
    return router.createUrlTree(['/gallery']);
  } else {
    // If user is not logged in, allow access to the route
    return true;
  }
};
