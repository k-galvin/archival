import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ArchiveService } from './core/services/archive.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj('ArchiveService', [], {
      loading: signal(false),
      user: signal(null),
      isLoggingOut: signal(false),
      isLoggingIn: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have isLoading set to false by default`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.isLoading()).toBe(false);
  });
});
