import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { Ruoli, StatoVisita, TipoDocumento, TipoPrestazione } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { ListaDocumentiComponent, ListaDocumentiDialogModel } from 'src/app/shared/lista-documenti/lista-documenti.component';
import { ModalAnnullaRichiestaComponent } from 'src/app/shared/modal/modal-annulla-richiesta/modal-annulla-richiesta.component';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';

import { ModalDettaglioVisitaComponent } from '../modal-dettaglio-visita/modal-dettaglio-visita.component';
import { firstValueFrom } from 'rxjs';
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service';

@Component({
  selector: 'app-lista-visite',
  templateUrl: './lista-visite.component.html',
  styleUrls: ['./lista-visite.component.scss']
})
export class ListaVisiteComponent implements OnInit {


  sortDirection = 'desc';
  columnSort = 'data';
  @ViewChild(MatSort) sort: MatSort
  visitaDataSource = new MatTableDataSource<any>();
  visitaViewsColumns = ["data", "paziente", "cf", "tipoPrestazione", "priorita", "medico", "stato", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  formFiltrivisita: FormGroup

  totalElements = 0;
  itemsForPage = 10;
  pageSelected = 0;
  queryParams: any = {};
  ricercaParam;
  paziente;
  listaAmbulatori;
  listaMedici;
  @Input() isStoricoCruscotto;
  @Output() calendario = new EventEmitter();
  tipoPrestazione = TipoPrestazione
  idVisitaCorrenteXCruscotto;
  idPaziente;
  listaTipiVisite;

  tipoUtente = Ruoli;
  statoVisita = StatoVisita
  isFromDashboard = false;
  queryId = null
  constructor(
    public authGuard: AuthGuard,
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private dialog: MatDialog,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private documentHttp: DocumentiService,
    private report: ReportService
  ) { }

  ngOnInit() {
    this.formFiltrivisita = this.formBuilder.group({
      dataVisita: new FormControl(''),
      tipoVisita: new FormControl(''),
      statoVisita: new FormControl(''),
      nome: new FormControl(''),
      cognome: new FormControl(''),
      cf: new FormControl(''),
      medico: new FormControl(''),
      ambulatorio: new FormControl(''),
    });

    const retrievedObjectFromCalendario = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!(retrievedObjectFromCalendario == null || retrievedObjectFromCalendario == undefined || retrievedObjectFromCalendario == '')) {
      this.ricercaParam = JSON.parse(retrievedObjectFromCalendario);
    }

    //Sono nella compilazione visita, perciò mi prendo i parametri dalla url
    this.activateRoute.queryParams.subscribe(params => {
      this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
      if (!this.appGen.isNullOrUndefined(params.request)) {
        this.idVisitaCorrenteXCruscotto = params.request;
      }
      if (!this.appGen.isNullOrUndefined(params.query)) {
        /**Ho passato il parametro della query, provengo dalla dashboard */
        this.isFromDashboard = true;
        this.queryId = params.query
        this.getListaVisite(null, this.queryId);
      } else {
        //non sono dalla dashboard, quindi non è entrato sopra dove passo il parametro della query allora tiro giù da qui
        this.getListaVisite();
      }
    });
    this.getTipiRichiesta();
    this.getListaAmbulatori();
    this.getListaMedici();
  }

  async getListaAmbulatori() {
    await this.service.getCallRequest({ action: 'ambulatori' }).then(data => {
      this.listaAmbulatori = data;
    });
  }

  async getListaMedici() {
    const obj = {
      tipoUtente: this.tipoUtente.Medico
    }

    await this.service.postCallRequest({ action: 'getUtenti', param: obj }).then(data => {
      this.listaMedici = data;
    });
  }

  ngAfterViewInit(): void {
    sessionStorage.removeItem('dettaglioStoricoPaziente');
  }


  search() {
    this.getListaVisite(null, this.queryId);
  }

  clearSearch() {
    this.formFiltrivisita.reset()
    this.getListaVisite(null, this.queryId);

  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaVisite(null, this.queryId);
  }

  onChangePage(evt) {

    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;
    this.getListaVisite(this.pageSelected, this.queryId);
    // this.appGen.scroll('containerTable')
  }

  showCalendario() {
    this.calendario.emit();

  }

