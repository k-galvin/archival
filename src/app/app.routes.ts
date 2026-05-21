import { Routes } from '@angular/router';
import { privateGuard } from './core/guards/private.guard';
import { publicGuard } from './core/guards/public.guard';
import { LandingComponent } from './features/landing/landing.component';
import { GalleryComponent } from './features/gallery/gallery.component';
import { AcquisitionComponent } from './features/acquisition/acquisition.component';
import { CollectionsComponent } from './features/collections/collections.component';
import { BlueprintComponent } from './features/blueprint/blueprint.component';
import { InsightsComponent } from './features/insights/insights.component';
import { ChronologyComponent } from './features/chronology/chronology.component';
import { ItemDetailComponent } from './features/item-detail/item-detail.component';

/**
 * The primary routing configuration for the Archival application.
 * Routes are partitioned into:
 * - Public routes: accessible only when logged out (Landing, Auth)
 * - Private routes: accessible only when logged in (Gallery, Acquire, etc.)
 */
export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [publicGuard],
  },
  {
    path: '',
    canActivate: [privateGuard],
    children: [
      {
        path: 'gallery',
        component: GalleryComponent,
      },
      {
        path: 'acquire',
        component: AcquisitionComponent,
      },
      {
        path: 'collections',
        component: CollectionsComponent,
      },
      {
        path: 'blueprint',
        component: BlueprintComponent,
      },
      {
        path: 'insights',
        component: InsightsComponent,
      },
      {
        path: 'chronology',
        component: ChronologyComponent,
      },
      {
        path: 'item/:id',
        component: ItemDetailComponent,
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
    canActivate: [publicGuard],
  },
];
