import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPictureDialogComponent } from './edit-picture-dialog.component';

describe('EditPictureDialogComponent', () => {
  let component: EditPictureDialogComponent;
  let fixture: ComponentFixture<EditPictureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPictureDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPictureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
