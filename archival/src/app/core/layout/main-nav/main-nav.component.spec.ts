import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainNavComponent } from './main-nav.component';
import { ArchiveService } from '../../services/archive.service';
import { signal } from '@angular/core';

describe('MainNavComponent', () => {
  let component: MainNavComponent;
  let fixture: ComponentFixture<MainNavComponent>;
  let mockArchiveService: jasmine.SpyObj<ArchiveService>;

  beforeEach(async () => {
    mockArchiveService = jasmine.createSpyObj(
      'ArchiveService',
      ['signOut'], // The signOut method is called
      {
        user: signal(null), // Default to null for not logged in
      }
    );

    await TestBed.configureTestingModule({
      imports: [MainNavComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: ArchiveService, useValue: mockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
