import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagazineSpineComponent } from './magazine-spine.component';

describe('MagazineSpineComponent', () => {
  let component: MagazineSpineComponent;
  let fixture: ComponentFixture<MagazineSpineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagazineSpineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagazineSpineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
