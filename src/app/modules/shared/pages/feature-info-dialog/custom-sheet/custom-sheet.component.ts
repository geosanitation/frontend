import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatChip, MatChipList } from '@angular/material/chips';
import { FeatureProperties } from 'src/app/data/models/type';
import { environment } from 'src/environments/environment';
import { FeatureForSheet } from '../feature-info-dialog.component';
import { VectorLayer, VectorSource, Map, Feature } from 'src/app/ol-module';

import { Extent } from 'ol/extent';
import { CartoHelper } from 'src/app/helper/carto.helper';
import { NbMenuItem, NbMenuService } from '@nebular/theme';
import { ReplaySubject, filter, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'geosanitation-custom-sheet',
  templateUrl: './custom-sheet.component.html',
  styleUrls: ['./custom-sheet.component.scss']
})
export class CustomSheetComponent implements OnInit {
 /**
   * List of features from WMSGetFeatureInfo at pixel where user clicked
   */
 @Input() features: FeatureForSheet[];
 @Input() highlightLayer: VectorLayer<VectorSource>;
 @Input() map: Map;

 @ViewChild(MatChipList) matChipList: MatChipList;
 
 private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

 /**
  * number of initial number of attributes that can be display
  */
 initialNumberOfAttributes: number = 5;

 fields:Array<FeatureProperties> = [];

 /**
  * extent of the current feature, if the user want to zoom on int
  */
 extent: Extent;

 /**
  * selected feature to display
  */
 selectedFeature: FeatureForSheet;

 downloadFormats: NbMenuItem[] = [
  {title: 'Shapefile', data: 'shp'},
  {title: 'GeoJSON', data: 'geojson'},
  {title: 'Geopackage', data: 'gpkg'},
  {title: 'KML', data: 'kml'},
  {title: 'CSV', data: 'csv'},
 ]

 environment = environment;
  constructor(private cdRef: ChangeDetectorRef,
    private nbMenuService: NbMenuService) { 
    this.initialNumberOfAttributes = 5;

    this.nbMenuService.onItemClick().pipe(
      takeUntil(this.destroyed$),
      filter(({tag}) => tag === 'download-feature-menu'),
      tap(({ item: { data } }) => {
        let downloadUrl = environment.backendUrl +
        '/api/map/download/id/?provider_vector_id=' +
        this.selectedFeature.provider_vector_id +
        '&provider_style_id=' +
        this.selectedFeature.provider_style_id +
        '&feature_id=' +
        this.selectedFeature.primary_key_field +
        '&driver='+data
        window.open(downloadUrl, "_blank")
      })
    ).subscribe()
  }

  toggleSelection(chip: MatChip) {
    chip.toggleSelected();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    // if one feature, manage matchiplist like osm
    let feature = this.features[0];
    let fieldsCount = Object.keys(feature.getProperties()).length - 1;
    for (let i = 0; i < fieldsCount; i++) {
      if (feature.getProperties()[i].name == 'id') {
        feature.primary_key_field = feature.getProperties()[i].value;
      }
      this.fields.push(feature.getProperties()[i]);
    }
    this.selectedFeature = feature;
    this.extent = feature.getGeometry()
      ? feature.getGeometry().getExtent()
      : undefined;
    this.highlightLayer.getSource().clear();
    setTimeout(() => {
      this.highlightLayer.getSource().addFeature(feature);
    }, 500);
  }

  /**
   * get the name of feature
   * @param feature feature
   * @param index index
   * @returns
   */
  getNameOfFeature(feature: Feature, index: number): string {
    let properties = feature.getProperties();
    return this.fields.length > 0 ? this.fields[0]['value'] : 'Entité ' + index;
  }

  /**
   * Zoom on feature extent
   */
  zoomOnFeatureExtent() {
    console.log(this.extent);
    if (this.extent) {
      var cartoClass = new CartoHelper(this.map);
      cartoClass.fit_view(this.extent, 16);
    }
  }

  /**
   * Download file
   */
  downloadFile(value) {
    const name = value.lastIndexOf('/');
    const filename = value.substring(name + 1);
    let link = document.createElement('a');
    link.href = value;
    link.target = '_target';
    link.download = filename;
    link.click();
  }

  getNameFile(value) {
    const name = value.lastIndexOf('/');
    return value.substring(name + 1);
  }


  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
