import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from "@angular/core";
import { Group } from "../../../../data/models/type";

import { Router } from "@angular/router";
import { StoreService } from "src/app/data/store/store.service";

@Component({
  selector: "app-group-item",
  templateUrl: "./group-item.component.html",
  styleUrls: ["./group-item.component.scss"],
})
export class GroupItemComponent implements OnInit {
  @Input() group: Group;

  @Output() editGroup: EventEmitter<Group> = new EventEmitter<Group>()
  @Output() deleteGroup: EventEmitter<Group> = new EventEmitter<Group>()

  constructor(public Router: Router, public store: StoreService) {}

  ngOnInit(): void {}

  openGroup(group_id: number) {
    this.Router.navigate(["groups", group_id, "layers"]);
  }
}
