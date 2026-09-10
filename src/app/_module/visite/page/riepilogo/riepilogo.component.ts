import { Location } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { AngularEditorConfig } from '@kolkov/angular-editor'
import { firstValueFrom } from 'rxjs'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import {
  Permessi,
  Ruoli,
  StatoRichiesta,
  StepVisita,
  TipoAlimentazione,
  TipoPrestazione,
} from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { ReportService } from 'src/app/_core/services/report.service'
import { RequestUpdateService } from 'src/app/_core/services/request-update/request-update.service'
import { IRefertoNomeDTO } from 'src/app/_dtos/in'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
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
import { ModalValiditaPianoTerapeuticoComponent } from 'src/app/shared/modal/modal-validita-piano-terapeutico/modal-validita-piano-terapeutico.component'
import _ from 'underscore'

@Component({
  selector: 'app-riepilogo',
  templateUrl: './riepilogo.component.html',
  styleUrls: ['./riepilogo.component.scss'],
})
export class RiepilogoComponent implements OnInit {
  tipoAlimentazione = TipoAlimentazione
  stepEnum = StepVisita
  step = this.stepEnum.Riepilogo
  isRiepilogoVisita = false
  idpaziente
  isStoricoDettaglio = false
  showPianoTerapeutico = false
  showPrescrizioneSacche = false
  isDomiciliare = false
  idValutazione
  idVisita
  idTipoAlimentazione
  idAmbulatorio
  diagnosiModel
  listaConclusioniPredefinite

  kcalNonVisibili : boolean;
  noteEditabili = false;

  conclusioni: string;

  dataPrestazioneModel
  listaUrgenze
  formRichiesta: FormGroup
  showPrenotaVisita = false
  isDaRefertare = false
  riepilogoVisitaAnamnesi = true
  @Input() fromDomiciliare

