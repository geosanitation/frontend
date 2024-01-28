import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComponentMaterialModule } from "./material-module";
import { ColorPickerComponent } from "./pages/color-picker/color-picker.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { NotifierModule } from "angular-notifier";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SafeStylePipe } from "./pipe/safe-style.pipe";
import { SecurePipe } from "./pipe/secure.pipe";
import { ColorPickerModule } from "ngx-color-picker";
import { FileUploadComponent } from "./pages/file-upload/file-upload.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ConfirmationDialogComponent } from "./pages/confirmation-dialog/confirmation-dialog.component";
import { ComponentNbModule } from "./nb-module";
import { BasemapSwitcherComponent } from "./pages/basemap-switcher/basemap-switcher.component";
import { FeatureInfoDialogComponent } from "./pages/feature-info-dialog/feature-info-dialog.component";
import { CustomSheetComponent } from "./pages/feature-info-dialog/custom-sheet/custom-sheet.component";

@NgModule({
  declarations: [
    ColorPickerComponent,
    SafeStylePipe,
    SecurePipe,
    FileUploadComponent,
    ConfirmationDialogComponent,
    BasemapSwitcherComponent,
    FeatureInfoDialogComponent,
    CustomSheetComponent
  ],
  imports: [
    CommonModule,
    ComponentMaterialModule,
    ComponentNbModule,
    NotifierModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ColorPickerModule,
  ],
  exports: [
    ComponentMaterialModule,
    ComponentNbModule,
    TranslateModule,
    NotifierModule,
    ColorPickerComponent,
    SafeStylePipe,
    ColorPickerModule,
    SecurePipe,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FileUploadComponent,
    BasemapSwitcherComponent,
    FeatureInfoDialogComponent,
    CustomSheetComponent
  ],
})
export class SharedModule {
  constructor(private translate: TranslateService) {
    translate.addLangs(["fr"]);
    translate.setDefaultLang("fr");
    translate.use("fr");
  }
}