  async getListaVisite(page?: number, query?) {

    let dataVisitaTmp;
    let obj;

    if (!this.appGen.isNullOrUndefined(this.ricercaParam)) {

      if (!this.appGen.isNullOrUndefined(this.ricercaParam.start)) {
        dataVisitaTmp = new Date(this.ricercaParam.start)
        this.formFiltrivisita.get('dataVisita').setValue(this.ricercaParam.start)

      } else {

        if (this.formFiltrivisita.get("dataVisita").value != '') {
          dataVisitaTmp = this.formFiltrivisita.get("dataVisita").value;
        }
      }

      obj = {
        page: (page === null || page === undefined) ? 0 : page,
        elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
        DataVisita: this.appGen.convertToLocaleDate(dataVisitaTmp),
        IdPaziente: this.appGen.isNullOrUndefined(this.ricercaParam.idPaziente) ? '' : this.ricercaParam.idPaziente,
        IdVisita: this.ricercaParam.fromStorico ? '' : this.ricercaParam.idVisita,
        Sort: this.sortDirection,
        ColumnSort: this.columnSort,
        Query: query,

      }
    } else {
      dataVisitaTmp = this.formFiltrivisita.get("dataVisita").value;
      obj = {
        page: (page === null || page === undefined) ? 0 : page,
        elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
        DataVisita: this.appGen.convertToLocaleDate(dataVisitaTmp),
        IdVisitaCorrenteXCruscotto: this.idVisitaCorrenteXCruscotto,
        IdPaziente: this.idPaziente,
        StatoVisita: this.formFiltrivisita.get('statoVisita').value,
        TipoVisita: this.formFiltrivisita.get('tipoVisita').value,
        Cf: this.formFiltrivisita.get('cf').value,
        Cognome: this.formFiltrivisita.get('cognome').value,
        Nome: this.formFiltrivisita.get('nome').value,
        Ambulatorio: this.formFiltrivisita.get('ambulatorio').value,
        Medico: this.formFiltrivisita.get('medico').value,
        Sort: this.sortDirection,
        ColumnSort: this.columnSort,
        Query: query,

      }
    }



    const res = await this.service.postCallRequest({ action: 'getListaVisite', param: obj });
    this.visitaDataSource = new MatTableDataSource<any>();
    this.totalElements = 0;
    if (!this.appGen.isNullOrUndefined(res)) {
      this.visitaDataSource.data = res.lista;
      this.totalElements = res.totalElement;
      // this.paziente = res['nome'] + " " + res['cognome'];
    }
  }

  dettaglioVisita(visita) {

    this.createParams(visita)
    sessionStorage.setItem('dettaglioStoricoPaziente', JSON.stringify(this.queryParams));
    if (visita.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
      this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
    } else {
      this.router.navigate(['/app/visite/riepilogo', visita.idPaziente], { queryParams: { visit: visita.id, fromStorico: true } })
    }
  }

  async stampaReferto(idVisita, idDocumentoReferto) {
    let exist = false
    if (!this.appGen.isNullOrUndefined(idDocumentoReferto)) {
      exist = await firstValueFrom(this.documentHttp.checkFileExist(idDocumentoReferto))

      if (exist) {
        const obj = {
          idVisita: idVisita,
          idDocumento: idDocumentoReferto,
          idTipoDocumento: TipoDocumento.RefertoNutrizione,
        }
        await this.service.GetFileName(obj).then((data) => {
          const paramModal = {
            pdfFile: data,
            idVisita: idVisita,
            title: 'Stampa referto',
            allowPrint: true,
          }

          this.dialog.open(ModalPdfViewerComponent, {
            data: paramModal,
            panelClass: 'modal-anteprima-pdf',
          })
        })
      } else {
        this.appGen.notificate.error("Documento non trovato, contatta l'assistenza Linfa")

        return

      }
    } else {
      this.appGen.notificate.error(
        "ID Documento non trovato, contatta l'assistenza Linfa"
      )
    }

  }

  clearDate(event: { stopPropagation: () => void; }) {
    event.stopPropagation();
    this.formFiltrivisita.get('dataVisita').reset();
  }

