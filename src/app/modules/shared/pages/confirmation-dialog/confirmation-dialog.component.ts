import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

export interface ConfirmationDialogData {
  confirmationTitle: string,
  confirmationExplanation:string
  cancelText: string,
  confirmText: string,
  danger: boolean
}

@Component({
  selector: 'geosanitation-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  @Input() data: ConfirmationDialogData;

  constructor(protected ref: NbDialogRef<ConfirmationDialogComponent>) { }

  ngOnInit(): void {
  }

  close(result:boolean) {
    this.ref.close(result);
  }

}
