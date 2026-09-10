import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-karnofsky',
  templateUrl: './form-karnofsky.component.html',
  styleUrls: ['./form-karnofsky.component.scss']
})
export class FormKarnofskyComponent implements OnInit {


  karnofskyDataSource = new MatTableDataSource<any>();
  karnofskyViewsColumns = ["attivitaLavorativa", "attivitaQuotidiana", "curaPersonale", "sintomiSupporto", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  punteggio;
  indice;
  idPaziente;
  showPunteggio = false;
  @Input() isRiepilogoVisita;
  rigaSelezionata;

  constructor(private service: HttpSharedService,
    public appGen: AppGeneralService,
    private activateRoute: ActivatedRoute,
    public dialog: MatDialog,

  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.existKarnofsky();
    this.getListaKarnofsky();

  }

  async getListaKarnofsky() {
    this.karnofskyDataSource = new MatTableDataSource<any>();
    this.karnofskyDataSource.data = await this.service.getCallRequest({ action: 'Karnofsky' });
  }

  async existKarnofsky() {
    await this.service.getCallRequest({ action: 'getExistKarnofsky', param: this.idPaziente }).then(data => {
      if (data) {
        this.getKarnofskyPaziente();
      }
    });
  }

  async getKarnofskyPaziente() {
    await this.service.getCallRequest({ action: 'KarnofskyXPaziente', param: this.idPaziente }).then((data) => {


      this.showPunteggio = true;
      this.rigaSelezionata = data.idSelezionato;
      this.punteggio = data.punteggio;
      this.indice = data.indice;
      // this.appGen.scroll('boxValutazioni')      
    });


  }

  selectRiga(id) {

    if (!this.isRiepilogoVisita) {
      this.rigaSelezionata = id;
    }

  }

  async onSubmit() {
    let obj = {
      IdPaziente: this.idPaziente,
      IdKarnofsky: this.rigaSelezionata
    }
    await this.service.postCallRequest({ action: 'saveKarnofsky', param: obj }).then(() => {
      setTimeout(() => {

        this.existKarnofsky();
      }, 0);
      // this.getKarnofskyPaziente();

    });
  }

}



