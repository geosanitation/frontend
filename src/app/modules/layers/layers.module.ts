import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IconsModule } from '../icons/icons.module';
import { SharedModule } from '../shared/shared.module';
import { LayersRoutingModule } from './layers-routing.module';
import { LayersComponent } from './layers.component';
import { AddGroupComponent } from './pages/add-group/add-group.component';
import { AddIconDialogComponent } from './pages/add-icon-dialog/add-icon-dialog.component';
import { AddLayerComponent } from './pages/add-layer/add-layer.component';
import { GroupItemComponent } from './pages/group-item/group-item.component';
import { GroupsListComponent } from './pages/groups-list/groups-list.component';
import { LayerDetailsLayoutComponent } from './pages/layer-details-layout/layer-details-layout.component';
import { LayerDetailsComponent } from './pages/layer-details/layer-details.component';
import { LayerItemComponent } from './pages/layer-item/layer-item.component';
import { LayersListComponent } from './pages/layers-list/layers-list.component';
import { LayerViewerComponent } from './pages/layer-viewer/layer-viewer.component';
import { LayerStyleComponent } from './pages/layer-style/layer-style.component';
import { LayerFieldsComponent } from './pages/layer-fields/layer-fields.component';
import { LayerEditComponent } from './pages/layer-edit/layer-edit.component';
import { EditStyleComponent } from './pages/layer-style/edit-style/edit-style.component';
import { QmlComponent } from './pages/layer-style/qml/qml.component';
import { PolygonSimpleComponent } from './pages/layer-style/polygon-simple/polygon-simple.component';
import { PointIconSimpleComponent } from './pages/layer-style/point-icon-simple/point-icon-simple.component';
import { PointDiagramSimpleComponent } from './pages/layer-style/point-diagram-simple/point-diagram-simple.component';
import { LineSimpleComponent } from './pages/layer-style/line-simple/line-simple.component';
import { ClusterComponent } from './pages/layer-style/cluster/cluster.component';


@NgModule({
  declarations: [
    LayersListComponent,
    LayersComponent,
    GroupsListComponent,
    LayerDetailsComponent,
    LayerDetailsLayoutComponent,
    AddGroupComponent,
    GroupItemComponent,
    AddLayerComponent,
    AddIconDialogComponent,
    LayerItemComponent,
    LayerViewerComponent,
    LayerStyleComponent,
    LayerFieldsComponent,
    LayerEditComponent,
    EditStyleComponent,
    QmlComponent,
    PolygonSimpleComponent,
    PointIconSimpleComponent,
    PointDiagramSimpleComponent,
    LineSimpleComponent,
    ClusterComponent
  ],
  imports: [
    CommonModule,
    LayersRoutingModule,
    SharedModule,
    IconsModule,
  ]
})
export class LayersModule { }
