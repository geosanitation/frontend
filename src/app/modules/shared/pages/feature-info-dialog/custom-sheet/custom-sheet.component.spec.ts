import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSheetComponent } from './custom-sheet.component';

describe('CustomSheetComponent', () => {
  let component: CustomSheetComponent;
  let fixture: ComponentFixture<CustomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
