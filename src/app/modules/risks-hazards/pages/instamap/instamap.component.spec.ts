import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstamapComponent } from './instamap.component';

describe('InstamapComponent', () => {
  let component: InstamapComponent;
  let fixture: ComponentFixture<InstamapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstamapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstamapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
