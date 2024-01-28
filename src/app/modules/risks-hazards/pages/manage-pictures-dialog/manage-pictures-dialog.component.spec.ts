import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePicturesDialogComponent } from './manage-pictures-dialog.component';

describe('ManagePicturesDialogComponent', () => {
  let component: ManagePicturesDialogComponent;
  let fixture: ComponentFixture<ManagePicturesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagePicturesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePicturesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
