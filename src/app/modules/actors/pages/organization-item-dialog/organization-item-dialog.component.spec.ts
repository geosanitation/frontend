import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationItemDialogComponent } from './organization-item-dialog.component';

describe('OrganizationItemDialogComponent', () => {
  let component: OrganizationItemDialogComponent;
  let fixture: ComponentFixture<OrganizationItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationItemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
