import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MagazineSpineComponent } from './core/layout/magazine-spine/magazine-spine.component';
import { MainNavComponent } from './core/layout/main-nav/main-nav.component';
import { MainFooterComponent } from './core/layout/main-footer/main-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MagazineSpineComponent,
    MainNavComponent,
    MainFooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // The logic for branding, navigation links, and archive metadata
  // has been delegated to the respective sub-components and the
  // ArchiveService, leaving this shell focused purely on the layout.
}