  editorConfig
  pdfFile

  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    private backPreviousPage: Location,
    public authGuard: AuthGuard,
    private report: ReportService,
    private documentHttp: DocumentiService,
    private confService: ConfezionamentiService,
    private visitaServ: VisitaRepoService,
    private requestUpdate: RequestUpdateService,
  ) {
    this.conclusioni = this.diagnosiModel;
  }

  ngOnInit() {
    this.editorConfig = this.appGen.editorDefaultConfig()
    this.idpaziente = this.activateRoute.snapshot.paramMap.get('id')

    //** Disabilito la visita  */
    this.requestUpdate.enableVisita(false);

    if (
      !(this.idpaziente == null || this.idpaziente == undefined || this.idpaziente <= 0)
    ) {
      this.isRiepilogoVisita = true
    }

    if (this.isRiepilogoVisita)
      this.activateRoute.queryParams.subscribe(async (params) => {
        if (!this.appGen.isNullOrUndefined(params)) {
          this.idVisita = params.visit

          if (params.showKcal === "true") {
            this.kcalNonVisibili = false;
          } else if(params.showKcal === "false"){
            this.kcalNonVisibili = true;
          }

          if (!this.appGen.isNullOrUndefined(params.fromStorico)) {
            this.isStoricoDettaglio = true
          } else {
            //se non sto guardando lo storico visite, vuol dire che sono nell'ultimo step del riepilogo e allora salvo il file
            // questo deve essere fatto solo quando utente è medico

            //!BUG  this.salvaRefertoServer(); non puo parire quando entro ma sul click del buttone non on init per stato // spostare questo fuori


/** //!TODO: la soluzione parziale del bug #762 ma server rivedere tutta la logica xk dopo questa soluzione non crea piu referti. Problema che la creazione del referti è nel posto sbagliato
 *               // verifica stato visita server per capire se posso creare referto
            const statoVisita = await firstValueFrom(
              this.visitaHttp.getVisitState(this.idVisita)
            )

            //  Posso creare solo il referto solo se non sono dietista e il stato della visita deve essere diverso da stato "Da Refertare"
            if (
              !this.authGuard.canRole(this.appGen.ruolo.Dietista) &&
              statoVisita.idStatoVisita != StatoVisita.DaRefertare
            ) {
              this.salvaRefertoServer()
            }
 *
 *
 */
            if (!this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
              await this.salvaRefertoServer();
            }

            //una volta salvato sul server, se non ho la firma attiva devo già sincronizzare il documento verso l'integrazione se è attiva
            //Nel caso sia attiva anche la firma allora non sincronizzo perchè verrà fatto soltanto dopo che il referto viene firmato digitalmente (all'interno della modale pdf viewer)
            if (
              this.appGen.configLinfa.Sincronizzazione &&
              !this.appGen.configLinfa.FirmaDigitaleAbilitata
            ) {
              this.pdfFile.getBase64(async (blob) => {
                this.sendToIntegrazionePatcher(blob)
              })
            }
          }

          if (!this.appGen.isNullOrUndefined(params.domiciliare)) {
            this.isDomiciliare = true
          }
          this.getAlimentazioneFromVisita(this.idVisita)
          this.checkProdottiExist()

          this.checkVisitaDaRefertare()
          this.getAmbulatorio(this.idVisita)
        }
      })
  }

  selectedConclusionePredefinita(conclusione) {
    this.diagnosiModel = ''

    if (!this.appGen.isNullOrUndefined(conclusione)) {
      this.diagnosiModel = this.diagnosiModel + ' ' + conclusione
    }
  }

  async sendToIntegrazionePatcher(blob) {
    const json = {
      base64Pdf: blob,
      idVisita: this.idVisita,
    }
    await this.service.postCallRequest({
      action: 'sendToIntegrazionePatcher',
      param: json,
    })
  }

  //Mi restituisce se è da refertare o meno
  async checkVisitaDaRefertare() {
    await this.service
      .getCallRequest({ action: 'darefertare', param: this.idVisita })
      .then((data) => {
        this.isDaRefertare = data

        if (this.isDaRefertare) {
          this.editorConfig.editable = true
          this.editorConfig.showToolbar = true
          this.getListConclusioniPredefinite()
        }
      })
  }


  //Controllo se ho degli integratori, se li ho mostro il pulsante stampa piano terapeutico
  async checkProdottiExist() {
    await this.service
      .getCallRequest({ action: 'checkProdottiExist', param: this.idVisita })
      .then((data) => {
        this.showPianoTerapeutico = data.showIntegratori
        this.showPrescrizioneSacche = data.showPrescrizioneSacche
      })
  }

  async getAlimentazioneFromVisita(idVisita) {
    await this.service
      .getCallRequest({ action: 'getAlimentazioneFromVisita', param: idVisita })
      .then((data) => {
        this.idTipoAlimentazione = data
      })
  }
  async getAmbulatorio(idVisita) {
    await this.service
      .getCallRequest({ action: 'getAmbulatorioFromVisita', param: idVisita })
      .then((data) => {
        this.idAmbulatorio = data
      })
  }

  async goToAlimentazione(alimentazione) {
    let obj
    switch (alimentazione) {
      case 'artificiale':
        obj = {
          idvalutazione: this.idValutazione,
          idtipoalimentazione: this.tipoAlimentazione.Artificiale,
        }

        await this.service
          .postCallRequest({ action: 'updt_valutazionenutrizionale', param: obj })
          .then(() => {
            this.router.navigate(['/app/nutrizione/artificiale', this.idpaziente])
          })
        break
      case 'naturale':
        obj = {
          idvalutazione: this.idValutazione,
          idtipoalimentazione: this.tipoAlimentazione.NaturaleMista,
        }

        await this.service
          .postCallRequest({ action: 'updt_valutazionenutrizionale', param: obj })
          .then(() => {
            this.router.navigate(['/app/visite/piani-alimentari/lista', this.idpaziente])
          })
        break
      case 'mista':
        this.router.navigate(['/app/nutrizione/mista', this.idpaziente])
        break
    }
  }

  statusKcal(){
    this.kcalNonVisibili = !this.kcalNonVisibili;
  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idpaziente])
  }

  esci() {
    //
    if (this.isStoricoDettaglio) {
      this.backPreviousPage.back()
    } else {
      //sono nella creazione della visita perciò una volta finito lo mando alla dashboard
      if (this.authGuard.canAccess(Permessi.ModuloDashboard)) {
        this.router.navigate(['/app/dashboard'])
      } else {
        this.router.navigate(['/app/visite'])
      }
    }
  }

  async stampaReport(pdfFile, data) {
    // this.report.open(pdfFile, data.idDocumento)
  }

  async anteprimaReferto() {
    //già filtrato in base al tipo alimentazione, lato server
      const res = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisita));

        const obj = {
          pdfFile: this.report.createReferto(res, false, this.kcalNonVisibili),
          isReferto: true,
          nomeDocumento: res.nomeDocumento,
          idVisita: this.idVisita,
          disableFirmaDigitale:true,
          title: 'Stampa referto',
          allowPrint: true,
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

  }

  async anteprimaAnamnesiAlimentare(){

         //già filtrato in base al tipo alimentazione, lato server
      await this.service.getCallRequest({ action: 'GetAnamnesiAlimentareVisita', param: this.idVisita }).then((res) => {
        let isDietaSettimanale = false
        if (
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana &&
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana?.length > 0
          && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != ""
        ) {
          isDietaSettimanale = true
        }

        const obj = {
          pdfFile: this.report.createAnamnesiAlimentare(res, false,isDietaSettimanale, this.kcalNonVisibili),
          isReferto: false,
          nomeDocumento: 'Anamnesi alimentare',
          title: 'Stampa anamnesi alimentare',
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

  async anteprimaPianoNutrizionale(xInvioMail = false) {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: this.idVisita })
      .then(async (res) => {
        let isDietaSettimanale = false;
        if (res.visita?.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista &&
          !this.appGen.isNullOrUndefined(res.prodotti.prodotti[0].prodotti[0]?.settimana)
        && res.prodotti.prodotti[0].prodotti[0]?.settimana[0].trim() != "" ) {
          isDietaSettimanale = true
        }

        //!verificare pasto

        ///SE È PRESENTE IL CONFEZIONAMENTO VENGONO CALCOLATI I VALORI RELATIVI AI CONFEZIONAMENTI
        ///VIENE FATTO QUI PERCHÈ IMPOSSIBILE FARLO CON IL SERVICE
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
          pdfFile: this.report.createPianoNutrizionale(res, false, isDietaSettimanale, this.kcalNonVisibili),
          isReferto: false,
          nomeDocumento: 'Piano nutrizionale',
          title: 'Stampa piano nutrizionale',
          allowPrint: true,
          xInvioMail : xInvioMail,
          email: xInvioMail && res.paziente.email? res.paziente.email : null,
          nome : res.paziente.nome

        }


        const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })

        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
          }
        })
      })
  }

  async anteprimaSacche() {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'getPrescrizioneSacca', param: this.idVisita })
      .then((res) => {
        const obj = {
          pdfFile: this.report.createPrescrizioneSacche(res),
          isReferto: false,
          title: 'Stampa sacche personalizzate',
          nomeDocumento: 'Prescrizione Sacche',
          allowPrint: true,
        }

        const dialogRef = this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })

        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
          }
        })
      })
  }

  //** Funzione che salva il referto sul server */
  async salvaRefertoServer() {
    // devo richiamare la creazione o modifica nome che mi torna anche id file
    const refertoNome: IRefertoNomeDTO = await firstValueFrom(
      this.documentHttp.createNomeReferto(this.idVisita)
    )

// se ho nome e id file verifico se esiste altrimenti mostro errore che file non puo essere creato
    if (refertoNome && refertoNome.idDocumento) {
      const fileExist: boolean = await firstValueFrom(
        this.documentHttp.checkFileExist(refertoNome.idDocumento)
      )
// file non esiste quindi lo devo fare


      if (!fileExist && !this.authGuard.canRole(Ruoli.Dietista)) {
            const res = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisita));
            this.pdfFile = this.report.createReferto(res, false, this.kcalNonVisibili)
            await this.report.savePDF(this.pdfFile, refertoNome.idDocumento, this.idVisita)
      }
    }else{
      this.appGen.notificate.error("Nome/id documento non trovato");
    }

  }

  async stampaRefertoFarmacia() {
    let integratori
    await this.service
      .getCallRequest({ action: 'getProdottiIntegratori', param: this.idVisita })
      .then((data) => {
        integratori = data
      })

    const dialogRef = this.dialog.open(ModalValiditaPianoTerapeuticoComponent, {
      panelClass: 'modal-custom',
      data: integratori,
    })

    let objRes

    dialogRef.componentInstance.validitaEmit.subscribe((data) => {
      objRes = data
    })

    dialogRef.afterClosed().subscribe(
      await ((dialogResult) => {
        if (dialogResult) {
          //
          const obj = {
            dataProssimaPrescrizione: objRes.dataProssimaPrescrizione,
            ambulatorio: objRes.ambulatorio,
            idVisita: this.idVisita,
            validita: objRes.validita,
            confezioniIntegratori: objRes.integratori,
          }
          this.service
            .postCallRequest({ action: 'GetPianoTerapeutico', param: obj })
            .then((data) => {
              this.report.createRefertoPianoTerapeutico(data)
            })
        }
      })
    )
  }

  async getpdf(namePDF) {
    await this.service.getpdf(namePDF)
  }

  prenotaVisita(el) {
    this.showPrenotaVisita = !this.showPrenotaVisita
    if (this.showPrenotaVisita) {
      this.appGen.scroll(el)
    }

    const now = new Date()
    const mins = now.getMinutes()
    const quarterHours = Math.ceil(mins / 15)
    if (quarterHours == 4) {
      now.setHours(now.getHours() + 1)
    }
    const rounded = (quarterHours * 15) % 60
    now.setSeconds(0)
    now.setMinutes(rounded)

    this.formRichiesta = this.formBuilder.group({
      motivoRichiesta: new FormControl('Controllo', Validators.required),
      dataPrestazione: new FormControl(''),
      priorita: new FormControl(''),
    })

    this.getListaUrgenze()
  }
  async getListaUrgenze() {
    await this.service.getCallRequest({ action: 'priorita' }).then((data) => {
      this.listaUrgenze = data
      this.formRichiesta.get('priorita').setValue(data[0].id)
    })
  }
  async confermaPrenotazione() {
    if (!this.formRichiesta.valid) {
      this.appGen.validateAllFormFields(this.formRichiesta)
      return
    }

    const Richiesta = {
      IdTipoRichiesta: 4, //accettazione diretta
      MotivoRichiesta: this.formRichiesta.get('motivoRichiesta').value,
      DataPrestazione: this.formRichiesta.get('dataPrestazione').value, // this.appGen.convertUTCDateToLocalDate(dataPrestazioneTmp),
      IdTipoPrestazione: TipoPrestazione.VisitaControllo, //visita controllo
      IdStatoRichiesta: StatoRichiesta.Accettata,
      IdAmbulatorio: this.idAmbulatorio,
    }

    const obj = {
      Richiesta,
      IdVisitaCorrente: this.idVisita,
      IdPaziente: this.idpaziente,
    }
    await this.service
      .postCallRequest({ action: 'inserimentorichiesta', param: obj })
      .then(() => {
        this.showPrenotaVisita = !this.showPrenotaVisita
      })
  }

  closePrenotaControllo() {
    this.showPrenotaVisita = false
  }

  async salvaDiagnosi() {
    const dialogData = new ConfirmDialogModel(
      'Attenzione!',
      'Sei sicuro di voler salvare e refertare la visita?'
    )
    const dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe(
      await (async (dialogResult) => {
        if (dialogResult) {
          const obj = {
            idVisita: this.idVisita,
            diagnosi: this.diagnosiModel,
            tipoAlimentazione: this.idTipoAlimentazione,
          }
          await this.service
            .postCallRequest({ action: 'refertaVisita', param: obj })
            .then(() => {
              this.isDaRefertare = false
            })
        }
      })
    )
  }

  async getListConclusioniPredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'conclusioni' })
      .then((data) => {
        this.listaConclusioniPredefinite = data
      })
  }

  async openDocumentList() {
    const obj = {
      idVisita: this.idVisita,
    }

    const dialogData = new ListaDocumentiDialogModel('Documenti visita', obj)

    this.dialog.open(ListaDocumentiComponent, {
      data: dialogData,
      panelClass: 'modal-lista-documenti',
    })
  }
}
