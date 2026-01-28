import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'gallery', pathMatch: 'full' },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(
        (m) => m.GalleryComponent,
      ),
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./features/map/map.component').then((m) => m.MapComponent),
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
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
];
