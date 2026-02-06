import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BlueprintComponent } from './blueprint.component';
import { ArchiveService } from '../../core/services/archive.service';
import { MockArchiveService } from '../../core/services/archive.service.mock';

describe('BlueprintComponent', () => {
  let component: BlueprintComponent;
  let fixture: ComponentFixture<BlueprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueprintComponent, HttpClientTestingModule],
      providers: [{ provide: ArchiveService, useClass: MockArchiveService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlueprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
