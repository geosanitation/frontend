import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { Layer } from "src/app/data/models/type";
import { StoreService } from "src/app/data/store/store.service";

@Component({
  selector: "geosanitation-layer-details",
  templateUrl: "./layer-details.component.html",
  styleUrls: ["./layer-details.component.scss"],
})
export class LayerDetailsComponent implements OnInit {
  @Input() layer: Layer;

  constructor(
    public nbDialogRef: NbDialogRef<LayerDetailsComponent>,
    public store: StoreService
  ) {}

  ngOnInit(): void {}

  close() {
    this.nbDialogRef.close();
  }
}
