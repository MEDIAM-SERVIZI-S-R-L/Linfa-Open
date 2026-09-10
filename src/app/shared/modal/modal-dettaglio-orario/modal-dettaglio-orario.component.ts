import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-dettaglio-orario',
  templateUrl: './modal-dettaglio-orario.component.html',
  styleUrls: ['./modal-dettaglio-orario.component.scss']
})
export class ModalDettaglioOrarioComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalDettaglioOrarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  confirm(evt) {
    this.dialogRef.close(evt)
  }
}
