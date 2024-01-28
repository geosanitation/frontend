import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Layer } from 'src/app/data/models/type';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'geosanitation-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss']
})
export class LayerItemComponent implements OnInit {

  @Input() layer: Layer;
  @Output() openLayer: EventEmitter<void> = new EventEmitter<void>()

  backendUrl = environment.backendUrl

  constructor() { }

  ngOnInit(): void {
  }

}
