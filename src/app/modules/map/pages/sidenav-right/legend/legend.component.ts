import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ReplaySubject, takeUntil, tap } from "rxjs";
import { CartoHelper, layersInMap } from "src/app/helper/carto.helper";
import { DomSanitizer } from "@angular/platform-browser";
import * as $ from "jquery";
import { DataOsmLayersServiceService } from "src/app/data/services/data-som-layers-service.service";
import { Map } from "src/app/ol-module";
import { ObjectEvent } from "ol/Object";
import { fromOpenLayerEvent } from "src/app/modules/shared/pages/class/fromOpenLayerEvent";

@Component({
  selector: "geosanitation-legend",
  templateUrl: "./legend.component.html",
  styleUrls: ["./legend.component.scss"],
})
export class LegendComponent implements OnInit {
  @Input() map: Map;

  layersInTocWithLegend: Array<layersInMap> = [];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    public dataOsmLayersServiceService: DataOsmLayersServiceService,
    public DomSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {}
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["map"]) {
      if (this.map) {
        fromOpenLayerEvent<ObjectEvent>(this.map.getLayers(), "propertychange")
          .pipe(
            tap(() => {
              this.getAllLayersLegends();
            }),
            takeUntil(this.destroyed$)
          )
          .subscribe();
      }
    }
  }

  /**
   * Construct the array this.layersInTocWithLegend array.
   */

  getAllLayersLegends() {
    this.layersInTocWithLegend = new CartoHelper(this.map)
      .getAllLayersInToc()
      .filter(
        (layerProp) =>
          layerProp.type_layer == "geosmCatalogue" &&
          layerProp.properties.type == "couche"
      )
      .filter((value, index, self) => {
        /**
         * unique layer ^^
         */
        return (
          self
            .map((item) => item.properties.couche_id + item.properties.type)
            .indexOf(value.properties.couche_id + value.properties.type) ===
          index
        );
      })
      .map((layerProp) => {

        if (layerProp.properties.type == "couche") {
        }
        let layer = this.dataOsmLayersServiceService.getLayerInMap(
          layerProp.properties.couche_id
        ).layer;
        layerProp.legendCapabilities = [];
        layer.providers
          .filter((provider) => {
            return (
              provider.vp.state == "good" && provider.vp.id_server != undefined
            );
          })
          .map((provider) => {
            layerProp.legendCapabilities.push({
              description: provider.vs.description,
              urlImg: $.trim(
                provider.vp.url_server +
                  "&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=" +
                  provider.vp.id_server +
                  "&STYLE=" +
                  provider.vs.name +
                  "&SLD_VERSION=1.1.0&LAYERTITLE=false&RULELABEL=true"
              ),
            });
          });

        return layerProp;
      });

    function compare(a, b) {
      if (a.zIndex < b.zIndex) {
        return 1;
      }
      if (a.zIndex > b.zIndex) {
        return -1;
      }
      return 0;
    }
    this.layersInTocWithLegend.sort(compare);
  }
}
