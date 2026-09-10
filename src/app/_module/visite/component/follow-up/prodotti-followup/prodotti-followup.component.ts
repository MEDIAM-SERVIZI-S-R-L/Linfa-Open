import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-prodotti-followup',
  templateUrl: './prodotti-followup.component.html',
  styleUrls: ['./prodotti-followup.component.scss']
})
export class ProdottiFollowupComponent {
  content: string;
  prodottiDataSource = new MatTableDataSource<any>();
  prodottiViewsColumns = ["prodotto", "quantita", "kcal", "proteine", "azoto"]

  constructor(public dialogRef: MatDialogRef<ProdottiFollowupComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    //
    this.prodottiDataSource = new MatTableDataSource<any>();
    this.prodottiDataSource.data = data;

  }


}
