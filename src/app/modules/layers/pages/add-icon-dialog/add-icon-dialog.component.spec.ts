import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIconDialogComponent } from './add-icon-dialog.component';

describe('AddIconDialogComponent', () => {
  let component: AddIconDialogComponent;
  let fixture: ComponentFixture<AddIconDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddIconDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIconDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
