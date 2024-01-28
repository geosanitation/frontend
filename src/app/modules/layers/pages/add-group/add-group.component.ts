import { Component, Inject, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MapsService } from "../../../../data/services/maps.service";
import { EMPTY, ReplaySubject, Subject } from "rxjs";
import { Group } from "../../../../data/models/type";
import { takeUntil, switchMap, catchError, tap, filter } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import {
  NbDialogRef,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";

@Component({
  selector: "geosanitation-add-group",
  templateUrl: "./add-group.component.html",
  styleUrls: ["./add-group.component.scss"],
})
export class AddGroupComponent implements OnInit {
  @Input() profil: number;
  @Input() group: Group;

  form: FormGroup;

  onAddInstance: () => void;

  onUpdateInstance: () => void;

  onDeleteInstance: () => void;

  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  positions = NbGlobalPhysicalPosition;

  constructor(
    private fb: FormBuilder,
    public mapsService: MapsService,
    public translate: TranslateService,
    public dialogRef: NbDialogRef<AddGroupComponent>,
    private toastrService: NbToastrService
  ) {
    this.form = this.fb.group({
      map_id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      color: new FormControl(null, [Validators.required]),
      is_visible: new FormControl(false, [Validators.required]),
    });

    const onAdd: Subject<void> = new Subject<void>();
    this.onAddInstance = () => {
      onAdd.next();
    };

    const onUpdate: Subject<void> = new Subject<void>();
    this.onUpdateInstance = () => {
      onUpdate.next();
    };

    const onDelete: Subject<void> = new Subject<void>();
    this.onDeleteInstance = () => {
      onDelete.next();
    };

    onAdd
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => {
          this.form.disable()
        } ),
        switchMap(() => {
          return this.mapsService.addGroup(this.form.value).pipe(
            catchError(() => {
              this.toastrService.danger(
                this.translate.instant("groups.error_adding_group"),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              this.form.enable()
              return EMPTY;
            }),
            tap((_) => {
              this.form.enable()
              this.dialogRef.close(true);
            })
          );
        })
      )
      .subscribe();

    onUpdate
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => {
          this.form.disable()
        } ),
        switchMap(() => {
          return this.mapsService.updateGroup(this.form.value).pipe(
            catchError(() => {
              this.toastrService.danger(
                this.translate.instant("groups.error_updating_group"),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              this.form.enable()
              return EMPTY;
            }),
            tap((_) => {
              this.form.enable()
              this.dialogRef.close(true);
            })
          );
        })
      )
      .subscribe();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.group) {
      setTimeout(() => {
        this.form.get("name").setValue(this.group.name);
        this.form.get("color").setValue(this.group.color);
        this.form.get("is_visible").setValue(this.group.is_visible);
      })
      if (this.group.group_id)
        this.form.addControl(
          "group_id",
          new FormControl(this.group.group_id, [Validators.required])
        );
    }

    if (this.profil) {
      setTimeout(() => {
        this.form.get("map_id").setValue(this.profil);
      })
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
