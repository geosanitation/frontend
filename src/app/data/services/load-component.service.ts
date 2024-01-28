import {
  ComponentFactoryResolver, Injectable,
  ViewContainerRef
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Feature, Map } from "ol";
import { Subject } from "rxjs";
import { LayerToDigitalise } from "../models/layer-to-digitalise";

export interface AttributeForm {
  close: Subject<boolean>;
  feature: Feature;
  layerToDigitalise: LayerToDigitalise;
  form: FormGroup;
  map: Map;
  onSubmitInstance: () => void;
}

@Injectable({
  providedIn: "root",
})
export class LoadComponentService {
  constructor(private cfr: ComponentFactoryResolver) {}

  async loadComponent(
    vcr: ViewContainerRef
  ) {
    const component = await import(
      "src/app/modules/attribute-form/pages/features-form/features-form.component"
    ).then((m) => m.FeaturesFormComponent);
    vcr.clear();
    return vcr.createComponent<AttributeForm>(
      this.cfr.resolveComponentFactory<any>(component)
      // component
    );
  }
}
