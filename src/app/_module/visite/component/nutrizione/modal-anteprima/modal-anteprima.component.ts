import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-anteprima',
  templateUrl: './modal-anteprima.component.html',
  styleUrls: ['./modal-anteprima.component.scss']
})
export class ModalAnteprimaComponent {

  idPaziente;
  isAnteprima = true;
  fromPianoAlimentare = false;
  fromAnamnesi = false;
  fromListaDiete = false;
  message;
  class;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.message = data.message;
    this.fromAnamnesi = data.fromAnamnesi;
    this.fromListaDiete = data.fromListaDiete;
    this.fromPianoAlimentare = data.fromPianoAlimentare;
    this.idPaziente = data.idPaziente;
    this.class = data.class? data.class : '';
  }
}
