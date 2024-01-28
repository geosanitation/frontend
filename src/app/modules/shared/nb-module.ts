import { NgModule } from "@angular/core";
import {
  NbCardModule,
  NbIconModule,
  NbButtonModule,
  NbAccordionModule,
  NbListModule,
  NbMenuModule,
  NbToggleModule,
  NbTabsetModule,
  NbSidebarModule,
  NbLayoutModule,
  NbTooltipModule,
  NbContextMenuModule,
  NbBadgeModule,
  NbSpinnerModule,
  NbCheckboxModule,
  NbInputModule,
  NbSelectModule,
  NbButtonGroupModule,
  NbFormFieldModule,
  NbDatepickerModule,
  NbTimepickerModule,
  NbAlertModule,
  NbUserModule
} from "@nebular/theme";
import { ThemeModule } from "src/app/@theme/theme.module";
// import { MatCarouselModule } from '@ngbmodule/material-carousel';

@NgModule({
  exports: [
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbMenuModule,
    NbContextMenuModule,
    NbCardModule,
    NbListModule,
    NbAccordionModule,
    NbToggleModule,
    NbIconModule,
    NbButtonModule,
    NbTabsetModule,
    NbSidebarModule,
    NbLayoutModule,
    NbTooltipModule,
    NbBadgeModule,
    NbSpinnerModule,
    NbCheckboxModule,
    NbInputModule,
    NbSelectModule,
    NbButtonGroupModule,
    NbFormFieldModule,
    NbDatepickerModule,
    NbTimepickerModule,
    NbAlertModule,
    ThemeModule,
    NbUserModule
    // MatCarouselModule,
  ],
  providers: [],
})
export class ComponentNbModule {}
