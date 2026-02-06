import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InsightsComponent } from './insights.component';
import { ArchiveService } from '../../core/services/archive.service';
import { MockArchiveService } from '../../core/services/archive.service.mock';

describe('InsightsComponent', () => {
  let component: InsightsComponent;
  let fixture: ComponentFixture<InsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightsComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useClass: MockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
