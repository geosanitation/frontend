import { Layer, Tile as TileLayer } from "ol/layer";
import { OSM, TileImage, TileJSON } from "ol/source";
import { environment } from "src/environments/environment";

export class BaseMaps {
  constructor() {}

  getGoogleBasemap(): Layer {
    var googleLayerSatellite = new TileLayer({
      source: new TileImage({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attributions: "© Google, Maxar Imagery",
      }),
    });

    return googleLayerSatellite;
  }

  getOsmBasemap(): Layer {
    let osm = new TileLayer({
      source: new OSM(),
    });
    return osm;
  }

  getOsmMaptiler(): Layer {
    let osmMapTiler = new TileLayer({
      source: new TileJSON({
        url: `https://api.maptiler.com/maps/openstreetmap/tiles.json?key=${environment.mapTilerKey}`, // source URL
        tileSize: 512,
        crossOrigin: "anonymous",
      }),
    });

    return osmMapTiler;
  }

  getTopoMaptiler(): Layer {
    let topoMapTiler = new TileLayer({
      source: new TileJSON({
        url: `https://api.maptiler.com/maps/topo-v2/tiles.json?key=${environment.mapTilerKey}`, // source URL
        tileSize: 512,
        crossOrigin: "anonymous",
      }),
    });

    return topoMapTiler;
  }

  getSatelliteMaptiler(): Layer {
    let satelliteMapTiler = new TileLayer({
      source: new TileJSON({
        url: `https://api.maptiler.com/maps/satellite/tiles.json?key=${environment.mapTilerKey}`, // source URL
        tileSize: 512,
        crossOrigin: "anonymous",
      }),
    });

    return satelliteMapTiler;
  }
}
