import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-dettaglio-visita',
  templateUrl: './modal-dettaglio-visita.component.html',
  styleUrls: ['./modal-dettaglio-visita.component.scss']
})
export class ModalDettaglioVisitaComponent {
  content: string;

  constructor(public dialogRef: MatDialogRef<ModalDettaglioVisitaComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.content = data.content;
  }

}



export class DialogModel {

  constructor(public title: string, public message: string) {
  }
}
