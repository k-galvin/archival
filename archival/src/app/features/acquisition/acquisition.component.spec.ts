import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcquisitionComponent } from './acquisition.component';

describe('AcquisitionComponent', () => {
  let component: AcquisitionComponent;
  let fixture: ComponentFixture<AcquisitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcquisitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcquisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
