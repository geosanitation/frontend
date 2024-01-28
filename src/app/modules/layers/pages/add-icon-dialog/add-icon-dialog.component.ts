import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { ReplaySubject } from 'rxjs';
import { MapsService } from '../../../../data/services/maps.service';
import { AddLayerComponent } from '../add-layer/add-layer.component';

@Component({
  selector: 'app-add-icon-dialog',
  templateUrl: './add-icon-dialog.component.html',
  styleUrls: ['./add-icon-dialog.component.scss']
})
export class AddIconDialogComponent implements OnInit {
  @Input() group: number;

  public onAddInstance: () => void
  public colorList = [
    { key: 'red', value: '#FF3A33' },
    { key: 'terracotta', value: '#E68673' },
    { key: 'orange', value: '#FF7733' },
    { key: 'amber', value: '#FFAA00' },
    { key: 'khaki', value: '#B3A17D' },
    { key: 'yellow', value: '#FFD11A' },
    { key: 'lime', value: '#BCD92B' },
    { key: 'grass', value: '#7ACC29' },
    { key: 'green', value: '#00CC66' },
    { key: 'moviikgreen', value: '#17E68F' },
    { key: 'jade', value: '#4D997D' },
    { key: 'teal', value: '#73DFE6' },
    { key: 'skyblue', value: '#4DC3FF' },
    { key: 'blue', value: '#0095FF' },
    { key: 'royalblue', value: '#0055FF' },
    { key: 'ultraviolet', value: '#6200EE' },
    { key: 'violet', value: '#8126FF' },
    { key: 'deeppurple', value: '#AA33FF' },
    { key: 'pink', value: '#FF99CC' },
    { key: 'strawberry', value: '#FD5B82' }
  ];
  public presetValues: string[] = [];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  form: FormGroup = this.formBuilder.group({})

  constructor(
    public dialogRef: NbDialogRef<AddLayerComponent>,
    private formBuilder: FormBuilder,
    public mapsService: MapsService,
  ) {
    this.presetValues = this.getColorValues()
    
    this.form.addControl('protocol_carto', new FormControl('wms', [Validators.required]))
    this.form.addControl('color', new FormControl(null, [Validators.required]))
    this.form.addControl('icon_color', new FormControl(null, [Validators.required]))
    this.form.addControl('icon', new FormControl(null, [Validators.required]))
    this.form.addControl('icon_path', new FormControl(null))
    this.form.addControl('icon_background', new FormControl(true))
    this.form.addControl('svg_as_text', new FormControl([]))
    this.form.addControl('svg_as_text_square', new FormControl([]))

    this.onAddInstance = () => {
      this.dialogRef.close(this.form.value)
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if(this.group) {
        this.form.addControl('group', new FormControl(this.group, [Validators.required]))
      }
    })
  }

  close(): void {
    this.dialogRef.close(false);
  }

  getColorValues() {
    return this.colorList.map(c => c.value);
  }
}
