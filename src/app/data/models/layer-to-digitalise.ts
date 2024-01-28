import VectorLayer from "ol/layer/Vector";
import { StyleFunction } from "ol/style/Style";
import { BehaviorSubject } from "rxjs";
import { imagettesOptionsOl } from "../../data/models/type";
import {
  Feature,
  Geometry,
  Style,
  VectorSource
} from "../../ol-module";
;
// import { FeatureForSheet } from "../../modules/map/pages/descriptive-sheet/descriptive-sheet.component";

/**
 * Generer une legende de vectorlayer
 */

export interface DataForLegend {
  style: Style;
  title: string;
  checked: boolean;
  alias: string;
  geomType: "polygon" | "point" | "linestring";
  img: string;
}
export interface BasemapsDigitaliser {
  bamesMaps: Array<imagettesOptionsOl>;
}
export interface LayerToDigitalise {
  nom: string;
  canBeDelete: boolean;
  canBeAdd: boolean;
  canBeUpdate: boolean;
  style: StyleFunction;
  legend: BehaviorSubject<Array<DataForLegend>>;
  typologie: string;
  // selectedFeature: FeatureForSheet;
  layer: VectorLayer<VectorSource<Geometry>>;
  // layer:any
  /**
   * unique index of the layer in the array of all LayerToDigitalise
   */
  layer_id: number;
  /**
   * model in the database
   */
  // model: string;
  /**
   * field name of the id in database
   */
  fieldId: string;
  /**
   * this geometry can be edit by other operation: split, add a ring
   */
  geometryCanBeEditByOthers: boolean;
}

export interface FeatureStatus {
  id: string | number;
  updateAttribute: boolean;
  updateGeometry: boolean;
  deleted: boolean;
  new: boolean;
}

/**
 * Modèle de données pour envoyer les données à BD après edition/suppresion/addition
 */
export interface ResultOfDigitalise {
  updates: Array<Feature>;
  inserts: Array<Feature>;
  deletes: Array<Feature>;
}
