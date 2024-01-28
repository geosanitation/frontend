import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActorsComponent } from './actors.component';
import { OrganizationListComponent } from './pages/organization-list/organization-list.component';
import { UserListComponent } from './pages/user-list/user-list.component';

const routes: Routes = [
  {
    path: "",
    component: ActorsComponent,
    children: [
      {
        path: "organizations",
        component: OrganizationListComponent
      },
      {
        path: "users",
        component: UserListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActorsRoutingModule { }
