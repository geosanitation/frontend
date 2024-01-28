import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActorsRoutingModule } from './actors-routing.module';
import { ActorsComponent } from './actors.component';
import { OrganizationListComponent } from './pages/organization-list/organization-list.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { SharedModule } from '../shared/shared.module';
import { AddOrganizationDialogComponent } from './pages/add-organization-dialog/add-organization-dialog.component';
import { OrganizationItemDialogComponent } from './pages/organization-item-dialog/organization-item-dialog.component';
import { EditOrganizationDialogComponent } from './pages/edit-organization-dialog/edit-organization-dialog.component';
import { AddUserDialogComponent } from './pages/add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './pages/edit-user-dialog/edit-user-dialog.component';
import { UserItemDialogComponent } from './pages/user-item-dialog/user-item-dialog.component';


@NgModule({
  declarations: [
    ActorsComponent,
    OrganizationListComponent,
    UserListComponent,
    AddOrganizationDialogComponent,
    OrganizationItemDialogComponent,
    EditOrganizationDialogComponent,
    AddUserDialogComponent,
    EditUserDialogComponent,
    UserItemDialogComponent
  ],
  imports: [
    CommonModule,
    ActorsRoutingModule,
    SharedModule
  ]
})
export class ActorsModule { }
