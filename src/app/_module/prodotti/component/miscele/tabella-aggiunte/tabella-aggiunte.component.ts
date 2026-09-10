import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { TipoAggiunta } from 'src/app/_core/helpers/enums';
import { AggiuntaMiscela } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-tabella-aggiunte',
  templateUrl: './tabella-aggiunte.component.html',
  styleUrls: ['./tabella-aggiunte.component.scss']
})
export class TabellaAggiunteComponent implements OnInit {

  dataSource = new MatTableDataSource<AggiuntaMiscela>();
  viewsColumns = ["tipo", "aggiunta", "quantita", "pulsanti"]
  @Input() aggiunte: AggiuntaMiscela[];
  @Input() isRiepilogo: boolean;
  @Input() stepVisita: boolean;

  tipoAggiunta = TipoAggiunta

  constructor(
    private appGen: AppGeneralService,
  ) { }

  ngOnInit(): void {
    this.generateTable()
  }

  ngOnChanges(changes: { isRiepilogo: { currentValue: boolean; }; }): void {
    if (!this.appGen.isNullOrUndefined(changes.isRiepilogo)) {
      this.isRiepilogo = changes.isRiepilogo.currentValue
      this.stepVisita = true;
    }
  }

  generateTable(): void {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = this.aggiunte;
  }

  refreshTable(): void {
    this.dataSource._updateChangeSubscription();
  }

  deleteProdotto(prodotto: any): void {
    const index = this.dataSource.data.indexOf(prodotto);
    this.dataSource.data.splice(index, 1);
    this.dataSource._updateChangeSubscription();
  }

  editQuantita(prodotto: any, evt: any): void {
    const index = this.dataSource.data.indexOf(prodotto);
    this.dataSource.data[index].quantita = Number(evt.value);

  }
}

