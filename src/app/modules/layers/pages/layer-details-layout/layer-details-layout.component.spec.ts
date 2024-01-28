import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerDetailsLayoutComponent } from './layer-details-layout.component';

describe('LayerDetailsLayoutComponent', () => {
  let component: LayerDetailsLayoutComponent;
  let fixture: ComponentFixture<LayerDetailsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayerDetailsLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerDetailsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
