import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RisksHazardsRoutingModule } from './risks-hazards-routing.module';
import { RisksHazardsComponent } from './risks-hazards.component';
import { InstamapComponent } from './pages/instamap/instamap.component';
import { SharedModule } from '../shared/shared.module';
import { AddPictureDialogComponent } from './pages/add-picture-dialog/add-picture-dialog.component';
import { ManagePicturesDialogComponent } from './pages/manage-pictures-dialog/manage-pictures-dialog.component';
import { EditPictureDialogComponent } from './pages/edit-picture-dialog/edit-picture-dialog.component';
import { InstamapFeatureDialogComponent } from './pages/instamap-feature-dialog/instamap-feature-dialog.component';


@NgModule({
  declarations: [
    RisksHazardsComponent,
    InstamapComponent,
    AddPictureDialogComponent,
    ManagePicturesDialogComponent,
    EditPictureDialogComponent,
    InstamapFeatureDialogComponent
  ],
  imports: [
    CommonModule,
    RisksHazardsRoutingModule,
    SharedModule
  ]
})
export class RisksHazardsModule { }
