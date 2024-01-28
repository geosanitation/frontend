import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';
import { LayersListComponent } from './pages/layers-list/layers-list.component';
import { MapComponent } from './pages/map/map.component';
import { SectorsListComponent } from './pages/sectors-list/sectors-list.component';
import { TableOfContentsComponent } from './pages/sidenav-right/table-of-contents/table-of-contents.component';
import { LegendComponent } from './pages/sidenav-right/legend/legend.component';
import { PrintMapComponent } from './pages/print-map/print-map.component';


@NgModule({
  declarations: [
    MapComponent,
    SectorsListComponent,
    LayersListComponent,
    TableOfContentsComponent,
    LegendComponent,
    PrintMapComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule

  ]
})
export class MapModule { }
