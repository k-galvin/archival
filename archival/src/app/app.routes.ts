import { Routes } from '@angular/router';
import { ChronologyComponent } from './chronology/chronology.component';
import { CollectionsComponent } from './collections/collections.component';
import { GalleryComponent } from './gallery/gallery.component';
import { InsightsComponent } from './insights/insights.component';
import { MapComponent } from './map/map.component';

export const routes: Routes = [
  { path: '', component: GalleryComponent },
  { path: 'collections', component: CollectionsComponent },
  { path: 'chronology', component: ChronologyComponent },
  { path: 'insights', component: InsightsComponent },
  { path: 'map', component: MapComponent },
];
