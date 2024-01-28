import { Modify, Snap, VectorLayer, Feature, Style, VectorSource, Geometry } from "../../ol-module";
import { ComponentType } from "@angular/cdk/portal";

/**
 * interaction to add features in a layer
 */
export interface AddInteraction {
    interaction: Modify,
    snap: Snap,
    keyEvents: Array<any>,
    /**
     * Layer that will be use to add features
     */
    layer: VectorLayer<VectorSource<Geometry>>,
    attributeForm : ComponentType<any>

    // featuresSartAdd: Feature,
    // layer_properties: layer_properties_interface,
    // coords_length: number;
    // elemCartoType: elemCartoInterface
}

export interface updateGeometryInteraction {
    /**
     * list off layers that can be geometry
     */
    layers: Array<{
      layer: VectorLayer<VectorSource<Geometry>>;
      style: Style;
      name:string
      icon:string
    }>;
    // center: {
    //   coordinates: Array<number>;
    //   zoom: number
    // }
    /**
     * Can we save all editions ?
     * @param dialog EditionGeographiqueComponent
     */
    // canSave(dialog:EditionGeographiqueComponent):{
    //   error:boolean,
    //   msg?:string
    // }
    /**
     * can we commit a geometry add
     * @param dialog EditionGeographiqueComponent
     * @param featureAdded Feature
     * @param layer_properties layer_properties_interface
     */
    // canCommitGeometryAdd(dialog:EditionGeographiqueComponent, featureAdded:Feature, layer_properties:layer_properties_interface):{
    //   error:boolean,
    //   msg?:string
    // }
  }

export interface updatePropertiesFeature {
    /**
     * layer that can be editable
     */
    layers: Array<{
        layer: VectorLayer<VectorSource<Geometry>>;
        attributeForm : ComponentType<any>
        name:string
        icon:string
      }>;
}