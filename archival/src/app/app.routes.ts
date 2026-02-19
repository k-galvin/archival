import { Routes } from '@angular/router';
import { privateGuard } from './core/guards/private.guard';
import { publicGuard } from './core/guards/public.guard';
import { LandingComponent } from './features/landing/landing.component';

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
        loadComponent: () =>
          import('./features/gallery/gallery.component').then(
            (m) => m.GalleryComponent,
          ),
      },
      {
        path: 'blueprint',
        loadComponent: () =>
          import('./features/blueprint/blueprint.component').then(
            (m) => m.BlueprintComponent,
          ),
      },
      {
        path: 'chronology',
        loadComponent: () =>
          import('./features/chronology/chronology.component').then(
            (m) => m.ChronologyComponent,
          ),
      },
      {
        path: 'insights',
        loadComponent: () =>
          import('./features/insights/insights.component').then(
            (m) => m.InsightsComponent,
          ),
      },
      {
        path: 'collections',
        loadComponent: () =>
          import('./features/collections/collections.component').then(
            (m) => m.CollectionsComponent,
          ),
      },
      {
        path: 'acquire',
        loadComponent: () =>
          import('./features/acquisition/acquisition.component').then(
            (m) => m.AcquisitionComponent,
          ),
      },
      {
        path: 'item/:id',
        loadComponent: () =>
          import('./features/item-detail/item-detail.component').then(
            (m) => m.ItemDetailComponent,
          ),
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
