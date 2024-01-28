import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayersComponent } from './layers.component';
import { GroupsListComponent } from './pages/groups-list/groups-list.component';
import { LayerDetailsLayoutComponent } from './pages/layer-details-layout/layer-details-layout.component';
import { LayersListComponent } from './pages/layers-list/layers-list.component';

const routes: Routes = [
  {
    path: "",
    component: LayersComponent,
    children: [
      {
        path: "",
        component: GroupsListComponent
      },
      {
        path: ":group_id/layers",
        component: LayersListComponent,
        children: [
          {
            path: ":layer_id",
            component: LayerDetailsLayoutComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayersRoutingModule { }
