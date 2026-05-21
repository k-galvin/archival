import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal, Component } from '@angular/core';

import { publicGuard } from './public.guard';
import { ArchiveService } from '../services/archive.service';
import { User } from '@supabase/supabase-js';

// Mock page components for testing
@Component({
  standalone: true,
  template: '<h1>Public Page</h1>',
})
class PublicComponent {}

@Component({
  standalone: true,
  template: '<h1>Gallery Page</h1>',
})
class GalleryComponent {}

describe('publicGuard', () => {
  async function setup() {
    const mockArchiveService = {
      loading: signal(false),
      user: signal<User | null>(null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ArchiveService, useValue: mockArchiveService },
        provideRouter([
          {
            path: 'public',
            component: PublicComponent,
            canActivate: [publicGuard],
          },
          { path: 'gallery', component: GalleryComponent },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    return { harness, mockArchiveService };
  }

  it('should allow navigation if the user is not logged in', async () => {
    const { harness, mockArchiveService } = await setup();
    mockArchiveService.user.set(null);

    await harness.navigateByUrl('/public', PublicComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Public Page');
  });

  it('should redirect to the gallery page if the user is logged in', async () => {
    const { harness, mockArchiveService } = await setup();
    mockArchiveService.user.set({ id: '123' } as User);

    await harness.navigateByUrl('/public', GalleryComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Gallery Page');
  });

  it('should wait for the auth state to be loaded', async () => {
    const { harness, mockArchiveService } = await setup();
    mockArchiveService.loading.set(true);

    const navigatePromise = harness.navigateByUrl('/public', PublicComponent);

    // Wait a bit to ensure the guard is waiting, then resolve
    await new Promise((resolve) => setTimeout(resolve, 50));
    mockArchiveService.loading.set(false);

    await navigatePromise;
    expect(harness.routeNativeElement?.textContent).toContain('Public Page');
  });
});
