import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointDiagramSimpleComponent } from './point-diagram-simple.component';

describe('PointDiagramSimpleComponent', () => {
  let component: PointDiagramSimpleComponent;
  let fixture: ComponentFixture<PointDiagramSimpleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointDiagramSimpleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointDiagramSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
