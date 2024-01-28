import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstamapFeatureDialogComponent } from './instamap-feature-dialog.component';

describe('InstamapFeatureDialogComponent', () => {
  let component: InstamapFeatureDialogComponent;
  let fixture: ComponentFixture<InstamapFeatureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstamapFeatureDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstamapFeatureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