  async anteprimaReferto(visita) {
    //già filtrato in base al tipo alimentazione, lato server
    const res = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisitaCorrenteXCruscotto));

      const obj = {
        pdfFile: this.report.createReferto(res, false),
        isReferto: false,
        idVisita: visita.id,
        title: 'Anteprima referto'
      }
      const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
        data: obj,
        panelClass: "modal-anteprima-pdf"

      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          // this.stampaReport(pdfFile, res)

          this.ngOnInit()
        }
      });



  }

  async getTipiRichiesta() {
    await this.service.getCallRequest({ action: 'tipirichiesta' }).then(data => {
      this.listaTipiVisite = data;
    });
  }


  createParams(visita) {
    this.queryParams.page = this.pageSelected;

    if (!(visita.idPaziente === null || visita.idPaziente === undefined)) {
      this.queryParams.idPaziente = visita.idPaziente;
    }
    //

    if (!(visita.idPrestazione === null || visita.idPrestazione === undefined)) {
      this.queryParams.idVisita = visita.idPrestazione;
    }

    this.queryParams.sortDirection = this.sortDirection;
    this.queryParams.columnSort = this.columnSort;

    this.queryParams.fromStorico = true;

    const dataTmp = this.formFiltrivisita.get("dataVisita").value;


    if (dataTmp != '') {
      this.queryParams.dataVisita = new Date(dataTmp).toUTCString()// this.appGen.convertUTCDateToLocalDate(dataTmp)
    }

    this.queryParams.fromElencoVisite = true
  }

  setValSearch(paramsRicerca) {
    if (!(paramsRicerca['dataVisita'] == null || paramsRicerca['dataVisita'] == undefined || paramsRicerca['dataVisita'] == '')) {

      const date = new Date(paramsRicerca.dataVisita);
      this.formFiltrivisita.get("dataVisita").setValue(date);
    }

    if (!(paramsRicerca['columnSort'] == null || paramsRicerca['columnSort'] == undefined || paramsRicerca['columnSort'] == '')) {
      this.columnSort = paramsRicerca['columnSort'];
    }
    if (!(paramsRicerca['sortDirection'] == null || paramsRicerca['sortDirection'] == undefined || paramsRicerca['sortDirection'] == '')) {
      this.sortDirection = paramsRicerca['sortDirection'];
    }
  }

  async openDocumentList(idVisita, data) {

    const obj = {
      idVisita: idVisita
    }
    // let res = await this.visiteService.getlistdocumenti(obj);
    const dialogData = new ListaDocumentiDialogModel("Documenti visita " + new Date(data).toLocaleDateString(), obj);

    this.dialog.open(ListaDocumentiComponent, {
      data: dialogData,
      panelClass: "modal-lista-documenti"
    });


  }

  async annullaVisita(visita) {

    const dialogData = new ConfirmDialogModel("Attenzione!", "Sei sicuro di voler annullare la richiesta di <strong><span class='patientViewCapitalize'>" + visita.paziente + " </span></strong>?");
    const dialogRef = this.dialog.open(ModalAnnullaRichiestaComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });
    let motivoSelezionato;
    dialogRef.componentInstance.motivoSelezionato.subscribe((data) => {
      motivoSelezionato = data
    });


    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        //
        const obj = {
          idMotivoCancellazione: motivoSelezionato
        }

        this.service.putCallRequest({ action: 'annullaVisita', param: visita.id, json: obj }).then(() => {
          this.getListaVisite();
        });
      }
    }));
  }

  async compilaVisita(visita) {
    //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione
    let dialogData;
    let dialogRef;

    const objRequest = {
      action: 'checkVisiteIniziate',
      param: visita.id
    }
    await this.service.getCallRequest(objRequest);


    let message = "Vuoi iniziare la visita per <strong>"

    const dataCliccata = new Date(visita.dataPrestazione).setHours(0, 0, 0, 0)
    const dataCorrente = this.appGen.today.setHours(0, 0, 0, 0)
    if (dataCliccata > dataCorrente) {
      //se non ha il permesso di forzare la visita allora lo blocco, altrimenti lo avviso e chiedo conferma
      if (!this.authGuard.canAccess(this.appGen.permesso.ForzaInizioVisita)) {
        this.appGen.notificate.warning("Non è possibile iniziare una visita con data futura")
        return;
      } else {
        message = "La visita è in una data successiva a quella corrente. Vuoi comunque iniziare la visita per "
      }
    }

    switch (visita.idStatoVisita) {
      case this.statoVisita.Cancellata:
        return;

      case this.statoVisita.DaIniziare:
        dialogData = new ConfirmDialogModel("Attenzione!", message + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong>?");

        dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            //Nuova visita
            if (visita.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
            } else {
              this.router.navigate(['/app/pazienti/step/paziente', visita.idPaziente], { queryParams: { visit: visita.id } })
            }
          }
        }));
        break;
      case this.statoVisita.Iniziata:

        //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione

        dialogData = new ConfirmDialogModel("Attenzione!", "La visita è già stata iniziata, vuoi continuare la compilazione per " + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong>?");
        dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });

        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            if (visita.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
            } else {
              this.router.navigate(['/app/visite/step/anamnesi', visita.idPaziente], { queryParams: { visit: visita.id } })

            }
          }
        }));
        break;

      case this.statoVisita.DaRefertare:
        dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi refertare la visita di " + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong> ");
        dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {



         this.router.navigate(['/app/visite/step/anamnesi', visita.idPaziente], { queryParams: { visit: visita.id} })
          }
        }));
        break;

      default:
        break;
    }


  }

  dettaglioPopupVisita(id) {
    this.dialog.open(ModalDettaglioVisitaComponent, {
      data: id,
      panelClass: "modal-custom"

    });

  }
}
