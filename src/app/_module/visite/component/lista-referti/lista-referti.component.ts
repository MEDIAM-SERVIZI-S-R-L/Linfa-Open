import { SelectionModel } from '@angular/cdk/collections'
import { Component, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort, Sort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import { TipoDocumento, TipoPrestazione } from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { ReportService } from 'src/app/_core/services/report.service'
import { RefertoDaFirmare } from 'src/app/_models/documenti'
import { ModalStoricoInviiComponent } from 'src/app/_module/configurazioni/component/modal-storico-invii/modal-storico-invii.component'
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service'
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service'
import {
  ListaDocumentiComponent,
  ListaDocumentiDialogModel,
} from 'src/app/shared/lista-documenti/lista-documenti.component'
import {
  ConfirmDialogModel,
  ModalConfirmComponent,
} from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import Swal from 'sweetalert2'
import _ from 'underscore'

import { ModalDettaglioVisitaComponent } from '../modal-dettaglio-visita/modal-dettaglio-visita.component'

@Component({
  selector: 'app-lista-referti',
  templateUrl: './lista-referti.component.html',
  styleUrls: ['./lista-referti.component.scss'],
})
export class ListaRefertiComponent implements OnInit {
  selection = new SelectionModel<any>(true, [])

  sortDirection = 'desc'
  columnSort = 'data'
  @ViewChild(MatSort) sort: MatSort
  dataSource = new MatTableDataSource<any>()
  viewsColumns = [
    'select',
    'data',
    'paziente',
    'cf',
    'tipoPrestazione',
    'medico',
    'pulsanti',
  ]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
  formFiltrivisita: FormGroup

  elementiTotali = 0 // numero referti da firmare
  pageSelected = 0
  itemsForPage = 10
  queryParams: any = {}
  isAllSelect = false
  ricercaParam
  paziente
  listaAmbulatori
  listaMedici
  tipoPrestazione = TipoPrestazione
  selectedRowIndex = -1
  idPaziente
  listaTipiVisite

  isFromDashboard = false
  queryId = null
  rowChecked = []
  pdfFile
  refertiFirmati=false;
  //Variabile che si usa per i referti inviati con errore ---> Query === 18
  conErrore = false;

  constructor(
    public authGuard: AuthGuard,
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private report: ReportService,
    private documentHttp: DocumentiService,
    private visitaServ: VisitaRepoService,
    private notificate: SnackBarService
  ) {}

  ngOnInit() {
    //** Form per la ricerca  */
    this.formFiltrivisita = this.formBuilder.group({
      dataVisita: new FormControl(null),
      tipoVisita: new FormControl(null),
      nome: new FormControl(null),
      cognome: new FormControl(null),
      cf: new FormControl(null),
      medico: new FormControl(null),
      ambulatorio: new FormControl(null),
    })

    //Sono nella compilazione visita, perciò mi prendo i parametri dalla url
    this.activateRoute.queryParams.subscribe((params) => {

      this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')

      if (!this.appGen.isNullOrUndefined(params.query)) {
        this.isFromDashboard = true
        this.queryId = params.query
        this.refertiFirmati = params.refertiFirmati =="true"? true :params.refertiFirmati =="false" ?false: null;
        this.conErrore = params.conErrore === "true"? true : false;

        this.getListaRefertiDaFirmare(null, this.queryId)
      }

      this.getTipiRichiesta()

      this.getListaAmbulatori()
      this.getListaMedici()
    })
  }

  /**
   * Lista ambulatori
   */
  async getListaAmbulatori() {
    this.listaAmbulatori = await this.service.getCallRequest({ action: 'ambulatori' })
  }
  /**
   * Lista medici
   */
  async getListaMedici() {
    const obj = {
      tipoUtente: this.appGen.ruolo.Medico,
    }
    this.listaMedici = await this.service.postCallRequest({
      action: 'getUtenti',
      param: obj,
    })
  }

  /**
   * Calla per tipi di richiesta
   */
  async getTipiRichiesta() {
    await this.service.getCallRequest({ action: 'tipirichiesta' }).then((data) => {
      this.listaTipiVisite = data
    })
  }

  ngAfterViewInit(): void {
    sessionStorage.removeItem('dettaglioStoricoPaziente')
  }

  isAllSelected(checked) {
    this.dataSource.data.forEach((element) => {
      element.selezionato = checked
      //  this.setSession(checked, element)
    })

    if (this.rowChecked.length > 0) {
      this.viewsColumns = ['select', 'data', 'paziente', 'pulsanti']
    } else {
      this.viewsColumns = [
        'select',
        'data',
        'paziente',
        'cf',
        'tipoPrestazione',
        'medico',
        'pulsanti',
      ]
    }
  }

  highlight(row) {
    //se uguale vuol dire che ho riciclato sulla riga e tolgo la selezione
    if (row.id == this.selectedRowIndex) {
      this.selectedRowIndex = -1
    } else {
      this.selectedRowIndex = row.id
    }
  }

  /**
   * Gestione del selezionamento e deselezionamento della riga
   */
  async check(checked, row) {
    try {
      row.selezionato = checked


      // Se selezionato check parte la chiamata che prende il pdf

      if (row.selezionato) {
        const refertoPdf =await this.getRefertoBase64(row.idDocumentoReferto)
        this.rowChecked.push(row)
        // await this.getReferto(row.idDocumentoReferto, row.idVisita)

        if (refertoPdf) {
          this.highlight(row)

          this.pdfFile =refertoPdf
        } else {
          row.selezionato = false
        }
      } else {
        this.isAllSelect = false
        this.rowChecked = this.rowChecked.filter((item) => item.idVisita !== row.idVisita)
        row.selezionato = false
        this.highlight(row)
      }
      // se almeno uno cambio la visualizazione per mostrare
      if (this.rowChecked.length > 0) {
        this.viewsColumns = ['select', 'data', 'paziente', 'pulsanti']
      } else {
        this.viewsColumns = [
          'select',
          'data',
          'paziente',
          'cf',
          'tipoPrestazione',
          'medico',
          'pulsanti',
        ]
      }
    } catch (error) {
      //** Nel caso di errore tolco le selezione e il check */

      row.selezionato = false

      this.highlight(row)
      this.appGen.notificate.error('Error apertura referto')
    }
  }
//Prendo Base64 del file per visualizarre
  async getRefertoBase64(idDocumentoReferto) {
    try {

        const _pdf64 = await firstValueFrom(this.documentHttp.donwloadFileBase64(idDocumentoReferto));
        return _pdf64


    } catch (error) {
      throw new Error('Referto non trovato')
      console.error('Referto non trovato')
    }
  }

  /**
   *  Funzione che prende pdf dal Backend
   * @param refertoId - id del Pdf con referto
   */
  async getReferto(idDocumentoReferto, idVisita) {
    try {

      //C'e' id referto
      if (idDocumentoReferto || idVisita) {
        //pdf referto esoste
        const refertoPdfExist = await firstValueFrom(this.documentHttp.checkFileExist(idDocumentoReferto))

        if (!refertoPdfExist) {
          throw new Error('Referto non trovato')
        }
        // Referto esite quindi devo prendere referto
        const obj = {
          idVisita: idVisita,
          idDocumento: idDocumentoReferto,
          idTipoDocumento: TipoDocumento.RefertoNutrizione,
        }
        const refertoPdf = await this.service.GetFileName(obj)
        // ritorna blob con pdf
        return refertoPdf
      } else {
        throw new Error('Id referto non trovato')
      }
    } catch (error) {
      this.appGen.notificate.error('Referto non trovato')
    }
  }

  /**
   * Funziona per lo scaricamento
   * @param row  - riga selezionata
   */
  async scaricaReferto(row) {
    try {
      const pdf = await this.getReferto(row.idDocumentoReferto, row.idVisita)
      if (!pdf) {
        throw Error()
      }
      // funzione per download blod to pdf
      await this.service.downloadFile(pdf, row.nomeReferto)
    } catch (error) {
      this.appGen.notificate.error(
        'Errore scaricamernto referto di ' + row.paziente.toUpperCase()
      )
    }
  }

  /**
   * Funziona per la stampa
   * @param row  - riga selezionata
   */

  async stampaReferto2(row) {
    try {

      const pdf = await this.getReferto(row.idDocumentoReferto, row.idVisita)
      if (!pdf) {
        throw Error()
      }
      await this.appGen.stampa(pdf)
    } catch (error) {
      this.appGen.notificate.error(
        'Errore stampa referto di ' + row.paziente.toUpperCase()
      )
    }
    //return null;
  }


  storicoInvii(row){
    const dialogRef = this.dialog.open(ModalStoricoInviiComponent,{
      data: row,
      maxHeight : '88vh',
      maxWidth : '88vw',
      width : '88vw',
      height : 'auto'
    })
    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaRefertiDaFirmare(null, this.queryId);
      }
    })
  }

  search() {
    this.getListaRefertiDaFirmare(null, this.queryId)
  }

  clearSearch() {
    this.formFiltrivisita.reset()
    this.getListaRefertiDaFirmare(null, this.queryId)
  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return
    }
    this.columnSort = sort.active
    this.sortDirection = sort.direction
    this.pageSelected = 0
    this.getListaRefertiDaFirmare(null, this.queryId)
  }

  /**
   * Vado prendere nuova lista di referti quando cambio la pagina
   * @param evt
   */
  onChangePage(evt) {
    this.pageSelected = evt.pageIndex
    this.getListaRefertiDaFirmare(this.pageSelected, this.queryId)
    this.isAllSelect = false
  }

  async getListaRefertiDaFirmare(page?: number, query?: number) {
    const dataVisitaTmp = this.formFiltrivisita.get('dataVisita').value
    const obj = {
      page: page === null || page === undefined ? 0 : page,
      elementForPage:
        this.itemsForPage === null || this.itemsForPage === undefined
          ? 10
          : this.itemsForPage,
      DataVisita: this.appGen.convertToLocaleDate(dataVisitaTmp),
      IdPaziente: this.idPaziente,
      TipoVisita: this.formFiltrivisita.get('tipoVisita').value,
      Cf: this.formFiltrivisita.get('cf').value,
      Cognome: this.formFiltrivisita.get('cognome').value,
      Nome: this.formFiltrivisita.get('nome').value,
      Ambulatorio: this.formFiltrivisita.get('ambulatorio').value,
      Medico: this.formFiltrivisita.get('medico').value,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort,
      Query: query,
      refertoFirmato: this.refertiFirmati
    }

    const res = await this.service.postCallRequest({
      action: 'getRefertiDaFirmare',
      param: obj,
    })

    this.dataSource = new MatTableDataSource<any>()
    this.elementiTotali = 0

    // se lista referti esiste e ci sono elementi selezionati vado cercare i elementi da selezionare
    if (res && this.rowChecked) {
      res.lista.forEach((lista) => {
        const _referto = _.findWhere(this.rowChecked, {
          idDocumentoReferto: lista.idDocumentoReferto,
        })
        // selecziono elemento
        _referto ? (lista.selezionato = true) : null
      })

      this.dataSource.data = res.lista
      this.elementiTotali = res.totalElement
    }
  }

  firmaDisabilitata() {
    const message = `Per motivi di sicurezza il modulo della firma digitale è stato disabilitato per l'ambiente di demo`
    const dialogData = new ConfirmDialogModel('Attenzione!', message)
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })
  }
  async firmaSelezionati() {
    const arrayId: RefertoDaFirmare[] = []

    // Creo la classe con tutti i referti da firmare
    this.rowChecked.forEach((row) => {
      arrayId.push(
        new RefertoDaFirmare(row.idVisita, row.idDocumentoReferto,false, row.nomeReferto)
      )
    })


    const objPdfFirma = {
      arrayPdf: arrayId,

      isReferto: true,
      title: 'Firma digitale',
      isFirmaDigitale:true  // serve per disabilitare pdf preview
    }

    const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
      data: objPdfFirma,

      panelClass: 'modal-firma-selezionati',
    })

    // vene invocato alla chiusura della modale
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        //reseto la lista di elemensti selezionati
       this.rowChecked= [];

        this.ngOnInit()
      }
    })
  }

  async reInviaRefertiMirth(){
    try {
      this.appGen.loadingPanel.show();
      for await (const row of this.rowChecked) {
        await firstValueFrom(this.visitaServ.sendToMirth(row.idVisita));
      }
      this.appGen.loadingPanel.hide();
    } catch (error) {
      console.error(error);
      this.appGen.loadingPanel.hide();
      this.notificate.error("Errore durante l'invio dei file, riprovare")
    }
  }

  createParams(visita) {
    this.queryParams.page = this.pageSelected

    if (!(visita.idPaziente === null || visita.idPaziente === undefined)) {
      this.queryParams.idPaziente = visita.idPaziente
    }
    //

    if (!(visita.idPrestazione === null || visita.idPrestazione === undefined)) {
      this.queryParams.idVisita = visita.idPrestazione
    }

    this.queryParams.fromStorico = true

    const dataTmp = this.formFiltrivisita.get('dataVisita').value

    if (dataTmp != '') {
      this.queryParams.dataVisita = new Date(dataTmp).toUTCString() // this.appGen.convertUTCDateToLocalDate(dataTmp)
    }

    this.queryParams.fromElencoVisite = true
  }

  async openDocumentList(idVisita, data) {
    const obj = {
      idVisita: idVisita,
    }
    // let res = await this.visiteService.getlistdocumenti(obj);
    const dialogData = new ListaDocumentiDialogModel(
      'Documenti visita ' + new Date(data).toLocaleDateString(),
      obj
    )

    this.dialog.open(ListaDocumentiComponent, {
      data: dialogData,
      panelClass: 'modal-lista-documenti',
    })
  }

  dettaglioPopupVisita(id) {
    this.dialog.open(ModalDettaglioVisitaComponent, {
      data: id,
      panelClass: 'modal-custom',
    })
  }
}
