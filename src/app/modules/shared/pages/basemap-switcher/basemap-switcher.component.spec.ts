import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasemapSwitcherComponent } from './basemap-switcher.component';

describe('BasemapSwitcherComponent', () => {
  let component: BasemapSwitcherComponent;
  let fixture: ComponentFixture<BasemapSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasemapSwitcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasemapSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
