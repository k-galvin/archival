import { Component, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { MagazineSpineComponent } from './core/layout/magazine-spine/magazine-spine.component';
import { MainNavComponent } from './core/layout/main-nav/main-nav.component';
import { MainFooterComponent } from './core/layout/main-footer/main-footer.component';
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MagazineSpineComponent,
    MainNavComponent,
    MainFooterComponent,
    PageLoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private router = inject(Router);

  isLoading = false;
  private timer: ReturnType<typeof setTimeout> | undefined = undefined;

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          // Set a timer to only show the loader if navigation is slow
          this.timer = setTimeout(() => {
            this.isLoading = true;
          }, 300); // 300ms delay
        } else {
          // Navigation has ended (or was cancelled/errored)
          if (this.timer) {
            clearTimeout(this.timer); // Clear the timer so the loader doesn't appear
          }
          this.isLoading = false; // Hide the loader if it was already visible
        }
      });
  }
}
