import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import {
  Observable,
  Subject,
  ReplaySubject,
  merge,
  switchMap,
  tap,
  catchError,
  EMPTY,
  filter,
} from "rxjs";
import { EditStyle, Layer, Style } from "src/app/data/models/type";
import { IconService } from "src/app/data/services/icon.service";
import { StyleService } from "src/app/data/services/style.service";
import { environment } from "src/environments/environment";
import { EditStyleComponent } from "./edit-style/edit-style.component";
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "geosanitation-layer-style",
  templateUrl: "./layer-style.component.html",
  styleUrls: ["./layer-style.component.scss"],
})
export class LayerStyleComponent implements OnInit {
  onInitInstance: () => void;
  /**
   * update a style
   */
  onUpdateInstance: (style: Style) => void;

  /**
   * the vector provider id
   */
  @Input() layer: Layer;

  /**
   * list of style of the vector provider
   */
  providerStyle$: Observable<Style>;

  /**
   * The url of the legend img
   */
  legenUrl: string;

  /**
   * Timestamp
   */
  timeStamp: number;
  positions = NbGlobalPhysicalPosition;
  environment = environment;

  constructor(
    public styleService: StyleService,
    private toastrService: NbToastrService,
    public iconService: IconService,
    public translate: TranslateService,
    public dialog: NbDialogService
  ) {

    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
      onInit.complete();
    };

    const onUpdate: Subject<Style> = new Subject<Style>();
    this.onUpdateInstance = (style: Style) => {
      onUpdate.next(style);
    };

    this.providerStyle$ = merge(
      onInit.pipe(
        switchMap(() => {
          let provider_vector_id =
            this.layer.providers[0].vp.provider_vector_id;
          return this.styleService
            .getStyleOfVectorProvider(provider_vector_id)
            .pipe(
              tap(() => {
                this.timeStamp = new Date().getTime();
                this.legenUrl = this.getLegendGraphic();
              }),
              catchError((value: HttpErrorResponse) => {
                if (value.status != 404) {
                  this.toastrService.danger(
                    "An error occured while loading styles",
                    this.translate.instant("error"),
                    { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                  );
                }
                return EMPTY;
              })
            );
        })
      ),
      onUpdate.pipe(
        switchMap((style: Style) => {
          return this.iconService.getIcon(this.layer.icon).pipe(
            catchError((e) => {
              this.toastrService.danger(
                "An error occured when getting the icon of the layer",
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              return EMPTY;
            }),
            switchMap((icon) => {
              let dataToEditStyle: EditStyle = {
                provider_vector_id:
                  this.layer.providers[0].vp.provider_vector_id,
                customStyle: style.custom_style,
                color: this.layer.color,
                icon_background: this.layer.icon_background,
                icon_color: this.layer.icon_color,
                icon: icon,
                name: style.name,
                id_server: this.layer.providers[0].vp.id_server,
                path_qgis: this.layer.providers[0].vp.path_qgis,
                provider_style_id: style.provider_style_id,
              };

              let proprietes = {
                context: { data: dataToEditStyle },
              };

              return this.dialog
                .open(EditStyleComponent, proprietes)
                .onClose.pipe(
                  filter((resultConfirmation) => resultConfirmation),
                  switchMap(() => {
                    let provider_vector_id =
                      this.layer.providers[0].vp.provider_vector_id;
                    return this.styleService
                      .getStyleOfVectorProvider(provider_vector_id)
                      .pipe(
                        tap(() => {
                          this.timeStamp = new Date().getTime();
                          this.legenUrl = this.getLegendGraphic();
                        }),
                        catchError((value: HttpErrorResponse) => {
                          if (value.status != 404) {
                            this.toastrService.danger(
                              "An error occured while loading styles",
                              this.translate.instant("error"),
                              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                            );
                          }
                          return EMPTY;
                        })
                      );
                  })
                );
            })
          );
        })
      )
    );
  }

  ngOnInit(): void {
    this.onInitInstance();
  }

  getLegendGraphic(): string {
    let provider = this.layer.providers[0];
    let url =
      provider.vp.url_server +
      "&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=" +
      provider.vp.id_server +
      "&STYLE=" +
      provider.vs.name +
      "&SLD_VERSION=1.1.0&LAYERTITLE=false&RULELABEL=true";

    if (this.timeStamp) {
      return url + "?" + this.timeStamp;
    }
    return url;
  }
}
