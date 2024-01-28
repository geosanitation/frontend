import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPictureDialogComponent } from './add-picture-dialog.component';

describe('AddPictureDialogComponent', () => {
  let component: AddPictureDialogComponent;
  let fixture: ComponentFixture<AddPictureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPictureDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPictureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
