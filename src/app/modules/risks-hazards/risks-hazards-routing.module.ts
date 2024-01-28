import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RisksHazardsComponent } from './risks-hazards.component';
import { InstamapComponent } from './pages/instamap/instamap.component';

const routes: Routes = [
  {
    path: "",
    component: RisksHazardsComponent,
    children: [
      {
        path: "instamap",
        component: InstamapComponent
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RisksHazardsRoutingModule { }
