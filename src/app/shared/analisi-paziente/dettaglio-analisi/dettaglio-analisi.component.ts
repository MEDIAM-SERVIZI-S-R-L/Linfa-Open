import { Component, Input, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { debug } from 'console'
import { firstValueFrom } from 'rxjs'
import { TipoValoreAnalisi } from 'src/app/_core/helpers/enums'
import ValoreAnalisi, { AnalisiPaziente } from 'src/app/_models/paziente'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import _ from 'underscore'
@Component({
  selector: 'app-dettaglio-analisi',
  templateUrl: './dettaglio-analisi.component.html',
  styleUrls: ['./dettaglio-analisi.component.scss'],
})
export class DettaglioAnalisiComponent implements OnInit {
  @Input() analisiId
  orginalDettaglioAnalisi!: ValoreAnalisi[] // viene usato solo quando sono selezionati con errore
  dettaglioAnalisi = new MatTableDataSource<ValoreAnalisi>()
  analisi: AnalisiPaziente
  columnsToDisplay = ['analisi', 'valore', 'riferimento', 'alert'] //,'search']
  filtro='';
  hideSearch=true;

  TipoCampo = TipoValoreAnalisi
  constructor(public pazienteHttp: PazienteService) {}

  ngOnInit(): void {
    this.loadAnalisi()
  }

  // carrico il dettaglio
  async loadAnalisi() {
    //solo se Id analisi presente
    if (this.analisiId) {
      this.analisi = await firstValueFrom(
        this.pazienteHttp.getAnalisiDettaglio(this.analisiId)
      )

      this.dettaglioAnalisi.data = this.analisi.valoriAnalisi
    }
  }
  // filtro
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value

    this.dettaglioAnalisi.filter = filterValue.trim().toLowerCase()
  }

  soloConAlert($event) {
    if ($event.checked) {
      this.orginalDettaglioAnalisi = this.dettaglioAnalisi.data
      this.dettaglioAnalisi.data = _.filter(this.dettaglioAnalisi.data, { alert: true })
    } else {
      this.dettaglioAnalisi.data = this.orginalDettaglioAnalisi
      this.dettaglioAnalisi.filter=''
      this.filtro='';
    }
  }
}
