import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ArchiveService } from './archive.service';
import { MockSupabaseClient } from './supabase.service.mock';

describe('ArchiveService', () => {
  let service: ArchiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ArchiveService);
    service.supabase = new MockSupabaseClient() as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
