import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { StatoVisita, TipoAlimentazione } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { ModalRinnovoComponent } from 'src/app/_module/visite/component/nutrizione/piani-nutrizionali/modal-rinnovo/modal-rinnovo.component';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { firstValueFrom } from 'rxjs';
import _ from 'underscore';
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';

@Component({
  selector: 'app-lista-piani',
  templateUrl: './lista-piani.component.html',
  styleUrls: ['./lista-piani.component.scss']
})
export class ListaPianiComponent implements OnInit {

  formFiltri: FormGroup

  dataSource = new MatTableDataSource<any>();
  viewsColumns = ["paziente", "cf", "durata", "dataInizioValidita", "dataFineValidita", "tipoAlimentazione", "attivo", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  statoVisita= StatoVisita;


isUtenteFarmacista = false;

  itemsForPage = 10;
  elementiTotali = 0;
  pageSelected = 0;
  sortDirection = 'desc';
  columnSort = 'attivo';
  queryParams: any = {};
  ricercaParam;
  tipoAlimentazione = TipoAlimentazione
  params;
  idPaziente: string;
  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    private report: ReportService,
    private confService: ConfezionamentiService,
    private authGuard: AuthGuard,
  ) {
    this.isUtenteFarmacista = this.authGuard.canRole(this.appGen.ruolo.FarmaciaOspedaliera)? true : false;
   }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');


    this.formFiltri = this.formBuilder.group({
      dataInizio: new FormControl(''),
      dataFine: new FormControl(''),
      tipoAlimentazione: new FormControl(''),
      cf: new FormControl(''),
      cognome: new FormControl(''),
      nome: new FormControl(''),
    });


