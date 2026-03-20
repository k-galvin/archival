import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal, Component } from '@angular/core';

import { privateGuard } from './private.guard';
import { ArchiveService } from '../services/archive.service';
import { User } from '@supabase/supabase-js';

// Mock page components for testing
@Component({
  standalone: true,
  template: '<h1>Private Page</h1>',
})
class PrivateComponent {}

@Component({
  standalone: true,
  template: '<h1>Landing Page</h1>',
})
class LandingComponent {}

describe('privateGuard', () => {
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
            path: 'private',
            component: PrivateComponent,
            canActivate: [privateGuard],
          },
          { path: '', component: LandingComponent },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    return { harness, mockArchiveService };
  }

  it('should allow navigation if the user is logged in', async () => {
    const { harness, mockArchiveService } = await setup();
    mockArchiveService.user.set({ id: '123' } as User);

    await harness.navigateByUrl('/private', PrivateComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Private Page');
  });

  it('should redirect to the landing page if the user is not logged in', async () => {
    const { harness, mockArchiveService } = await setup();
    mockArchiveService.user.set(null);

    await harness.navigateByUrl('/private', LandingComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Landing Page');
  });

  it('should wait for the auth state to be loaded', async () => {
    const { harness, mockArchiveService } = await setup();
    mockArchiveService.loading.set(true);
    mockArchiveService.user.set(null);

    const navigatePromise = harness.navigateByUrl('/private', LandingComponent);

    // Wait a bit to ensure the guard is waiting, then resolve
    await new Promise((resolve) => setTimeout(resolve, 50));
    mockArchiveService.loading.set(false);

    await navigatePromise;
    expect(harness.routeNativeElement?.textContent).toContain('Landing Page');
  });
});
