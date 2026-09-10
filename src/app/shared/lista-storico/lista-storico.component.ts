import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort, Sort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import {
  TipoAlimentazione,
  TipoDocumento,
  TipoPrestazione,
} from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { ReportService } from 'src/app/_core/services/report.service'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service'
import {
  ListaDocumentiComponent,
  ListaDocumentiDialogModel,
} from 'src/app/shared/lista-documenti/lista-documenti.component'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import _ from 'underscore'

@Component({
  selector: 'app-lista-storico',
  templateUrl: './lista-storico.component.html',
  styleUrls: ['./lista-storico.component.scss'],
})
export class ListaStoricoComponent implements OnInit {
  sortDirection
  columnSort
  @ViewChild(MatSort) sort: MatSort
  storicoDataSource = new MatTableDataSource<any>()
  storicoViewsColumns = [
    'tipoPrestazione',
    'alimentazioneVisita',
    'data',
    'dataEffettuata',
    'motivo',
    'priorita',
    'medico',
    'pulsanti',
  ]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
  formFiltriStorico: FormGroup

  // pageEvent: PageEvent;
  elementiTotali = 0
  pageSelected = 0
  queryParams: any = {}
  ricercaParam
  paziente
  idPaziente
  @Input() isStoricoCruscotto
  idVisita
  tipoPrestazione = TipoPrestazione
  tipoAlimentazione = TipoAlimentazione

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private dialog: MatDialog,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private report: ReportService,
    private documentHttp: DocumentiService,
    private confService: ConfezionamentiService
  ) {}

  ngOnInit() {
    this.formFiltriStorico = this.formBuilder.group({
      dataVisita: new FormControl(''),
    })

    const retrievedObjectFromCalendario = sessionStorage.getItem(
      'dettaglioStoricoPaziente'
    )
    if (
      !(
        retrievedObjectFromCalendario == null ||
        retrievedObjectFromCalendario == undefined ||
        retrievedObjectFromCalendario == ''
      )
    ) {
      this.ricercaParam = JSON.parse(retrievedObjectFromCalendario)
    } else {
      const retrievedObjectFromPaziente = sessionStorage.getItem('ricercaParamPaziente')
      if (
        !(
          retrievedObjectFromPaziente == null ||
          retrievedObjectFromPaziente == undefined ||
          retrievedObjectFromPaziente == ''
        )
      ) {
        this.ricercaParam = JSON.parse(retrievedObjectFromPaziente)
      }
    }

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')
    this.activateRoute.queryParams.subscribe((params) => {
      if (!this.appGen.isNullOrUndefined(params)) {
        this.idVisita = params.visit
      }
      if (!this.appGen.isNullOrUndefined(params.patient)) {
        this.idPaziente = params.patient
      }
    })

    if (
      !(
        this.ricercaParam == null ||
        this.ricercaParam == undefined ||
        this.ricercaParam == ''
      )
    ) {
      this.getListaStorico()
    } else {
      if (
        !this.appGen.isNullOrUndefined(this.idVisita) ||
        !this.appGen.isNullOrUndefined(this.idPaziente)
      ) {
        this.getListaStorico()
      }
    }
  }

  ngAfterViewInit(): void {
    sessionStorage.removeItem('dettaglioStoricoPaziente')
  }

  search() {
    this.getListaStorico()
  }

  clearSearch() {
    this.formFiltriStorico.get('dataVisita').setValue('')
    this.getListaStorico()
  }

  onChangePage(evt) {
    this.pageSelected = evt.pageIndex
    this.getListaStorico(this.pageSelected)
    this.appGen.scroll('containerTable')
  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return
    }
    this.columnSort = sort.active
    this.sortDirection = sort.direction
    this.pageSelected = 0
    this.getListaStorico()
  }

  async getListaStorico(page?: number) {
    let dataVisitaTmp
    let obj

    if (!this.appGen.isNullOrUndefined(this.ricercaParam) && !this.isStoricoCruscotto) {
      if (!this.appGen.isNullOrUndefined(this.ricercaParam.start)) {
        dataVisitaTmp = new Date(this.ricercaParam.start)
        this.formFiltriStorico.get('dataVisita').setValue(this.ricercaParam.start)
      } else {
        if (this.formFiltriStorico.get('dataVisita').value != '') {
          dataVisitaTmp = this.formFiltriStorico.get('dataVisita').value
        }
      }

      obj = {
        page: this.appGen.isNullOrUndefined(page) ? 0 : page,
        elementForPage: 10,
        DataVisita: this.appGen.convertToLocaleDate(dataVisitaTmp),
        IdPaziente: this.appGen.isNullOrUndefined(this.ricercaParam.idPaziente)
          ? ''
          : this.ricercaParam.idPaziente,
        IdVisita: this.ricercaParam.fromStorico
          ? this.idVisita
          : this.ricercaParam.idVisita,
        Sort: this.sortDirection,
        ColumnSort: this.columnSort,
      }
    } else {
      dataVisitaTmp = this.formFiltriStorico.get('dataVisita').value
      obj = {
        page: this.appGen.isNullOrUndefined(page) ? 0 : page,
        elementForPage: 10,
        DataVisita: this.appGen.convertToLocaleDate(dataVisitaTmp),
        idVisitaCorrenteXCruscotto: this.idVisita,
        IdPaziente: this.idPaziente,
        Sort: this.sortDirection,
        ColumnSort: this.columnSort,
      }
    }

    const res = await this.service.postCallRequest({
      action: 'listaStoricoVisite',
      param: obj,
    })
    if (!this.appGen.isNullOrUndefined(res)) {
      this.storicoDataSource = new MatTableDataSource<any>()
      this.storicoDataSource.data = res['listaStorico']
      this.elementiTotali = res['totalElement']
      this.paziente = res['nome'] + ' ' + res['cognome']
    }
  }

  dettaglioVisita(storico) {
    if (storico.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
      this.router.navigate(['/app/visite/step/domiciliare', storico.idPaziente], {
        queryParams: {
          visit: storico.idVisitaPrecedente,
          currentvisit: storico.id,
          domiciliare: true,
          fromStorico: true,
        },
      })
    } else {
      this.router.navigate(['/app/visite/step/riepilogo', storico.idPaziente], {
        queryParams: { visit: storico.id, fromStorico: true },
      })
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


  async pianoNutrizionale(idvisitastorico) {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: idvisitastorico })
      .then(async (res) => {

        let isDietaSettimanale = false;
        if (res.visita?.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista
          && !this.appGen.isNullOrUndefined(res.prodotti?.prodotti[0]?.prodotti[0].settimana)
          && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != "") {
          isDietaSettimanale = true
        }

        ///SE È PRESENTE IL CONFEZIONAMENTO VENGONO CALCOLATI I VALORI RELATIVI AI CONFEZIONAMENTI
        ///VIENE FATTO QUI PERCHÈ IMPOSSIBILE FARLO CON IL SERVIZIO
        for (const prodotto of res.prodotti.prodotti) {
          if (prodotto.idConfezionamentoProdotto) {
          prodotto.confezionamentoSelezionato = await firstValueFrom(this.confService.getConfezionamentoById(prodotto.idConfezionamentoProdotto));
          prodotto.quantitaConfezionamento = prodotto.confezionamentoSelezionato.quantita;
          prodotto.unitaMisuraConfezionamento = prodotto.confezionamentoSelezionato.unitaMisura;
          prodotto.nConfezionamentiDaUtilizzare = Math.ceil(prodotto.quantita/ prodotto.quantitaConfezionamento)
          prodotto.nConfezionamentiReali = prodotto.quantita/ prodotto.quantitaConfezionamento;
          }
        }
        let xInvioMail = this.appGen.configLinfa.invioPianoNutrizionaleTramiteMail? true : false;


        const obj = {
          pdfFile: this.report.createPianoNutrizionale(res, false, isDietaSettimanale, false),
          isReferto: false,
          title: 'Piano nutrizionale',
          allowPrint: true,
          xInvioMail : xInvioMail,
          email : xInvioMail && res.paziente.email? res.paziente.email : null,
          bothMailPrint : true,
          nome : res.paziente.nome

        }

        const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })

        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            // this.stampaReport(pdfFile, res)
          }
        })
      })
  }


  async pianoNutrizionaleConKcalNascoste(idvisitastorico) {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: idvisitastorico })
      .then(async (res) => {

        let isDietaSettimanale = false;
        if (res.visita?.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista
          && !this.appGen.isNullOrUndefined(res.prodotti?.prodotti[0]?.prodotti[0].settimana)
          && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != "") {
          isDietaSettimanale = true
        }

        ///SE È PRESENTE IL CONFEZIONAMENTO VENGONO CALCOLATI I VALORI RELATIVI AI CONFEZIONAMENTI
        ///VIENE FATTO QUI PERCHÈ IMPOSSIBILE FARLO CON IL SERVIZIO
        for (const prodotto of res.prodotti.prodotti) {
          if (prodotto.idConfezionamentoProdotto) {
          prodotto.confezionamentoSelezionato = await firstValueFrom(this.confService.getConfezionamentoById(prodotto.idConfezionamentoProdotto));
          prodotto.quantitaConfezionamento = prodotto.confezionamentoSelezionato.quantita;
          prodotto.unitaMisuraConfezionamento = prodotto.confezionamentoSelezionato.unitaMisura;
          prodotto.nConfezionamentiDaUtilizzare = Math.ceil(prodotto.quantita/ prodotto.quantitaConfezionamento);
          prodotto.nConfezionamentiReali = prodotto.quantita/ prodotto.quantitaConfezionamento;
          }
        }

        let xInvioMail = this.appGen.configLinfa.invioPianoNutrizionaleTramiteMail? true : false;

        const obj = {
          pdfFile: this.report.createPianoNutrizionale(res, false, isDietaSettimanale, true),
          isReferto: false,
          title: 'Piano nutrizionale',
          allowPrint: true,
          xInvioMail : xInvioMail,
          email : xInvioMail && res.paziente.email? res.paziente.email : null,
          nome : res.paziente.nome,
          bothMailPrint : true
        }

        const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })

        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            // this.stampaReport(pdfFile, res)
          }
        })
      })
  }



  async anamnesiAlimentare(idvisitastorico){

    //già filtrato in base al tipo alimentazione, lato server
 await this.service.getCallRequest({ action: 'GetAnamnesiAlimentareVisita', param: idvisitastorico }).then((res) => {
  let isDietaSettimanale = false;
  if (
    res.prodotti?.prodotti[0]?.prodotti[0]?.settimana &&
    res.prodotti?.prodotti[0]?.prodotti[0]?.settimana?.length > 0
    && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != "") {
    isDietaSettimanale = true;
  }
   const obj = {
     pdfFile: this.report.createAnamnesiAlimentare(res, false, isDietaSettimanale),
     isReferto: false,
     nomeDocumento: 'Anamnesi alimentare',
     title: 'Anamnesi alimentare',
     allowPrint: true,
   }

   const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
     data: obj,
     panelClass: "modal-anteprima-pdf"

   });

   dialogRef.afterClosed().subscribe(dialogResult => {
     if (dialogResult) {


     }
   });


 });

}