    this.getList();
  }

  ngAfterViewInit(): void {
    sessionStorage.removeItem('dettagliodPiano');
  }


  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getList();
  }

  search() {
    this.getList();
  }

  clearSearch() {
    this.formFiltri.reset();
    this.getList();

  }

  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;
    this.getList(this.pageSelected);
    this.appGen.scroll('table')
  }


  async getList(page?: number) {

    const obj = {
      page: this.appGen.isNullOrUndefined(page) ? 0 : page,
      elementForPage: this.itemsForPage,
      sort: this.sortDirection,
      columnSort: this.columnSort,
      dataInizio: this.appGen.convertToLocaleDate(this.formFiltri.get("dataInizio").value),
      dataFine: this.appGen.convertToLocaleDate(this.formFiltri.get("dataFine").value),
      tipoAlimentazione: this.formFiltri.get('tipoAlimentazione').value,
      nome: this.formFiltri.get("nome").value,
      cognome: this.formFiltri.get("cognome").value,
      cf: this.formFiltri.get("cf").value,
      idPaziente: this.idPaziente
    }

    const res = await this.service.postCallRequest({ action: 'getListaPianiNutrizionali', param: obj });
    this.dataSource = new MatTableDataSource<any>();
    if (!this.appGen.isNullOrUndefined(res)) {
      this.dataSource.data = res.lista;
      this.elementiTotali = res['totalElement'];
    }
  }

  dettaglio(data) {
    this.router.navigate(['/app/visite/piani-nutrizionali/dettaglio', data.id], { queryParams: this.paramsDettaglio(data, false) })
  }

  rinnovaPiano(data) {
    const dialogRef = this.dialog.open(ModalRinnovoComponent, {
      data: data,
      panelClass: "modal-prodotti-custom"
    });

    dialogRef.afterClosed().subscribe(async dialogResult => {
      if (dialogResult) {
        this.getList(this.pageSelected)
      }
    })
  }

  modificaPiano(data) {
    this.router.navigate(['/app/visite/piani-nutrizionali/dettaglio', data.id], { queryParams: this.paramsDettaglio(data, true) })
  }

  paramsDettaglio(data, edit) {
    let params: any = {}
    if (data.idPaziente) {
      params = {
        type: data.idTipoAlimentazione,
        edit: edit,
        patient: data.idPaziente
      }
    } else {
      params = {
        edit: edit,
        type: data.idTipoAlimentazione,
      }
    }
    return params;
  }



  setValSearch(paramsRicerca) {
    if (!(paramsRicerca['dataVisita'] == null || paramsRicerca['dataVisita'] == undefined || paramsRicerca['dataVisita'] == '')) {

      const date = new Date(paramsRicerca.dataVisita);
      this.formFiltri.get("dataVisita").setValue(date);
    }
  }

  async pianoNutrizionale(data, xInvioMail = false) {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service.getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: data.idVisita }).then(async (res) => {
      let isDietaSettimanale = false;
   
      if (res.visita?.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista 
        && !this.appGen.isNullOrUndefined(res.prodotti?.prodotti[0]?.prodotti[0]?.settimana)
        && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != "") {
        isDietaSettimanale = true
      }
      for (const prodotto of res.prodotti.prodotti) {
        if (prodotto.idConfezionamentoProdotto) {
          prodotto.confezionamentoSelezionato = await firstValueFrom(this.confService.getConfezionamentoById(prodotto.idConfezionamentoProdotto));     
          prodotto.quantitaConfezionamento = prodotto.confezionamentoSelezionato.quantita;
          prodotto.unitaMisuraConfezionamento = prodotto.confezionamentoSelezionato.unitaMisura;
          prodotto.nConfezionamentiDaUtilizzare = Math.ceil(prodotto.quantita/ prodotto.quantitaConfezionamento);
          prodotto.nConfezionamentiReali = prodotto.quantita/ prodotto.quantitaConfezionamento;
        }

      }
      
      const obj = {
        pdfFile: this.report.createPianoNutrizionale(res, false, isDietaSettimanale, false),
        isReferto: false,
        title: 'Piano nutrizionale',
        allowPrint:true,
        xInvioMail : xInvioMail,
        email: xInvioMail && res.paziente.email? res.paziente.email : null,
        nome : res.paziente.nome
      }

      const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
        data: obj,
        panelClass: "modal-anteprima-pdf"

      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          // this.stampaReport(pdfFile, res)
        }
      });


    });
  }

  
  async pianoNutrizionaleConCalorieNascoste(data, xInvioMail = false) {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service.getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: data.idVisita }).then(async (res) => {

      let isDietaSettimanale = false;
      if (res.visita?.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista 
        && !this.appGen.isNullOrUndefined(res.prodotti.prodotti[0].prodotti[0].settimana)
        && res.prodotti.prodotti[0].prodotti[0]?.settimana[0].trim() != "" ) {
        isDietaSettimanale = true
      }

      for (const prodotto of res.prodotti.prodotti) {
        if (prodotto.idConfezionamentoProdotto) {
          prodotto.confezionamentoSelezionato = await firstValueFrom(this.confService.getConfezionamentoById(prodotto.idConfezionamentoProdotto));     
          prodotto.quantitaConfezionamento = prodotto.confezionamentoSelezionato.quantita;
          prodotto.unitaMisuraConfezionamento = prodotto.confezionamentoSelezionato.unitaMisura;
          prodotto.nConfezionamentiDaUtilizzare = Math.ceil(prodotto.quantita/ prodotto.quantitaConfezionamento)
          prodotto.nConfezionamentiReali = prodotto.quantita/ prodotto.quantitaConfezionamento;
        }

      }

      const obj = {
        pdfFile: this.report.createPianoNutrizionale(res, false, isDietaSettimanale, true),
        isReferto: false,
        title: 'Piano nutrizionale',
        allowPrint : true,
        xInvioMail : xInvioMail,
        email: xInvioMail && res.paziente.email? res.paziente.email : null,
        nome : res.paziente.nome
      }

      const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
        data: obj,
        panelClass: "modal-anteprima-pdf"
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          // this.stampaReport(pdfFile, res)
        }
      });


    });
  }

}
