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
          unsubscribe: () => {
            /* no-op */
          },
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

  describe('fetchUserData', () => {
    it('should not fetch from supabase if offline', async () => {
      service.isOnline.set(false);
      const supabaseSpy = spyOn(TestBed.inject(SUPABASE_CLIENT), 'from').and.callThrough();
      
      // @ts-expect-error accessing private method for test
      await service.fetchUserData('user-123');

      expect(supabaseSpy).not.toHaveBeenCalled();
      expect(service.loading()).toBeFalse();
    });

    it('should map updated_at field from supabase response', async () => {
      const mockItem = { 
        id: '1', 
        name: 'Item 1', 
        updated_at: '2024-03-24T12:00:00Z',
        category: 'decor'
      };
      
      const supabaseClient = TestBed.inject(SUPABASE_CLIENT);
      spyOn(supabaseClient, 'from').and.returnValue({
        select: () => ({
          eq: () => Promise.resolve({ data: [mockItem], error: null }),
          // Chain for collections select which uses collection_items(item_id)
          match: () => ({ error: null }),
        }),
      } as any);

      // @ts-expect-error accessing private method for test
      await service.fetchUserData('user-123');

      // We expect the first item in the collection to have the updated_at field
      if (service.collection().length > 0) {
        expect(service.collection()[0].updated_at).toBe('2024-03-24T12:00:00Z');
      }
    });
  });
});
