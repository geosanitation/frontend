import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconsRoutingModule } from './icons-routing.module';
// import { SharedModule } from 'src/app/shared/shared.module';
import { AddIconComponent } from './pages/add-icon/add-icon.component';
import { GenerateIconComponent } from './pages/generate-icon/generate-icon.component';
import { IconsComponent } from './pages/icons/icons.component';
import { UpdateIconComponent } from './pages/update-icon/update-icon.component';
import { UpdateTagsComponent } from './pages/update-tags/update-tags.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [IconsComponent, UpdateIconComponent, AddIconComponent, GenerateIconComponent, UpdateTagsComponent],
  imports: [
    CommonModule,
    SharedModule,
    IconsRoutingModule,
  ],
  exports:[GenerateIconComponent, IconsComponent]
})
export class IconsModule { }
