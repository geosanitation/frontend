import { Feature, Geometry } from "../../ol-module";;
import { BasemapsDigitaliser, LayerToDigitalise } from "./layer-to-digitalise";

export interface ModelDataEdition {
  basemaps: BasemapsDigitaliser;
  layersToDigitalise: LayerToDigitalise[];
  //   getAllLegendsToNotSHow:(layersToDigitalise:LayerToDigitalise[])=> { alias: string; typologie: "polygon" | "point" | "linestring";}[]
  canCommitAttribute: (
    params: Array<{
      feature: Feature<Geometry>;
      layerToDigitalise: LayerToDigitalise;
    }>
  ) => Array<Feature<Geometry>>;
  canCommitGeometrys: (
    allComitedFeatures: {
      feature: Feature<Geometry>;
      layerToDigitalise: LayerToDigitalise;
    }[]
  ) => {
    feature: Feature<Geometry>;
    layerToDigitalise: LayerToDigitalise;
  }[];
}
