import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ColorPickerDirective } from "ngx-color-picker";
import { ReplaySubject } from "rxjs";
import { take, tap } from "rxjs/operators";

@Component({
  selector: "app-color-picker",
  templateUrl: "./color-picker.component.html",
  styleUrls: ["./color-picker.component.scss"],
})
export class ColorPickerComponent implements OnInit {
  @Input() colorForm;
  @Input() colorLabel: String;
  @Input() position: string = "bottom-left";
  @Input() colorError: String;
  @Input() colorOutputFormat: "rgba" | "hex";
  @Input() width?: string;
  @Input() container: HTMLElement;

  @ViewChild(ColorPickerDirective) colorPickerDirective: ColorPickerDirective;

  public colorList = [
    { key: "red", value: "#FF3A33" },
    { key: "terracotta", value: "#E68673" },
    { key: "orange", value: "#FF7733" },
    { key: "amber", value: "#FFAA00" },
    { key: "khaki", value: "#B3A17D" },
    { key: "yellow", value: "#FFD11A" },
    { key: "lime", value: "#BCD92B" },
    { key: "grass", value: "#7ACC29" },
    { key: "green", value: "#00CC66" },
    { key: "moviikgreen", value: "#17E68F" },
    { key: "jade", value: "#4D997D" },
    { key: "teal", value: "#73DFE6" },
    { key: "skyblue", value: "#4DC3FF" },
    { key: "blue", value: "#0095FF" },
    { key: "royalblue", value: "#0055FF" },
    { key: "ultraviolet", value: "#6200EE" },
    { key: "violet", value: "#8126FF" },
    { key: "deeppurple", value: "#AA33FF" },
    { key: "pink", value: "#FF99CC" },
    { key: "strawberry", value: "#FD5B82" },
  ];
  public presetValues: string[] = [];

  public onFocus: boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() {
    this.presetValues = this.getColorValues();
  }

  ngOnInit(): void {}

  getColorValues() {
    return this.colorList.map((c) => c.value);
  }

  onColorPickerSelect(color, field: string) {
    this.colorForm.setValue(color);
  }

  ngAfterViewInit() {
    this.colorPickerDirective.colorPickerOpen
      .pipe(
        take(1),
        tap((el) => {
          let comp =
            this.colorPickerDirective["dialog"].elRef.nativeElement.firstChild;
          let containerCoord = this.container.getBoundingClientRect();
          let H = window.innerHeight;
          let compHeight = comp.offsetHeight;
          if (H - containerCoord.top > compHeight) {
            this.colorPickerDirective[
              "dialog"
            ].elRef.nativeElement.firstChild.style.top =
              containerCoord.top + containerCoord.height / 2 + "px";
          } else if (H - containerCoord.top < compHeight) {
            this.colorPickerDirective[
              "dialog"
            ].elRef.nativeElement.firstChild.style.top =
              containerCoord.top -
              (compHeight - (H - containerCoord.top)) -
              20 +
              "px";

            comp.childNodes[0].style.top =
              containerCoord.top -
              this.colorPickerDirective[
                "dialog"
              ].elRef.nativeElement.firstChild.getBoundingClientRect().top +
              "px";
          }
        })
      )
      .subscribe();

    document
      .getElementById("input-color")
      .addEventListener("mouseenter", (event) => {
        this.onFocus = true;
      });

    document
      .getElementById("input-color")
      .addEventListener("mouseleave", (event) => {
        this.onFocus = false;
      });
  }
}
