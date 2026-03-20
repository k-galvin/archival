import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ArchiveService } from './archive.service';
import { SUPABASE_CLIENT } from './supabase-client.token';

class MockSupabaseClient {
  auth = {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
    signUp: () => Promise.resolve({}),
    signInWithPassword: () => Promise.resolve({}),
    signOut: () => Promise.resolve(),
  };

  from = () => ({
    select: () => ({
      eq: () => ({
        data: [],
        error: null,
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () => ({
          data: {},
          error: null,
        }),
      }),
    }),
    delete: () => ({
      eq: () => ({
        error: null,
      }),
    }),
    match: () => ({
      error: null,
    }),
  });

  storage = {
    from: () => ({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  };
}

describe('ArchiveService', () => {
  let service: ArchiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArchiveService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SUPABASE_CLIENT, useClass: MockSupabaseClient },
      ],
    });
    service = TestBed.inject(ArchiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
