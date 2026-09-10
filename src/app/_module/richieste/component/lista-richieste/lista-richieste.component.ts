import { isPlatformServer } from '@angular/common';
import { Location } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator'
import { Sort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { DatQueryRichieste, Ruoli, StatoRichiesta, StatoVisita, TipoAlimentazione, TipoPrestazione } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { Richiesta } from 'src/app/_module/richieste/_dto-richieste/dto-richieste'
import { ModalAnnullaRichiestaComponent } from 'src/app/shared/modal/modal-annulla-richiesta/modal-annulla-richiesta.component';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ReportService } from 'src/app/_core/services/report.service';
import { ModalValiditaPianoTerapeuticoComponent } from 'src/app/shared/modal/modal-validita-piano-terapeutico/modal-validita-piano-terapeutico.component';
import { firstValueFrom } from 'rxjs';
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';

@Component({
  selector: 'app-lista-richieste',
  templateUrl: './lista-richieste.component.html',
  styleUrls: ['./lista-richieste.component.scss']
})
export class ListaRichiesteComponent implements OnInit {

  richiesteDataSource = new MatTableDataSource<Richiesta>([]);
  richiesteViewsColumns = null
  formFiltriRichieste: FormGroup
  elementiTotali = 0;
  itemsForPage = 10;
  pageSelected = 0;
  DatQuery= DatQueryRichieste
  sortDirection;
  columnSort;
  listaUrgenze;
  listaTipiRichieste;
  isFromDashboard = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  listaMedici;
  listaAmbulatori;
  tipoUtente = Ruoli;
  statoRichiesta = StatoRichiesta
  queryParams: any = {};
  ricercaParam
  tipoAlimentazione = TipoAlimentazione;
  queryId = null
  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private activateRoute: ActivatedRoute,
    private backPreviousPage: Location,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private router: Router,
    public authGuard: AuthGuard,
    private dialog: MatDialog,
    private report: ReportService,
    private confService: ConfezionamentiService,
    @Inject(PLATFORM_ID) private platformId: string
  ) {

    // domain and port for SSR in this example is static. Use i.e. environment files to use appropriate dev/prod domain:port
    const domain = (isPlatformServer(platformId)) ? environment.Url : '';

    this.matIconRegistry.addSvgIcon(
      "male",
      this.domSanitizer.bypassSecurityTrustResourceUrl(domain + "assets/icons/gender-male.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "female",
      this.domSanitizer.bypassSecurityTrustResourceUrl(domain + "assets/icons/gender-female.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "other",
      this.domSanitizer.bypassSecurityTrustResourceUrl(domain + "assets/icons/gender-other.svg")
    );
  }

async ngOnInit() {
// Le colonne di default
this.richiesteViewsColumns= ["dataPrestazione", "paziente", "cf", "prestazione", "tipo", "stato", /*"priorita",*/ "medico", "dietista", "ambulatorio", "pulsanti"]
if( this.authGuard.canRole(this.appGen.ruolo.Reparto)){
  this.richiesteViewsColumns=['dataCreazione','dataPrestazione','paziente','repartoDegenza','postoDegenza','stato','medico','pulsanti']
}else if( this.authGuard.canRole(this.appGen.ruolo.Distretto)){
    this.richiesteViewsColumns=['dataCreazione','dataPrestazione','paziente','stato','pulsanti']

}else if(this.queryId ==16 ){
  //Nuova Richiue
  this.richiesteViewsColumns=['dataCreazione','dataPrestazione','paziente','repartoDegenza','postoDegenza','stato','medico','pulsanti']
}else{
  this.richiesteViewsColumns= ["dataPrestazione", "paziente", "cf", "prestazione", "tipo", "stato", /*"priorita",*/ "medico", "dietista", "ambulatorio", "pulsanti"]
}
    this.formFiltriRichieste = this.formBuilder.group({
      nome: new FormControl(''),
      cognome: new FormControl(''),
      dataPrestazione: new FormControl(''),
      stato: new FormControl(''),
      cf: new FormControl(''),
      priorita: new FormControl(''),
      tipoRichiesta: new FormControl(''),
      medico: new FormControl(''),
      ambulatorio: new FormControl(''),
    });

    this.getListaUrgenze();
    this.getTipiRichiesta();
    this.getListaMedici();
    this.getListaAmbulatori();

    this.activateRoute.queryParams.subscribe(params => {


      //Provengo dalla dashboard e passo l'id query
      if (!this.appGen.isNullOrUndefined(params.query)) {
        this.isFromDashboard = true;
        this.queryId = params.query
        this.getListaRichieste(null, params.query)
        if( this.authGuard.canRole(this.appGen.ruolo.Reparto)){
          this.richiesteViewsColumns=['dataCreazione','dataPrestazione','paziente','repartoDegenza','postoDegenza','stato','medico','pulsanti']
        }else if( this.authGuard.canRole(this.appGen.ruolo.Distretto)){
            this.richiesteViewsColumns=['dataCreazione','dataPrestazione','paziente','stato','pulsanti']

        }else if(this.queryId == 16 ){
          //Nuova Richiue
          this.richiesteViewsColumns = ['dataCreazione','dataPrestazione','paziente','repartoDegenza','postoDegenza','stato','medico','pulsanti']
        }else{
          //debugger
          this.richiesteViewsColumns= ["dataPrestazione", "paziente", "cf", "prestazione", "tipo", "stato", /*"priorita",*/ "medico", "dietista", "ambulatorio", "pulsanti"]
        }
      } else {
        //Altrimenti controllo se ho in sessione dei parametri

        const retrievedObjectFromRichiesta = sessionStorage.getItem('ricercaParamRichiesta');
        if (!this.appGen.isNullOrUndefined(retrievedObjectFromRichiesta)) {
          this.ricercaParam = JSON.parse(retrievedObjectFromRichiesta);
        }
        if (!this.appGen.isNullOrUndefined(this.ricercaParam)) {
          this.setValSearch(this.ricercaParam);
          this.pageSelected = this.ricercaParam.page;
          this.getListaRichieste(this.ricercaParam.page);
        } else {
          //Non ho parametri nemmeno in sessione, mi prendo tutte le richieste
          this.getListaRichieste();
        }
      }
    });

  }

  dettaglio(richiesta) {

    if (this.appGen.isNullOrUndefined(richiesta.idRichiesta)) {
      return;
    }
    this.createParams(richiesta.idRichiesta)
    sessionStorage.setItem('ricercaParamRichiesta', JSON.stringify(this.queryParams));
    if (richiesta.daCompletare) {
      this.router.navigate(['app/richieste/dettaglio/richiesta', richiesta.idRichiesta], { queryParams: { tocomplete: true } })
    } else {
      this.router.navigate(['app/richieste/dettaglio/richiesta', richiesta.idRichiesta]);
    }
  }

  dettaglioPaziente(idPaziente) {
    if (this.appGen.isNullOrUndefined(idPaziente)) {

      return;
    }
    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamRichiesta', JSON.stringify(this.queryParams));
    this.router.navigate(['app/pazienti/dettaglio/paziente', idPaziente]);
  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaRichieste(null, this.queryId);
  }

  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getListaRichieste(this.pageSelected, this.queryId);
  }

  search() {
    this.getListaRichieste(null, this.queryId);
  }

  clearSearch() {
    this.formFiltriRichieste.reset()
    this.getListaRichieste(null, this.queryId);
  }

  async getListaUrgenze() {
    await this.service.getCallRequest({ action: 'priorita' }).then(data => {
      this.listaUrgenze = data;
    });
  }

  async getTipiRichiesta() {
    await this.service.getCallRequest({ action: 'tipirichiesta' }).then(data => {
      this.listaTipiRichieste = data;
    });
  }

  backToPrevious() {
    this.backPreviousPage.back()
  }

  async getListaRichieste(page?: number, query?: number) {
    try {

      
      if (this.formFiltriRichieste.invalid) {
        return;
      }
  
      const dataPrestazioneTmp = this.formFiltriRichieste.get("dataPrestazione").value;

      const params = {
        page: this.appGen.isNullOrUndefined(page) ? 0 : page,
        query: this.appGen.isNullOrUndefined(query) ? 0 : query,
        elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
        nome: this.formFiltriRichieste.get("nome").value,
        cognome: this.formFiltriRichieste.get("cognome").value,
        cf: this.formFiltriRichieste.get("cf").value,
        priorita: this.formFiltriRichieste.get("priorita").value,
        tipoRichiesta: this.formFiltriRichieste.get("tipoRichiesta").value,
        idStato: this.formFiltriRichieste.get("stato").value,
        dataPrestazione: this.appGen.convertToLocaleDate(dataPrestazioneTmp),
        medico: this.formFiltriRichieste.get("medico").value,
        ambulatorio: this.formFiltriRichieste.get("ambulatorio").value,
        Sort: this.sortDirection,
        ColumnSort: this.columnSort
      }
  
      const objRequest = {
        action: 'listarichieste',
        param: params
      }
      //debugger
      const res = await this.service.postCallRequest(objRequest);
      
      this.richiesteDataSource = new MatTableDataSource<any>([]);
  
      if (!this.appGen.isNullOrUndefined(res)) {
        this.richiesteDataSource.data = res['listaRichieste'];
        this.elementiTotali = res['totalElement'];
        sessionStorage.removeItem('ricercaParamRichiesta');
      }
    } catch (error) {
      console.error(error);
    }

  }

  async compilaVisita(idrichiesta) {
    const objRequest = {
      action: 'getVisitaFromRichiesta',
      param: idrichiesta
    }
    const visita = await this.service.getCallRequest(objRequest);
    

    //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione
    let dialogData;
    let dialogRef;

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
      case StatoVisita.Cancellata:
        return;

      case StatoVisita.DaIniziare:
        dialogData = new ConfirmDialogModel("Attenzione!", message + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong>?");
        dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            //Nuova visita
            if (visita.idTipoPrestazione == TipoPrestazione.VisitaDomicilio) {
              this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
            } else {
              this.router.navigate(['/app/pazienti/step/paziente', visita.idPaziente], { queryParams: { visit: visita.id } })
            }
          }
        }));
        break;
      case StatoVisita.Iniziata:

        //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione

        dialogData = new ConfirmDialogModel("Attenzione!", "La visita è già stata iniziata, vuoi continuare la compilazione per " + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong> ");
        dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });

        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            if (visita.idTipoPrestazione == TipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
            } else {
              this.router.navigate(['/app/visite/step/anamnesi', visita.idPaziente], { queryParams: { visit: visita.id } })

            }
          }
        }));
        break;

      case StatoVisita.DaRefertare:
        dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi refertare la visita di <strong> style='text-transform: capitalize'>" + visita.paziente + "</strong> ");
        dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {

            this.router.navigate(['/app/visite/riepilogo', visita.idPaziente], { queryParams: { visit: visita.id } })
          }
        }));
        break;

      default:
        break;
    }


  }

  async annullaVisita(richiesta) {
    const dialogData = new ConfirmDialogModel("Attenzione!", "Sei sicuro di voler annullare la richiesta di <strong><span class='patientViewCapitalize'>" + richiesta.nome + " " + richiesta.cognome + " </span></strong>?");
    const dialogRef = this.appGen.dialog.open(ModalAnnullaRichiestaComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });
    let motivoSelezionato;
    dialogRef.componentInstance.motivoSelezionato.subscribe((data) => {
      motivoSelezionato = data
    });


    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {

        const params = {
          idMotivoCancellazione: motivoSelezionato
        }
        const objRequest = {
          action: 'annullaRichiesta',
          param: richiesta.idRichiesta,
          json: params
        }

/* invio annulamento della richiesta */
        this.service.putCallRequest(objRequest).then(() => {

          /** Refresho la lista delle richieste senza passare la pagina corrente  */
          this.getListaRichieste(null, this.queryId);
          // reseto il paginatore
          this.paginator.pageIndex=0
        });

      }
    }));
  }

  async getListaAmbulatori() {
    await this.service.getCallRequest({ action: 'ambulatori' }).then(data => {
      this.listaAmbulatori = data;
    });
  }

  async getListaMedici() {
    const params = {
      tipoUtente: this.tipoUtente.Medico
    }

    const objRequest = {
      action: 'getUtenti',
      param: params
    }
    await this.service.postCallRequest(objRequest).then(data => {
      this.listaMedici = data;
    });
  }


  infoCancellazione(richiesta) {
    this.appGen.openDialog("Richiesta annullata", richiesta.motivoCancellazione + " in data: " + new Date(richiesta.dataCancellazione).toDateString());

  }

  ModificaRichiesta(idRichiesta) {

    this.router.navigate(['app/richieste/dettaglio/richiesta', idRichiesta], { queryParams: { change: true } })
  }

  async accettaEInizia(richiesta) {
    const dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi accettare la richiesta e iniziare la visita di <strong><span class='patientViewCapitalize'>" + richiesta.nome + " " + richiesta.cognome + " </span></strong>?");
    const dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });


    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        const Richiesta = {
          IdStatoRichiesta: StatoRichiesta.Accettata,
        };

        const params = {
          Richiesta,
        }

        const objRequest = {
          action: 'gestiscirichiesta',
          param: richiesta.idRichiesta,
          json: params
        }
        this.service.putCallRequest(objRequest).then(async () => {

          const objRequest = {
            action: 'getVisitaFromRichiesta',
            param: richiesta.idRichiesta,
          }
          const visita = await this.service.getCallRequest(objRequest);

          //se non ha il permesso di forzare la visita allora lo blocco, altrimenti lo avviso e chiedo conferma
          if (!this.authGuard.canAccess(this.appGen.permesso.ForzaInizioVisita)) {
            const dataCliccata = new Date(visita.dataPrestazione).setHours(0, 0, 0, 0)
            const dataCorrente = this.appGen.today.setHours(0, 0, 0, 0)
            if (dataCliccata > dataCorrente) {
              this.appGen.notificate.warning("La richiesta è stata accetta ma non è possibile iniziare una visita con data futura", 3500)
              return;
            }
          }


          if (visita.idTipoPrestazione == TipoPrestazione.VisitaDomicilio1) {
            this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
          } else {
            this.router.navigate(['/app/pazienti/step/paziente', visita.idPaziente], { queryParams: { visit: visita.id } })
          }
        });
      }
    }));
  }

  async accettaRichiesta(richiesta) {
    const dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi accettare la richiesta di <strong><span class='patientViewCapitalize'>" + richiesta.nome + " " + richiesta.cognome + " </span></strong>?");
    const dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });


    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        const Richiesta = {
          IdStatoRichiesta: StatoRichiesta.Accettata,
        };

        const obj = {
          Richiesta,
        }
        const objRequest = {
          action: 'gestiscirichiesta',
          param: richiesta.idRichiesta,
          json: obj
        }
        this.service.putCallRequest(objRequest).then(() => {
          this.getListaRichieste(null, this.queryId);
        });
      }
    }));
  }


  createParams(pazienteId) {
    this.queryParams.page = this.pageSelected;

    if (!(pazienteId === null || pazienteId === undefined)) {
      this.queryParams.idPaziente = pazienteId;
    }

    const dataPrestazione = this.formFiltriRichieste.get("dataPrestazione").value;

    if (this.formFiltriRichieste.get("nome").value != '') {
      this.queryParams.nome = this.formFiltriRichieste.get("nome").value;
    }

    if (this.formFiltriRichieste.get("cognome").value != '') {
      this.queryParams.cognome = this.formFiltriRichieste.get("cognome").value;
    }

    if (this.formFiltriRichieste.get("cf").value != '') {
      this.queryParams.cf = this.formFiltriRichieste.get("cf").value;
    }
    if (this.formFiltriRichieste.get("stato").value != '') {
      this.queryParams.stato = this.formFiltriRichieste.get("stato").value;
    }
    if (this.formFiltriRichieste.get("priorita").value != '') {
      this.queryParams.priorita = this.formFiltriRichieste.get("priorita").value;
    }
    if (this.formFiltriRichieste.get("tipoRichiesta").value != '') {
      this.queryParams.tipoRichiesta = this.formFiltriRichieste.get("tipoRichiesta").value;
    }
    if (this.formFiltriRichieste.get("medico").value != '') {
      this.queryParams.medico = this.formFiltriRichieste.get("medico").value;
    }
    if (this.formFiltriRichieste.get("ambulatorio").value != '') {
      this.queryParams.ambulatorio = this.formFiltriRichieste.get("ambulatorio").value;
    }

    if (dataPrestazione != '') {
      this.queryParams.dataPrestazione = this.appGen.convertToLocaleDate(dataPrestazione)
    }
  }

  setValSearch(paramsRicerca) {
    if (!(paramsRicerca['dataNascita'] == null || paramsRicerca['dataNascita'] == undefined || paramsRicerca['dataNascita'] == '')) {

      const date = new Date(paramsRicerca.dataPrestazione);
      this.formFiltriRichieste.get("dataPrestazione").setValue(date);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.cf)) {
      this.formFiltriRichieste.get("cf").setValue(paramsRicerca.cf);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.nome)) {
      this.formFiltriRichieste.get("nome").setValue(paramsRicerca.nome);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.cognome)) {
      this.formFiltriRichieste.get("cognome").setValue(paramsRicerca.cognome);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.stato)) {
      this.formFiltriRichieste.get("stato").setValue(paramsRicerca.stato);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.priorita)) {
      this.formFiltriRichieste.get("priorita").setValue(paramsRicerca.priorita);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.tipoRichiesta)) {
      this.formFiltriRichieste.get("tipoRichiesta").setValue(paramsRicerca.tipoRichiesta);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.medico)) {
      this.formFiltriRichieste.get("medico").setValue(paramsRicerca.medico);
    }
    if (!this.appGen.isNullOrUndefined(paramsRicerca.ambulatorio)) {
      this.formFiltriRichieste.get("ambulatorio").setValue(paramsRicerca.ambulatorio);
    }
  }



  async pianoNutrizionale(data: any) {    
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
        allowPrint:true
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
