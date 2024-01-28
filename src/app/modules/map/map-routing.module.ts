import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayersListComponent } from './pages/layers-list/layers-list.component';
import { MapComponent } from './pages/map/map.component';
import { SectorsListComponent } from './pages/sectors-list/sectors-list.component';


const routes: Routes = [
  {
    path: "",
    component: MapComponent,
    children: [
      {
        path: "",
        component: SectorsListComponent,
      },
      {
        path: "groups/:group_id/layers",
        component: LayersListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapRoutingModule { }
