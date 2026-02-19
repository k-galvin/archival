import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ArchiveService } from './archive.service';
import { MockSupabaseClient } from './supabase.service.mock';
import { SUPABASE_CLIENT } from './supabase-client.token';

describe('ArchiveService', () => {
  let service: ArchiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: SUPABASE_CLIENT, useClass: MockSupabaseClient }
      ]
    });
    service = TestBed.inject(ArchiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
