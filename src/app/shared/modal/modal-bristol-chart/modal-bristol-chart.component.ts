import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-modal-bristol-chart',
  templateUrl: './modal-bristol-chart.component.html',
  styleUrls: ['./modal-bristol-chart.component.scss']
})
export class ModalBristolChartComponent implements OnInit {

  listaBristolChart;
  rigaSelezionata;
  isRiepilogoVisita;

  dataSource = new MatTableDataSource<any>();
  dataViewsColumns = ["immagine", "tipo", "descrizione", "condizione", "pulsanti"]
  @Output() emitService = new EventEmitter();

  constructor(
    public appGen: AppGeneralService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data) {
    // Update view with given values
    this.listaBristolChart = data.lista;

    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = data.lista;

    if (!this.appGen.isNullOrUndefined(data.isRiepilogoVisita)) {
      this.isRiepilogoVisita = data.isRiepilogoVisita;
    }
    if (!this.appGen.isNullOrUndefined(data.idBristolChart)) {
      this.rigaSelezionata = data.idBristolChart;
    }
  }
  ngOnInit() {
  }

  selectRiga(id) {
    this.rigaSelezionata = id;
  }

  conferma() {
    this.emitService.next(this.rigaSelezionata)
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}
