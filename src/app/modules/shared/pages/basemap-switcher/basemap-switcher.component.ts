import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { OSM, Source } from "ol/source";
import { Map, MapBrowserEvent } from "src/app/ol-module";
import { BaseMaps } from "./baseMaps";
import { ReplaySubject, Subject, debounceTime, takeUntil, tap } from "rxjs";
import { StoreService } from "src/app/data/store/store.service";
import { toSize } from "ol/size";
import TileGrid from "ol/tilegrid/TileGrid";
import { get as getProjection } from "ol/proj";
import { fromOpenLayerEvent } from "../class/fromOpenLayerEvent";

export interface imagettesOptions {
  layer: any;
  source: Source;
  nom: string;
  type: string;
  visible: boolean;
}

export interface imagette_urlOptions {
  visible: boolean;
  url: string;
  titre: string;
}
@Component({
  selector: "geosanitation-basemap-switcher",
  templateUrl: "./basemap-switcher.component.html",
  styleUrls: ["./basemap-switcher.component.scss"],
})
export class BasemapSwitcherComponent implements OnInit {
  @Input() left: string = "10px";
  @Input() bottom: string = "10px";
  @Input() map: Map;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  imagette: Array<imagettesOptions> = [];
  imagette_url: imagette_urlOptions = {
    visible: false,
    url: undefined,
    titre: undefined,
  };

  constructor(public store: StoreService) {
    this.store.isSatellite$
      .pipe(
        debounceTime(500),
        takeUntil(this.destroyed$),
        tap(() => {
          this.onImagetteChange();
        })
      )
      .subscribe();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.map) {
      if (
        this.map
          ?.getLayers()
          .getArray()
          .filter((layer) => layer.get("layer_switcher") === "layer_switcher")
          .length == 0
      ) {
        this.imagette[0] = {
          layer: new BaseMaps().getSatelliteMaptiler(),
          source: new BaseMaps().getSatelliteMaptiler().getSource(),
          nom: "Satellite",
          type: "fond",
          visible: true,
        };

        this.imagette[1] = {
          layer: new BaseMaps().getTopoMaptiler(),
          source: new BaseMaps().getTopoMaptiler().getSource(),
          nom: "Topo",
          type: "fond",
          visible: false,
        };

        this.imagette.map((imagette) => {
          imagette.layer.setVisible(imagette.visible);
          imagette.layer.set("nom", imagette.nom);
          imagette.layer.set("type", imagette.type);
          imagette.layer.set("layer_switcher", "layer_switcher");
          this.map.addLayer(imagette.layer);
        });

        this.onImagetteChange();
        fromOpenLayerEvent<MapBrowserEvent<any>>(this.map, "moveend").pipe(
          takeUntil(this.destroyed$),
          tap(() => {
            this.changer_url_imagette()
          })
        ).subscribe()
      }
    }
  }

  /**
   * Changer le fond de carte principal et ainsi l'iamgette aussi
   */
  onImagetteChange() {
    this.imagette.map((imagette) => {
      if (imagette.nom == "Satellite") {
        imagette.visible = this.store.isSatellite;
      }
      if (imagette.nom == "Topo") {
        imagette.visible = !this.store.isSatellite;
      }
      this.map
        .getLayers()
        .getArray()
        .filter(
          (layer) =>
            layer.get("layer_switcher") === "layer_switcher" &&
            layer.get("nom") === imagette.nom
        )
        .map((layer) => {
          layer.setVisible(imagette.visible);
        });
    });

    this.changer_url_imagette();
  }

  toggleSatelitte() {
    this.store.isSatellite$.next(!this.store.isSatellite);
  }

  changer_url_imagette() {
    if (
      this.map?.getView().getZoom() - 2 < 19 &&
      this.map.getView().getZoom() - 2 > 0
    ) {
      this.imagette
        .filter((imagette) => {
          if (this.store.isSatellite) {
            return imagette.nom == "Topo";
          } else {
            return imagette.nom == "Satellite";
          }
        })
        .map((imagette) => {
          let url = this.getUrlOfTIle(imagette.source);

          let cnv_prospect = document.createElement("canvas");
          let ctx = cnv_prospect.getContext("2d");
          let img_prospect = new Image();
          img_prospect.src = url;
          img_prospect.onload = () => {
            document
              .querySelector("#fond_swicther_img")
              .classList.add("transitioning-src");
            setTimeout(() => {
              this.imagette_url.visible = !imagette.visible;
              this.imagette_url.titre = imagette.nom;
              this.imagette_url.url = url;
              try {
                document
                  .querySelector("#fond_swicther_img")
                  .classList.remove("transitioning-src");
              } catch (error) {}
            }, 400);
          };
        });
    }
  }

  getUrlOfTIle(source: any): string {
    var view = this.map.getView();
    var coord = view.getCenter();
    // var source =  new TileImage({ url: 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',crossOrigin: "anonymous"})
    let grid: TileGrid;
    try {
      grid = source.getTileGrid();
    } catch (error) {
      grid = new OSM().getTileGrid();
    }

    let z = view.getZoom();
    var tileCord = this.getTileCoordForXYAndResolution_(
      coord[0],
      coord[1],
      z,
      false,
      grid
    );
    // var tileCord = grid.getTileCoordForCoordAndZ(coord, z);

    return source.getTileUrlFunction()(tileCord, 1, getProjection("EPSG:3857"));
  }

  getTileCoordForXYAndResolution_(
    x: number,
    y: number,
    resolution: number,
    reverseIntersectionPolicy: boolean,
    tileGrid: TileGrid
  ) {
    if (tileGrid == null) {
      tileGrid = new OSM().getTileGrid();
    }
    const z = tileGrid.getZForResolution(resolution);
    const scale = resolution / tileGrid.getResolution(z);
    const origin = tileGrid.getOrigin(z);
    const tileSize = toSize(tileGrid.getTileSize(z), [0, 0]);

    const adjustX = reverseIntersectionPolicy ? 0.5 : 0;
    const adjustY = reverseIntersectionPolicy ? 0.5 : 0;
    const xFromOrigin = Math.floor((x - origin[0]) / resolution + adjustX);
    const yFromOrigin = Math.floor((origin[1] - y) / resolution + adjustY);
    let tileCoordX = (scale * xFromOrigin) / tileSize[0];
    let tileCoordY = (scale * yFromOrigin) / tileSize[1];

    if (reverseIntersectionPolicy) {
      tileCoordX = Math.ceil(tileCoordX) - 1;
      tileCoordY = Math.ceil(tileCoordY) - 1;
    } else {
      tileCoordX = Math.floor(tileCoordX);
      tileCoordY = Math.floor(tileCoordY);
    }

    return [z, tileCoordX, tileCoordY];
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
