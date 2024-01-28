import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisksHazardsComponent } from './risks-hazards.component';

describe('RisksHazardsComponent', () => {
  let component: RisksHazardsComponent;
  let fixture: ComponentFixture<RisksHazardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisksHazardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisksHazardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