async anamnesiAlimentareConKcalNascoste(idvisitastorico){

  //già filtrato in base al tipo alimentazione, lato server
await this.service.getCallRequest({ action: 'GetAnamnesiAlimentareVisita', param: idvisitastorico }).then((res) => {
  let isDietaSettimanale = false;
  if (
    res.prodotti?.prodotti[0]?.prodotti[0]?.settimana &&
    res.prodotti?.prodotti[0]?.prodotti[0]?.settimana?.length > 0
    && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != "") {
    isDietaSettimanale = true;
  }
 const obj = {
   pdfFile: this.report.createAnamnesiAlimentare(res, false, isDietaSettimanale, true),
   isReferto: false,
   nomeDocumento: 'Anamnesi alimentare',
   title: 'Anamnesi alimentare',
   allowPrint: true,
 }

 const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
   data: obj,
   panelClass: "modal-anteprima-pdf"

 });

 dialogRef.afterClosed().subscribe(dialogResult => {
   if (dialogResult) {


   }
 });


});

}

  // async getpdf(namePDF) {
  //   await this.visiteService.getpdf(namePDF);
  // }

  async anteprimaSacche(idVisita) {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'getPrescrizioneSacca', param: idVisita })
      .then((res) => {
        const obj = {
          pdfFile: this.report.createPrescrizioneSacche(res),
          isReferto: false,
          title: 'Anteprima sacche personalizzate',
        }

        this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })
      })
  }

  createParams(storico) {
    this.queryParams.page = this.pageSelected

    if (!(storico.idPaziente === null || storico.idPaziente === undefined)) {
      this.queryParams.idPaziente = storico.idPaziente
    }
    //

    if (!(storico.idPrestazione === null || storico.idPrestazione === undefined)) {
      this.queryParams.idVisita = storico.idPrestazione
    }

    this.queryParams.fromStorico = true

    const dataTmp = this.formFiltriStorico.get('dataVisita').value

    if (dataTmp != '') {
      this.queryParams.dataVisita = new Date(dataTmp).toLocaleString() // this.appGen.convertUTCDateToLocalDate(dataTmp)
    }
  }

  setValSearch(paramsRicerca) {
    if (
      !(
        paramsRicerca['dataVisita'] == null ||
        paramsRicerca['dataVisita'] == undefined ||
        paramsRicerca['dataVisita'] == ''
      )
    ) {
      const date = new Date(paramsRicerca.dataVisita)
      this.formFiltriStorico.get('dataVisita').setValue(date)
    }
  }

  async openDocumentList(idVisita, data) {
    const obj = {
      idVisita: idVisita,
    }
    const dialogData = new ListaDocumentiDialogModel(
      'Documenti visita ' + new Date(data).toLocaleDateString(),
      obj
    )

    this.dialog.open(ListaDocumentiComponent, {
      data: dialogData,
      panelClass: 'modal-lista-documenti',
    })
  }
}
