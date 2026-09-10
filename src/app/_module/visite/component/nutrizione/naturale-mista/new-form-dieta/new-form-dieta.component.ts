import { Location } from '@angular/common'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast'
import { AfterViewInit, Component, Input, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatCheckboxChange } from '@angular/material/checkbox'
import { MatDialog } from '@angular/material/dialog'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute, Router } from '@angular/router'
import {
  ReplaySubject,
  Subject,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  takeUntil,
} from 'rxjs'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import {
  Giorno,
  Pasto,
  PastoString,
  StepVisita,
  TipoAlimentazione,
  TipoProdotto,
} from 'src/app/_core/helpers/enums'
import {
  AppGeneralService,
  ITipiVisualizzazioneDieta,
} from 'src/app/_core/services/app-general.service'
import { DietaService } from 'src/app/_core/services/dieta.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { FiltroProdottiService } from 'src/app/_core/services/prodotti.service'
import { ReportService } from 'src/app/_core/services/report.service'
import {
  IBoxInfoParamsToDTO,
  ProdottiAnamnesiToDTO,
  ProdottiPianoToDTO,
  ProdottoPrincipaleToDTO,
} from 'src/app/_dtos/out'
import { BoxPaziente, MacroPrecompiled } from 'src/app/_models/paziente'
import {
  Dieta,
  OggettoDieta,
  PastoClass,
  ProdottiAnamnesi,
  ProdottiPiano,
  ProdottoAlternativo,
  ProdottoDettaglio,
  ProdottoEasy,
  Settimana,
} from 'src/app/_models/prodotti'
import { SalvaDietaRequest } from 'src/app/_module/visite/_dto-visite/dto-visite'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import { ProdottiService } from 'src/app/_repositories/prodotti_repo.service'
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service'
import {
  ConfirmDialogModel,
  ModalConfirmComponent,
} from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import Swal from 'sweetalert2'
import { __values } from 'tslib'
import _ from 'underscore'

import { ModalAnteprimaComponent } from '../../modal-anteprima/modal-anteprima.component'

@Component({
  selector: 'app-new-form-dieta',
  templateUrl: './new-form-dieta.component.html',
  styleUrls: ['./new-form-dieta.component.scss'],
})
export class NewFormDietaComponent implements OnInit, AfterViewInit {
  Title: string = 'Dieta'

  ///BOOLEAN
  divisioneXPasti: boolean = false
  dietaSettimanale: boolean = false
  visualizzazioneTabelle: boolean = false

  aggiuntaProdotto: boolean = false
  panelOpenState = false
  isDettaglioDieta = false
  getFromAnamnesi = false
  isStepAnamnesi = false
  isStepPianoNutrizionale = false
  isDietaXpaziente = false
  nutrizioneEsistente = false
  isNuovaDietaPredefinita = false
  isDettaglioPianoNutrizionale = false
  editProdotti = true
  kcalNonVisibili = false
  isPianoNutrizionalevisita = false

  @Input() isRiepilogo = false
  @Input() isEdit = false
  @Input() isDaRefertare = false
  @Input() isAnteprima = false
  @Input() isRiepilogoVisita = false
  @Input() riepilogoVisitaAnamnesi = false
  @Input() riepilogoVisitaPianoNutr = false
  @Input() stepCorrente
  @Input() fromListaDiete = false
  @Input() fromPianoAlimentare = false
  @Input() fromAnamnesi = false
  @Input() dataPianoNutrizionale
  @Input() idPazienteAnteprima

  //id
  idVisita = null
  idDieta = null
  idValutazione
  idPianoNutrizionale

  proprietaDieta: Dieta
  proprietaAnamnesi: any
  stepVisita = StepVisita
  idPaziente = null

  salvato = false
  anamnesiVisitaPrecedente = false
  //Serve quando si crea la dieta predefinita
  creatoDaUtenteLoggato = false
  pianoAlimentarePrecedente = false
  params
  titleNote: string = 'Note'
  editorConfig

  datiPaziente: BoxPaziente

  //Dati nutrizione precompiled
  nutrizione: MacroPrecompiled

  //NUMBER
  kcalTotali: number = 0
  proteineTotali: number = 0
  azotoTotale: number = 0
  carboidratiTotali: number = 0
  lipidiTotali: number = 0
  apportoIdrico: number = 0

  kcalDaAssumere: number = 2000
  minLength = 2

  ///CONTROL
  divisioneXPastoForm: FormControl = new FormControl(this.divisioneXPasti)
  dietaSettimanaleForm: FormControl = new FormControl(this.dietaSettimanale)
  visualizzazioneTabelleForm: FormControl = new FormControl(this.visualizzazioneTabelle)
  visualizzazioneProdotti: FormControl = new FormControl(1)
  public filtroProdotti: FormControl = new FormControl(
    null,
    Validators.minLength(this.minLength)
  )

  public filtroLiquidi: FormControl = new FormControl(
    null,
    Validators.minLength(this.minLength)
  )

  public filtroIntegratori: FormControl = new FormControl(
    null,
    Validators.minLength(this.minLength)
  )

  config: ITipiVisualizzazioneDieta
  configCall = null

  protected _onDestroy = new Subject<void>()
  public prodottiFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public liquidiFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public integratoriFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  nomeDieta: FormControl = new FormControl('')
  bkp = 0

  formNoteConclusioni: FormGroup = new FormGroup({
    note: new FormControl(''),
    noteDietista: new FormControl({
      value: '',
      disabled: !this.editProdotti || !this.authGuard.canRole(this.appGen.ruolo.Dietista),
    }),
    conclusioni: new FormControl(
      {
        value: '',
        disabled:
          this.isEdit ||
          this.editProdotti ||
          !this.authGuard.canRole(this.appGen.ruolo.Medico),
      },
      this.isStepPianoNutrizionale &&
      this.authGuard.canRole(this.appGen.ruolo.Medico) &&
      this.isDietaXpaziente
        ? Validators.required
        : null
    ),
    //Array conclusioni
    conclusioniPredefinite: new FormControl(''),
    //Anamnesi
    diagnosiNutrizionale: new FormControl(''),
  })

  formMacro: FormGroup = new FormGroup({
    kcal: new FormControl({ value: '', disabled: this.isRiepilogo }),
    proteine: new FormControl({ value: '', disabled: this.isRiepilogo }),
    azoto: new FormControl({ value: '', disabled: this.isRiepilogo }),
    carboidrati: new FormControl({ value: '', disabled: this.isRiepilogo }),
    lipidi: new FormControl({ value: '', disabled: this.isRiepilogo }),
    apportoIdrico: new FormControl({ value: '', disabled: this.isRiepilogo }),
  })

  ///ARRAY
  listaConclusioniPredefinite = []
  listaProdotti: ProdottoEasy[] = []
  listaProdottiSelezionati: ProdottoDettaglio[] = []
  listaLiquidi: ProdottoEasy[] = []
  listaIntegratori: ProdottoEasy[] = []
  prodottiSelezionatiNonCorrettamente: ProdottoDettaglio[] = []
  listaPastiString = PastoString
  listaPasti: PastoClass[] = [
    {
      nome: PastoString.Colazione,
      expanded: false,
      id: Pasto.Colazione,
      kcal: 0,
    },
    {
      nome: PastoString.Spuntino,
      expanded: false,
      id: Pasto.Spuntino,
      kcal: 0,
    },
    {
      nome: PastoString.Pranzo,
      expanded: false,
      id: Pasto.Pranzo,
      kcal: 0,
    },
    {
      nome: PastoString.Merenda,
      expanded: false,
      id: Pasto.Merenda,
      kcal: 0,
    },
    {
      nome: PastoString.Cena,
      expanded: false,
      id: Pasto.Cena,
      kcal: 0,
    },
    {
      nome: PastoString.SpuntinoSerale,
      expanded: false,
      id: Pasto.SpuntinoSerale,
      kcal: 0,
    },
    {
      nome: PastoString.Integratori,
      expanded: false,
      id: Pasto.Integratori,
      kcal: 0,
    },
    {
      nome: PastoString.LiquidiAssunti,
      expanded: false,
      id: Pasto.LiquidiAssunti,
      kcal: 0,
    },
  ]

  listaGiorni = [
    {
      giorno: 'Lunedì',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Lunedi,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
    {
      giorno: 'Martedì',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Martedi,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
    {
      giorno: 'Mercoledì',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Mercoledi,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
    {
      giorno: 'Giovedì',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Giovedi,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
    {
      giorno: 'Venerdì',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Venerdi,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
    {
      giorno: 'Sabato',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Sabato,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
    {
      giorno: 'Domenica',
      kcalGiornaliere: 0,
      proteineGiornaliere: 0,
      carboidratiGiornalieri : 0,
      apportoIdricoGiornaliero: 0,
      lipidiGiornalieri: 0,
      id: Giorno.Domenica,
      kcalDaAssumere: this.kcalDaAssumere,
      pasti: this.listaPasti.map((x) => {
        return { ...x }
      }),
    },
  ]

  listaNotePredefinite = []

  constructor(
    public appGen: AppGeneralService,
    private prodService: ProdottiService,
    private filtroProdServ: FiltroProdottiService,
    private visitaServ: VisitaRepoService,
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private notificate: SnackBarService,
    private dietaService: DietaService,
    private router: Router,
    private backPreviousPage: Location,
    public authGuard: AuthGuard,
    private dialog: MatDialog,
    private service: HttpSharedService,
    private pazienteHttp: PazienteService,
    private report: ReportService,
    private confService: ConfezionamentiService,
    private activatedRoute: ActivatedRoute,
    private documentHttp: DocumentiService,

  ) {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')
    this.activateRoute.queryParams.subscribe(async (params) => {
      this.idVisita = params.visit
      //sono nello step della compilazione dieta, scelgo da dove importare nel caso in cui ho compilato in visite precedenti una dieta o nell'anamensi della visita
    })
  }

  async ngOnInit() {
    await this.setConfig()
    this.getAllProdotti()
    this.setFiltriSelect()
    this.verificaStepCorrente();
    this.verificaUtente()
    this.getListaNotePredefinite()
    this.getListConclusioniPredefinite()
    this.visualizzazioneProdotti.setValue(1)
    this.editorConfig = this.appGen.editorDefaultConfig();
    this.getNutrizionePrecompiled();
  }

  ngAfterViewInit(): void {}

  setConfig() {
    this.appGen.loadingPanel.show()
    this.configCall = setInterval(() => {
      if (
        !this.appGen.isNullOrUndefined(this.appGen.configLinfa.TipiVisualizzazioneDieta)
      ) {
        this.config = this.appGen.configLinfa.TipiVisualizzazioneDieta
        this.stopSetConfig()
        if (!this.config.settimanale.abilitato) {
          this.dietaSettimanaleForm.disable()
        }
        if (!this.config.xPasti.abilitato) {
          this.divisioneXPastoForm.disable()
        }
        if (!this.config.tabelle.abilitato) {
          this.visualizzazioneTabelleForm.disable()
        }

        if (
          this.config.settimanale.abilitato === true &&
          this.config.settimanale.default === true
        ) {
          this.dietaSettimanale = true
        }

        if (
          this.config.xPasti.abilitato === true &&
          this.config.xPasti.default === true
        ) {
          this.divisioneXPasti = true
        }

        if (
          this.config.tabelle.abilitato === true &&
          this.config.tabelle.default === true
        ) {
          this.visualizzazioneTabelle = true
        }

        this.appGen.loadingPanel.hide()
      }
    }, 100)
  }

  stopSetConfig() {
    if (this.configCall) {
      clearInterval(this.configCall)
    }
  }

  setNewValoreOttimale(event: any) {
    this.bkp = event
  }

  async getDatiPaziente() {
    try {
      if (this.idPaziente && this.idVisita) {
        const _obj: IBoxInfoParamsToDTO = {
          idPaziente: this.idPaziente,
          idVisita: this.idVisita,
        }
        this.datiPaziente = await firstValueFrom(
          this.pazienteHttp.getBoxInfoPaziente(_obj)
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  async getNutrizionePrecompiled() {
    try {
      if (
        this.idVisita &&
        this.isDietaXpaziente &&
        !this.isStepAnamnesi &&
        !this.riepilogoVisitaAnamnesi &&
        !this.fromAnamnesi
      ) {
        this.nutrizione = await firstValueFrom(
          this.visitaServ.getNutrizionePrecompiled(this.idVisita)
        )

        this.nutrizione.protMin = Math.round(this.nutrizione.protMin)
        this.nutrizione.protMax = Math.round(this.nutrizione.protMax)
        this.nutrizione.proteine = Math.round(this.nutrizione.proteine)
        this.nutrizione.azotoMax = Math.round(this.nutrizione.azotoMax)
        this.nutrizione.azotoMin = Math.round(this.nutrizione.azotoMin)
        this.nutrizione.kcalMax = Math.round(this.nutrizione.kcalMax)
        this.nutrizione.kcalMin = Math.round(this.nutrizione.kcalMin)
        this.nutrizione.kcal = Math.round(this.nutrizione.kcal)
        this.nutrizione.carboidratiMax = Math.round(this.nutrizione.carboidratiMax)
        this.nutrizione.carboidratiMin = Math.round(this.nutrizione.carboidratiMin)
        this.nutrizione.carboidrati = Math.round(this.nutrizione.carboidrati)
        this.nutrizione.lipidiMax = Math.round(this.nutrizione.lipidiMax)
        this.nutrizione.lipidiMin = Math.round(this.nutrizione.lipidiMin)
        this.nutrizione.lipidi = Math.round(this.nutrizione.lipidi)

        this.formMacro.controls.kcal.setValue(this.nutrizione.kcal)
        this.formMacro.controls.proteine.setValue(this.nutrizione.proteine)
        this.formMacro.controls.azoto.setValue(this.nutrizione.azoto)
        this.formMacro.controls.carboidrati.setValue(this.nutrizione.carboidrati)
        this.formMacro.controls.lipidi.setValue(this.nutrizione.lipidi)
        this.formMacro.controls.apportoIdrico.setValue(this.nutrizione.apportoIdrico)
      }
    } catch (error) {
      console.error(error);
    }

  }

  verificaStepCorrente() {
    this.activateRoute.queryParams.subscribe(async (params) => {
      this.params = params
      let path = this.router.url

      let sceltoDaListaXPianoNutr = params.fromList ? params.fromList : false
      let newPianoVisita = false
      if (this.stepCorrente == this.stepVisita.AnamnesiAlimentare) {
        this.isStepAnamnesi = true
        if (this.isStepAnamnesi) {
          this.checkLastPianoAnamnesiExist()
          this.getDettaglioAnamnesi()
        }
      }

      if (path.includes('visite/piani-nutrizionali')) {
        this.idPaziente = params.patient
        this.editProdotti = params.edit == 'false' ? false : true
        if (!this.editProdotti) {
          this.formNoteConclusioni.disable()
          this.getPianoNutrizionalePrescritto(this.dataPianoNutrizionale)
          return
        }
      }else{
        this.activateRoute.params.subscribe((value) =>{
          this.idPaziente = value.id;
        });
      }

      if (this.isRiepilogoVisita && this.riepilogoVisitaAnamnesi) {
        this.getDettaglioAnamnesi()
        this.formNoteConclusioni.disable()
        this.formMacro.disable()
        this.isRiepilogo = true
      }

      if (
        this.isRiepilogoVisita &&
        this.riepilogoVisitaPianoNutr &&
        !this.fromListaDiete
      ) {
        this.getDettaglioPianoNutrizionale()
        this.formNoteConclusioni.disable()
        this.formMacro.disable()
        this.isRiepilogo = true
      }

      //nel caso in cui sono nella visita ho già magari creato un piano alimentare, ma torno indietro nella lista e clicco su nuovo
      if (!this.appGen.isNullOrUndefined(params.new)) {
        newPianoVisita = params.new && params.new == 'true' ? true : false
      }

      //dettaglio dieta
      if (!this.appGen.isNullOrUndefined(params.detail)) {
        this.idDieta = params.detail
        this.isDettaglioDieta = true
      }


      if (
        !this.appGen.isNullOrUndefined(params.vnutr) &&
        params.anamnesi === 'true' &&
        !this.appGen.isNullOrUndefined(params.visit)
      ) {
        this.getFromAnamnesi = true
        this.isStepPianoNutrizionale = true
        this.checkLastPianoAnamnesiExist()
        this.isDietaXpaziente = true
        this.getDettaglioAnamnesi(true)

        if (
          this.isStepPianoNutrizionale &&
          this.authGuard.canRole(this.appGen.ruolo.Medico) &&
          this.isDietaXpaziente
        ) {
          this.formNoteConclusioni.get('conclusioni').enable()
          this.formNoteConclusioni.get('conclusioni').setValidators(Validators.required)
          this.formNoteConclusioni.updateValueAndValidity()
        }
      }

      if (!this.appGen.isNullOrUndefined(params.visit)) {
        this.isDietaXpaziente = true

        if (!this.appGen.isNullOrUndefined(params.vnutr)) {
          this.idValutazione = params.vnutr
          this.isStepPianoNutrizionale = true
          this.checkLastPianoAnamnesiExist()
          if (
            this.isStepPianoNutrizionale &&
            !this.fromListaDiete &&
            !sceltoDaListaXPianoNutr &&
            !newPianoVisita &&
            !this.getFromAnamnesi
          ) {
            this.getDettaglioPianoNutrizionale()
          }
        }
      }

      if (
        !this.appGen.isNullOrUndefined(this.dataPianoNutrizionale) &&
        !this.getFromAnamnesi &&
        !this.fromListaDiete
      ) {
        this.isStepPianoNutrizionale = true
        this.checkLastPianoAnamnesiExist()
        if (this.isStepPianoNutrizionale) {
          this.getDettaglioPianoNutrizionale()
        }

        this.editProdotti = params.edit == 'false' ? false : true
      }

      if (this.fromListaDiete || this.getFromAnamnesi) {
        if (this.fromListaDiete) {
          this.editProdotti = false
        }
      } else {
        if (this.isAnteprima) {
          this.getAnteprima()
        } else {
          if (
            this.isDettaglioDieta &&
            !this.getFromAnamnesi &&
            !this.nutrizioneEsistente &&
            !this.appGen.isNullOrUndefined(this.idDieta)
          ) {
            //alert(27)
            this.getDieta()
          }
          //Sono nella dieta predefinita  NUOVA
          if (
            !this.isDietaXpaziente &&
            !this.isStepAnamnesi &&
            !this.idDieta &&
            this.appGen.isNullOrUndefined(params.visit)
          ) {
            this.stepCorrente = this.stepVisita.Predefinita
            this.isNuovaDietaPredefinita = true
            this.Title = 'Nuova dieta predefinita'
            this.nomeDieta.setValidators(Validators.required)
            this.nomeDieta.updateValueAndValidity()
          } else if (
            !this.isDietaXpaziente &&
            !this.isStepAnamnesi &&
            this.idDieta &&
            this.appGen.isNullOrUndefined(params.visit)
          ) {
            //Sono nella dieta predefinita già esistente
            this.stepCorrente = this.stepVisita.Predefinita
            this.isNuovaDietaPredefinita = false
            //alert(29)
            this.getDieta()
          }
        }
      }
    })
  }

  /**Controllo se prima di questa visita è presente un'altra visita e nel caso controllo se ci sono l'anamnesi e/o la nutrizione naturale compilata */
  async checkLastPianoAnamnesiExist() {
    const obj = {
      idPaziente: this.idPaziente,
    }
    await this.service
      .postCallRequest({ action: 'checkLastPianoAnamnesiExist', param: obj })
      .then((data) => {
        this.anamnesiVisitaPrecedente = data.anamnesiExist
        this.pianoAlimentarePrecedente = data.pianoAlimentare
      })
  }

  /**
   * Apre la modale che chiede se si vuole importare la anamnesi dalla dieta precedente
   * se confermato la riporta
   */
  async importaAnamnesiVisitaPrecedente() {
    const message = `Vuoi riportare l'anamnesi della visita precedente?`
    const obj = {
      message,
      idPazienteAnteprima: this.idPaziente,
      idPaziente : this.idPaziente,
      fromAnamnesi: true,
    }

    const dialogRef = this.dialog.open(ModalAnteprimaComponent, {
      data: obj,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        try {
          this.appGen.loadingPanel.show()
          this.listaProdottiSelezionati = await firstValueFrom(
            this.visitaServ.getAnamnesiAlimentarePrecedente(this.idPaziente)
          )
          this.setProprietaDieta();
          this.autoExpandAndCalculateProperties()
          this.anamnesiVisitaPrecedente = false
          this.salvato = false
          this.appGen.loadingPanel.hide()
        } catch (error) {
          this.appGen.loadingPanel.hide()
          this.notificate.error(
            "Errore durante l'import dell'Anamnesi precedente, riprovare"
          )
          console.error(error)
        }
      }
    })
  }

    /**
   * Apre la modale che chiede se si vuole importare IL PIANO NUTR. dalla dieta precedente
   * se confermato la riporta
   */
    async importaPianoVisitaPrecedente() {
      const message = `Vuoi riportare il piano nutrizionale della visita precedente?`
      const obj = {
        message,
        idPazienteAnteprima: this.idPaziente,
        idPaziente : this.idPaziente,
        fromPianoAlimentare : true,
      }

      const dialogRef = this.dialog.open(ModalAnteprimaComponent, {
        data: obj,
        panelClass: 'modal-custom',
      })

      dialogRef.afterClosed().subscribe(async (dialogResult) => {
        if (dialogResult) {
          try {
            this.appGen.loadingPanel.show()
            let res = await firstValueFrom(
              this.visitaServ.getPianoNutrizionalePrecedente(this.idPaziente)
            )
            this.listaProdottiSelezionati = res.prodotti;
            this.setProprietaDieta();
            this.autoExpandAndCalculateProperties()
            this.pianoAlimentarePrecedente = false
            this.salvato = false
            this.appGen.loadingPanel.hide()
          } catch (error) {
            this.appGen.loadingPanel.hide()
            this.notificate.error(
              "Errore durante l'import dell'Anamnesi precedente, riprovare"
            )
            console.error(error)
          }
        }
      })
    }


    async getAnteprima(){
      try {
        if (this.fromPianoAlimentare) {
          const data = await firstValueFrom(
          this.visitaServ.getPianoNutrizionalePrecedente(this.idPazienteAnteprima, true));
          this.listaProdottiSelezionati = data.prodotti;
          this.autoExpandAndCalculateProperties();
      }
      if (this.fromAnamnesi){
        this.listaProdottiSelezionati = await firstValueFrom(
          this.visitaServ.getAnamnesiAlimentarePrecedente(this.idPazienteAnteprima, true)
        )
        this.autoExpandAndCalculateProperties();
      }
      } catch (error) {
        console.error(error);
      }
    }
  async getListConclusioniPredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'conclusioni' })
      .then((data) => {
        this.listaConclusioniPredefinite = data
      })
  }

  /**
   * Verifica se l'utente sia medico o dietista
   */
  verificaUtente() {
    if (!this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.formNoteConclusioni.controls.noteDietista.disable()
    }
    this.checkNoteEsistenti()
  }

  /**
   * Controlla se ci sono note e note dietista
   */
  async checkNoteEsistenti() {
    try {
      if (
        !this.isStepAnamnesi &&
        !this.isAnteprima &&
        !this.isDettaglioPianoNutrizionale &&
        this.isDietaXpaziente
      ) {
        const noteDietista = await firstValueFrom(
          this.visitaServ.checkNoteDietistaCompilate(this.idVisita)
        )
        this.formNoteConclusioni.get('noteDietista').setValue(noteDietista)
      }
    } catch (error) {
      this.appGen.notificate.error(
        'È stato riscontrato un problema durante il recupero delle note del dietista'
      )
    }
  }

  /**
   * Funzione che richiama la anamnesi alimentare se stata inserita
   */
  async getDettaglioAnamnesi(fromAnamnesi = false) {
    try {
      if (
        !this.appGen.isNullOrUndefined(this.idVisita) &&
        !this.appGen.isNullOrUndefined(this.idPaziente)
      ) {
        this.appGen.loadingPanel.show()
        await this.getDatiPaziente()
        if (fromAnamnesi === true) {
          this.Title = 'Piano nutrizionale ' + this.datiPaziente.paziente
        } else {
          this.Title = 'Anamnesi alimentare ' + this.datiPaziente?.paziente
        }

        const disabilita: boolean =
          this.isRiepilogo || this.isRiepilogoVisita ? true : false

        const obj = await firstValueFrom(
          this.visitaServ.getDettaglioAnamnesi(this.idVisita, disabilita)
        )

        if (!this.appGen.isNullOrUndefined(obj)) {
          this.listaProdottiSelezionati = obj.prodotti
          this.proprietaAnamnesi = obj.anamnesi ? obj.anamnesi : null

          this.formNoteConclusioni.controls.diagnosiNutrizionale.setValue(
            this.proprietaAnamnesi?.diagnosiNutrizionale
          )

          this.formNoteConclusioni.controls.note.setValue(this.proprietaAnamnesi?.note)

          setTimeout(() => {
            if (this.listaProdottiSelezionati?.length > 0 && this.divisioneXPasti) {
              this.setProprietaDieta();
              this.autoExpandAndCalculateProperties()
            }
          }, 200)
        }

        this.appGen.loadingPanel.hide()
      }
    } catch (error) {
      console.error(error)
      this.appGen.loadingPanel.hide()
      this.notificate.error('Errore durante il recupero della dieta, riprovare')
    }
  }

  async getDettaglioPianoNutrizionale() {
    try {
      if (
        !this.appGen.isNullOrUndefined(this.idVisita) &&
        !this.appGen.isNullOrUndefined(this.idPaziente) &&
        (!this.appGen.isNullOrUndefined(this.idValutazione) ||
          this.riepilogoVisitaPianoNutr)
      ) {
        this.appGen.loadingPanel.show()
        await this.getDatiPaziente()
        this.Title = 'Piano nutrizionale ' + this.datiPaziente.paziente
        let obj = {
          getVisitaPadre: false,
          idVisita: this.idVisita,
        }
        const disabilita: boolean =
          this.isRiepilogo || this.isRiepilogoVisita ? true : false

        const result = await firstValueFrom(
          this.dietaService.getVisitaNaturalePaziente(obj, disabilita)
        )

        this.listaProdottiSelezionati = result.prodotti
        this.formNoteConclusioni.controls.conclusioni.setValue(result.diagnosi)
        this.formNoteConclusioni.controls.note.setValue(result.notePianoNutrizionale)

        if (this.listaProdottiSelezionati?.length > 0 && this.divisioneXPasti) {
          setTimeout(() => {
            if (this.listaProdottiSelezionati?.length > 0 && this.divisioneXPasti) {
              this.setProprietaDieta();
              this.autoExpandAndCalculateProperties()
            }
          }, 200)
        }
      }
      this.appGen.loadingPanel.hide()
    } catch (error) {
      console.error(error)
      this.appGen.loadingPanel.hide()
      this.notificate.error('Errore durante il recupero della dieta, riprovare')
    }
  }

  /**
   * Get dieta predefinita se esistente
   */
  async getDieta() {
    try {
      let response = await firstValueFrom(
        this.dietaService.getDietaPredefinita(this.idDieta)
      )
      this.listaProdottiSelezionati = response.prodotti
      this.proprietaDieta = response.dieta
      if (this.proprietaDieta.id) {
        this.Title = 'Modifica dieta ' + this.proprietaDieta.dieta
        this.creatoDaUtenteLoggato = this.proprietaDieta.creatoDaUtenteLoggato
        if (this.proprietaDieta.creatoDaUtenteLoggato) {
          this.nomeDieta.setValue(this.proprietaDieta.dieta)
          this.nomeDieta.disable()
        } else {
          this.nomeDieta.setValidators(Validators.required)
          this.Title = 'Nuova dieta partendo da ' + this.proprietaDieta.dieta
        }
      }

      ///Se ho idPaziente e idVisita allora sono nella visita e devo cambiare il titolo
      if (
        !this.appGen.isNullOrUndefined(this.idPaziente) &&
        !this.appGen.isNullOrUndefined(this.idVisita) &&
        !this.isStepAnamnesi
      ) {
        await this.getDatiPaziente()
        this.Title = 'Piano nutrizionale ' + this.datiPaziente.paziente
      }
      if (this.listaProdottiSelezionati?.length > 0 && this.divisioneXPasti) {
       this.setProprietaDieta();
        this.autoExpandAndCalculateProperties()
      }
    } catch (error) {
      console.error(error)
    }
  }

  async getPianoNutrizionalePrescritto(data) {
    if (data) {
      this.isPianoNutrizionalevisita = true
      let nameSurname =
        data.pianoNutrizionale.idPazienteNavigation?.idPersonaNavigation?.nome +
        ' ' +
        data.pianoNutrizionale.idPazienteNavigation?.idPersonaNavigation?.cognome

      this.Title = 'Piano nutrizionale' + ' ' + nameSurname
      const productArray: ProdottoDettaglio[] = []
      const array = data.categorie?.prodotti
      for (const pasto of array) {
        pasto?.prodotti.forEach((element) => {
          productArray.push(new ProdottoDettaglio(element, true))
        })
      }
      this.listaProdottiSelezionati = productArray
      if (this.listaProdottiSelezionati.length > 0) {
        this.setProprietaDieta();
        this.autoExpandAndCalculateProperties();

      }

      this.checkNoteEsistenti()
    }
  }

  setProprietaDieta(){
    if (
      this.listaProdottiSelezionati[0].pasto &&
      this.listaProdottiSelezionati[0].pasto.id !== Pasto.DietaUnica &&
      this.config.xPasti.abilitato === true
    ) {
      this.divisioneXPasti = true
    } else {
      this.divisioneXPasti = false
    }
    let weekArray = Object.values(this.listaProdottiSelezionati[0].settimana)
    let obj: boolean = _.every(weekArray, function (x) {
      return x === false
    })
    //Se obj === true allora non è stato inserito nessun giorno e quindi la dieta non è settimanale
    if (obj === false && this.config.settimanale.abilitato === true) {
      this.dietaSettimanale = true
    } else {
      this.dietaSettimanale = false
    }
  }

  /**
   * Calcola le proprietà totali e espande automaticamente i pasti dove è presente il prodotto
   */
  autoExpandAndCalculateProperties() {
    /**
     * Se il pasto non è vuoto allora lo espando (mat-expansion-panel) e faccio vedere cosa contiene
     */
    if (this.divisioneXPasti === true) {
      for (const prodotto of this.listaProdottiSelezionati) {
        let pasto = _.findWhere(this.listaPasti, { id: prodotto.pasto.id })
        pasto.expanded = true
      }
    }

    /**
     * Esegue il calcolo delle kcal della anamnesi alimentare
     */
    if (this.listaProdottiSelezionati.length > 0) {
      this.calcolaKcalTotali()
      this.calcolaTotaliproprieta()
      if (this.dietaSettimanale && !this.divisioneXPasti) {
        this.calcolaKcalXGiorno()
      } else if (this.divisioneXPasti && !this.dietaSettimanale) {
        this.calcolaKcalXPasti()
      } else if (this.divisioneXPasti && this.dietaSettimanale) {
        this.calcolaKcalXGiorno()
        this.calcolaKcalXGiornoXPasto()
      }
    }
  }

  backToPrevious() {
    try {
      if (this.isDietaXpaziente) {
        Swal.fire({
          title: 'Attenzione',
          html: 'Tornando indietro il piano nutrizionale configurato sarà cancellato.<br> Vuoi proseguire?',
          icon: 'warning',
          showCancelButton: true,
          // confirmButtonColor: '#3085d6',
          // cancelButtonColor: '#d33',
          cancelButtonText: 'No',
          confirmButtonText: 'Si',
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.appGen.loadingPanel.show()
            //cancello i prodotti gia selezionati per non avere il problema con i vecchi se rimangono , solo qundo torno in dietro
            const _result: boolean = await firstValueFrom(
              this.prodService.deletePianoNelVisitaNaturale(this.idVisita)
            )

            this.router.navigate(
              ['/app/visite/step/piani-alimentari/lista', this.idPaziente],
              { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } }
            )
            // this.editProdotti=true;
            this.appGen.loadingPanel.hide()
          }
        })
      } else {
        this.backPreviousPage.back()
      }
    } catch (error) {
      console.error(error)
    }
  }

  statusEditNomeDieta() {
    this.nomeDieta.enable()
  }

  /**
   * CALCOLA LE KCAL TOTALI ASSUNTE INDIPENDENTEMENTE DA QUALE DIETA SI STIA FACENDO
   */
  calcolaKcalTotali() {
    this.kcalTotali = 0;
    for (const prodotto of this.listaProdottiSelezionati) {
      this.kcalTotali = this.kcalTotali + prodotto.kcalCalcolate
    }
  }

  /**
   * CALCOLA LE KCAL PER OGNI PASTO, ATTIVA SOLO SE SI USA IL TOGGLE DELLA DIETA PER PASTI
   */
  calcolaKcalXPasti() {
    for (const pasto of this.listaPasti) {
      pasto.kcal = 0
      for (const prodotto of this.listaProdottiSelezionati) {
        if (prodotto.pasto?.id === pasto.id) {
          pasto.kcal = pasto.kcal + prodotto.kcalCalcolate
        }
      }
    }
  }

  /**
   * CALCOLA LE KCAL PER OGNI GIORNO, ATTIVA SOLO SE SI USA IL TOGGLE DELLA DIETA SETTIMANALE
   */
  calcolaKcalXGiorno() {
    //#region totali
    this.kcalTotali = 0;
    this.carboidratiTotali = 0;
    this.proteineTotali = 0;
    this.lipidiTotali = 0;
    this.apportoIdrico = 0;
    //#endregion

    //#region settimana
    let kcalTuttaSettimana = 0;
    let carboidratiSettimana = 0;
    let proteineSettimana = 0;
    let lipidiSettimana = 0;
    let apportoIdricoSettimana = 0;
    //#endregion

    //#region medi
    let kcalMedie = 0;
    let carboidratiMedi = 0;
    let proteineMedie = 0;
    let lipidiMedi = 0;
    let apportoIdricoMedio = 0;
    //#endregion

    for (const giorno of this.listaGiorni) {
      giorno.kcalGiornaliere = 0;
      giorno.carboidratiGiornalieri = 0;
      giorno.proteineGiornaliere = 0;
      giorno.lipidiGiornalieri = 0;
      giorno.apportoIdricoGiornaliero = 0;

      for (const prodotto of this.listaProdottiSelezionati) {
        if (prodotto.settimana[giorno.id] === true) {
          giorno.kcalGiornaliere = giorno.kcalGiornaliere + prodotto.kcalCalcolate;
          giorno.carboidratiGiornalieri = giorno.carboidratiGiornalieri + prodotto.carboidaratiCalcolati;
          giorno.proteineGiornaliere = giorno.proteineGiornaliere + prodotto.proteineCalcolate;
          giorno.lipidiGiornalieri = giorno.lipidiGiornalieri + prodotto.lipidiCalcolati;
          giorno.apportoIdricoGiornaliero = giorno.apportoIdricoGiornaliero + prodotto.acquacalcolata;
        }
      }
      kcalTuttaSettimana = kcalTuttaSettimana + giorno.kcalGiornaliere;
      carboidratiSettimana = carboidratiSettimana + giorno.carboidratiGiornalieri;
      proteineSettimana = proteineSettimana + giorno.proteineGiornaliere;
      lipidiSettimana = lipidiSettimana + giorno.lipidiGiornalieri;
    }
    kcalMedie = kcalTuttaSettimana / 7;
    carboidratiMedi = carboidratiSettimana / 7;
    proteineMedie = proteineSettimana /7;
    lipidiMedi = lipidiSettimana /7;
    apportoIdricoMedio = apportoIdricoSettimana /7;
    //!chiedere se corretto
    this.kcalTotali = Math.floor(kcalMedie);
    this.proteineTotali = Math.floor(proteineMedie);
    this.carboidratiTotali = Math.floor(carboidratiMedi);
    this.lipidiTotali = Math.floor(lipidiMedi);
    this.apportoIdrico = Math.floor(apportoIdricoMedio);
  }

  /**
   * CALCOLA LE KCAL DI TUTTI I PASTI DEL GIORNO DELLA SETTIMANA, CICLA PRIMA I GIORNI E POI L'ARRAY DEI PASTI PRESENTE IN OGNI GIORNO
   */
  calcolaKcalXGiornoXPasto() {
    for (const giorno of this.listaGiorni) {
      for (const pasto of giorno.pasti) {
        pasto.kcal = 0
        for (const prodotto of this.listaProdottiSelezionati) {
          if (prodotto.settimana[giorno.id] && prodotto.pasto?.id === pasto.id) {
            pasto.kcal = pasto.kcal + prodotto.kcalCalcolate
          }
        }
      }
    }
  }

  /**
   * Calcola i totali delle macro
   */
  calcolaTotaliproprieta() {
    this.proteineTotali = 0
    this.azotoTotale = 0
    this.carboidratiTotali = 0
    this.apportoIdrico = 0
    this.lipidiTotali = 0

    for (const prodotto of this.listaProdottiSelezionati) {
      this.proteineTotali = this.proteineTotali + prodotto.proteineCalcolate
      this.azotoTotale = this.azotoTotale + prodotto.azotoCalcolato
      this.carboidratiTotali = this.carboidratiTotali + prodotto.carboidaratiCalcolati
      this.apportoIdrico = this.apportoIdrico + prodotto.acquacalcolata
      this.lipidiTotali = this.lipidiTotali + prodotto.lipidiCalcolati
    }
  }

  /**calcolo le percentuai di ciascun prodotti, di ciascun valore nutrizionale per il totale di quel valore
   * es: (proteine del prodotto / totale somma proteine di tutti i prodotti) *100 e ottengo percentuale
   */
  calcolaPercentuale(value: number, sommaTot: number) {
    if (value == 0) {
      return 0 + '%'
    }
    return Number((value / sommaTot) * 100).toFixed(1) + '%'
  }

  calcolaPercentualeSuBaseProdotto(value: number, kcal) {
    let perc = Number((value / kcal) * 100).toFixed(1)
    if (value > 0) {
      return perc + '%'
    } else if (this.appGen.isNullOrUndefined(value) || value <= 0) {
      return 0 + '%'
    }
  }

  calcolaIncidenzaKcalXProdotto(
    value: number,
    proprieta: 'proteine' | 'lipidi' | 'carboidrati'
  ) {
    switch (proprieta) {
      case 'proteine':
        if (value == 0) {
          return 0
        } else if (value !== 0) {
          return value * 4 + ' kcal'
        }
        break

      case 'carboidrati':
        if (value == 0) {
          return 0
        } else if (value !== 0) {
          return value * 4 + ' kcal'
        }
        break

      case 'lipidi':
        if (value == 0) {
          return 0
        } else if (value !== 0) {
          return value * 9 + ' kcal'
        }
        break
    }
  }

  /**Calcola le percentuali sui totali giornalieri */
  percentualeTotali(value, checked) {
    if (checked) {
      if (value == 0) {
        return 0 + '%'
      }

      if (this.isDietaXpaziente && !this.isStepAnamnesi) {
        //nell'assegnazione dela dieta calcolerò i totali sul fabbisogno di kcal calcolato per la dieta
        return Number((value / this.kcalDaAssumere) * 100).toFixed(1) + '%'
      } else {
        //in anamnesi calcolerò i totali sulle kcal totali date dai prodotti
        return Number((value / this.kcalTotali) * 100).toFixed(1) + '%'
      }
    }
    return value
  }

  async getListaNotePredefinite() {
    this.listaNotePredefinite = await firstValueFrom(
      this.visitaServ.getListaNotePredefinite()
    )
  }

  /**
   * FA UN CHECK SUL PRODOTTO PER VEDERE SE LO SI STA SCEGLIENDO, SERVE PER CAMBIARE L'ARRAY DALLA QUALE VIENE PRESO IL PRODOTTO
   * SERVE A FARE IN MODO CHEIL PRODOTTO NON SPARISCA QUANDO VIENE CERCATO DURANTE LA SCELTA DI ALTRI PRODOTTI
   * @param event CHANGE
   * @param prodotto PRINCIPALE
   * @param prodottoAlternativo
   */
  checkProductOpened(
    event: boolean,
    prodotto: ProdottoDettaglio,
    prodottoAlternativo = null
  ) {
    if (!prodottoAlternativo) {
      prodotto.isInScelta = event
    } else if (prodottoAlternativo) {
      prodottoAlternativo.isInScelta = event
    }
  }

  prodottoPerTuttiIGiorni(prodotto: ProdottoDettaglio) {
    if (
      prodotto.settimana.lunedi == true &&
      prodotto.settimana.martedi == true &&
      prodotto.settimana.mercoledi == true &&
      prodotto.settimana.giovedi == true &&
      prodotto.settimana.venerdi == true &&
      prodotto.settimana.sabato == true &&
      prodotto.settimana.domenica == true
    ) {
      for (var key of Object.keys(prodotto.settimana)) {
        prodotto.settimana[key] = false
      }
    } else {
      for (var key of Object.keys(prodotto.settimana)) {
        prodotto.settimana[key] = true
      }
    }
  }

  /**
   * GET TUTTI I PRODOTTI, LI TIRA GIU COME PRODOTTI EASY OSSIA UNA CLASSE COMPOSTA DA SOLO NOME PRODOTTO E ID,
   * N SEGUITO QUANDO VIENE SCELTO IL PRODOTTO SI FA LA GET DETTAGLIO
   */
  async getAllProdotti() {
    try {
      this.appGen.loadingPanel.show()
      let listaProdottiTotali = await firstValueFrom(this.prodService.getAllProdotti());
      //Solidi
      this.listaProdotti = listaProdottiTotali.filter(
        (prodotto) => prodotto.idTipoProdotto === TipoProdotto.Solidi
      )
      let listaProdottiProvv: any = this.listaProdotti
      this.prodottiFiltrati.next(listaProdottiProvv.slice())
      //Liquidi
      this.listaLiquidi = listaProdottiTotali.filter(
        (prodotto) => prodotto.idTipoProdotto === TipoProdotto.Liquidi
      )
      let listaLiquidiProvv: any = this.listaLiquidi
      this.liquidiFiltrati.next(listaLiquidiProvv.slice())
      //Integratori
      this.listaIntegratori = listaProdottiTotali.filter(
        (prodotto) => prodotto.idTipoProdotto === TipoProdotto.Integratori
      )
      let listaIntegratoriProvv: any = this.listaIntegratori
      this.integratoriFiltrati.next(listaIntegratoriProvv.slice())
      this.appGen.loadingPanel.hide()
    } catch (error) {
      console.error(error)
      this.notificate.error(
        'È stato riscontrato un erroe durante il recupero dei prodotti, riprovare'
      )
      this.appGen.loadingPanel.hide()
    }
  }

  /**
   * FUNZIONE CHE PARTE UNA VOLTA SCELTO IL PRODOTTO, RECUPERA LE ULTERIORI PROPRIETA
   * @param event
   * @param prodotto
   * @param prodottoAlternativo
   * @param fromQuantita se true vuol dire che la funzione parte al cambio di quantità quando si modifica al prodotto che viene recuperato dall'anamnesi
   */
  async getDettaglioProdotto(
    event: any,
    prodotto: ProdottoDettaglio,
    prodottoAlternativo = null,
    fromQuantita: boolean = false
  ) {
    try {
      prodotto.isInLoading = true
      /**
       * paramFromPrecedente è un parametro fisso che viene determinato adesso, è uguale a "prodotto.isFromPrecedente"
       * Ossia che è di u chiamata precedente tipo "getDettaglioAnamnesi", lo devo parametrizzare perchè poi una volta eseguita la funzione il
       * ptrodotto.isFromPrecedente diventa false;
       */
      let paramFromPrecedente = prodotto.isFromPrecedente
        ? prodotto.isFromPrecedente
        : false
      if (this.appGen.isNullOrUndefined(prodottoAlternativo)) {
        let prodottoSelezionato: ProdottoEasy | ProdottoDettaglio
        if (!prodotto.isFromPrecedente || !fromQuantita) {
          prodottoSelezionato = event.value
        } else if (prodotto.isFromPrecedente && fromQuantita) {
          prodottoSelezionato = prodotto
          prodotto.quantita = Number(event)
          prodotto.isFromPrecedente = false
          if (prodotto.prodottiAlternativi) {
            for (let prodottoAlternativo of prodotto.prodottiAlternativi) {
              let x = await firstValueFrom(
                this.prodService.getProdottoEasy(prodottoAlternativo.id)
              )
              prodottoAlternativo = Object.assign(prodottoAlternativo, x)
            }
          }
        }
        let dettaglioProdotto = await firstValueFrom(
          this.prodService.getProdottoEasy(prodottoSelezionato.id)
        )
        dettaglioProdotto.prodottiAlternativi = prodotto.prodottiAlternativi
        dettaglioProdotto.quantita = Number(prodotto.quantita)
        prodotto = Object.assign(prodotto, dettaglioProdotto) as ProdottoAlternativo

        if (!this.appGen.isNullOrUndefined(prodotto.quantita) && prodotto.quantita > 0) {
          //SE C'È GIA LA QUANTITA CALCOLA LE PROPRIETA E LE KCAL
          this.calcolaValoriProdotto(prodotto, prodotto.quantita)
          this.calcolaKcalTotali()
          this.calcolaTotaliproprieta()
          if (this.divisioneXPasti) {
            this.calcolaKcalXPasti()
          }
          if (this.dietaSettimanale) {
            this.calcolaKcalXGiorno()
          }
          if (this.dietaSettimanale && this.divisioneXPasti) {
            this.calcolaKcalXGiornoXPasto()
          }
        } else {
          prodotto.isInLoading = false
        }
      } else if (!this.appGen.isNullOrUndefined(prodottoAlternativo)) {
        let prodottoSelezionato: ProdottoEasy | ProdottoDettaglio
        if (!prodotto.isFromPrecedente || !fromQuantita) {
          prodottoSelezionato = event.value
        } else if (prodotto.isFromPrecedente && fromQuantita) {
          prodottoSelezionato = prodottoAlternativo
          prodottoAlternativo.quantita = Number(event)
        }

        let dettaglioProdotto = await firstValueFrom(
          this.prodService.getProdottoEasy(prodottoSelezionato.id)
        )
        dettaglioProdotto.quantita = prodottoAlternativo.quantita
        prodottoAlternativo = Object.assign(prodottoAlternativo, dettaglioProdotto)

        /**
         * 04/03/2024
         * Questa parte è molto incasinata ci sono da fare un paio di if e da sistemare quelli già presenti
         * per evitare errori tipo quello segnalato a riga 628
         */
        if (
          !this.appGen.isNullOrUndefined(prodottoAlternativo.quantita) &&
          prodottoAlternativo.quantita !== 0 &&
          this.appGen.isNullOrUndefined(prodotto.id) &&
          paramFromPrecedente === false &&
          !fromQuantita
        ) {
          this.calcolaValoriProdotto(
            prodottoAlternativo,
            prodottoAlternativo.quantita,
            true
          )
        } else if (
          !this.appGen.isNullOrUndefined(prodotto.quantita) &&
          prodotto.quantita !== 0 &&
          !this.appGen.isNullOrUndefined(prodotto.id) &&
          paramFromPrecedente === false
        ) {
          this.calcolaValoriProdotto(
            prodotto,
            prodotto.quantita,
            true,
            prodottoAlternativo
          )
        } else if (
          !this.appGen.isNullOrUndefined(prodottoAlternativo.quantita) &&
          prodottoAlternativo.quantita !== 0 &&
          !this.appGen.isNullOrUndefined(prodotto.id) &&
          paramFromPrecedente === true
        ) {
          this.calcolaValoriProdotto(
            prodottoAlternativo,
            prodottoAlternativo.quantita,
            true
          )
          prodotto.isInLoading = false
        } else if (
          !this.appGen.isNullOrUndefined(prodotto.quantita) &&
          prodotto.quantita !== 0 &&
          !this.appGen.isNullOrUndefined(prodotto.id) &&
          paramFromPrecedente === true
        ) {
          this.calcolaValoriProdotto(
            prodotto,
            prodotto.quantita,
            true,
            prodottoAlternativo
          )
        } else {
          prodotto.isInLoading = false
        }
      }
    } catch (error) {
      console.error(error)
      prodotto.isInLoading = false
      this.notificate.error('È stato riscontrato un errore, riprovare')
    }
  }

  //FUNZIONE CHE SI ATTIVA QUANDO SI USA IL FILTRO PER LA RICERCA DEI PRODOTTI
  setFiltriSelect() {
    this.filtroProdotti.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this._onDestroy))
      .subscribe((data) => {
        this.filtraProdotti(data)
      })

    this.filtroLiquidi.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this._onDestroy))
      .subscribe((data) => {
        this.filtraLiquidi(data)
      })

    this.filtroIntegratori.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this._onDestroy))
      .subscribe((data) => {
        this.filtraIntegratori(data)
      })
  }

  //FILTRA I PRODOTTI
  filtraProdotti(data: string) {
    if (!this.listaProdotti) {
      return
    }
    let search = data
    if (!search || search.length < this.minLength) {
      let listaProdottiProvv: any = this.listaProdotti
      this.prodottiFiltrati.next(listaProdottiProvv.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    let listaFiltrata: any = []
    listaFiltrata = this.filtroProdServ.filtroProdotti(search, this.listaProdotti)
    // Se è lunga almeno 2 caratteri filtra attraverso il service;
    if (search.length >= this.minLength) {
      this.prodottiFiltrati.next(listaFiltrata.slice())
    }
  }

  filtraLiquidi(data: string) {
    if (!this.listaLiquidi) {
      return
    }
    let search = data
    if (!search || search.length < this.minLength) {
      let listaLiquidiProvv: any = this.listaLiquidi
      this.liquidiFiltrati.next(listaLiquidiProvv.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    let listaFiltrata: any = []
    listaFiltrata = this.filtroProdServ.filtroProdotti(search, this.listaLiquidi)
    // Se è lunga almeno 2 caratteri filtra attraverso il service;
    if (search.length >= this.minLength) {
      this.liquidiFiltrati.next(listaFiltrata.slice())
    }
  }

  filtraIntegratori(data: string) {
    if (!this.listaIntegratori) {
      return
    }
    let search = data
    if (!search || search.length < this.minLength) {
      let listaIntegratoriProvv: any = this.listaIntegratori
      this.integratoriFiltrati.next(listaIntegratoriProvv.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    let listaFiltrata: any = []
    listaFiltrata = this.filtroProdServ.filtroProdotti(search, this.listaIntegratori)
    // Se è lunga almeno 2 caratteri filtra attraverso il service;
    if (search.length >= this.minLength) {
      this.integratoriFiltrati.next(listaFiltrata.slice())
    }
  }

  /**
   * AGGIUNGE UN PRODOTTO "VUOTO" PER FARE IN MODO CHE SI POSSA COMPILARE IN SEGUITO
   * @param pasto
   */
  aggiungiAProdottiSelezionati(pasto: PastoClass = null) {
    if (!this.divisioneXPasti) {
      let newProdotto: ProdottoDettaglio = new ProdottoDettaglio()
      newProdotto.oggettoVuoto()

      newProdotto.settimana = new Settimana()
      newProdotto.settimana.nuovoOggetto()
      let pastoDU = new PastoClass(Pasto.DietaUnica);
      newProdotto.pasto = pastoDU;

      this.listaProdottiSelezionati.push(newProdotto)
      this.aggiuntaProdotto = !this.aggiuntaProdotto

      setTimeout(() => {
        ///FUNZIONE PER LO SCROLL AUTOMATICO ALL'ULTIMO PRODOTTO AGGIUNTO
        let x = 'principale' + JSON.stringify(this.listaProdottiSelezionati.length - 1)
        let scrollOptions = { behavior: 'smooth', block: 'center', inline: 'nearest' }
        this.scrollToElement(x, scrollOptions)
      }, 200)
    } else if (this.divisioneXPasti && !this.appGen.isNullOrUndefined(pasto)) {
      let newProdotto: ProdottoDettaglio = new ProdottoDettaglio()
      newProdotto.oggettoVuoto()

      newProdotto.settimana = new Settimana()
      newProdotto.settimana.nuovoOggetto()

      newProdotto.pasto = pasto
      this.listaProdottiSelezionati.push(newProdotto)
      this.aggiuntaProdotto = !this.aggiuntaProdotto

      setTimeout(() => {
        ///FUNZIONE PER LO SCROLL AUTOMATICO ALL'ULTIMO PRODOTTO AGGIUNTO
        let x = 'principale' + JSON.stringify(this.listaProdottiSelezionati.length - 1)
        let scrollOptions = { behavior: 'smooth', block: 'center', inline: 'nearest' }
        this.scrollToElement(x, scrollOptions)
      }, 200)
    }
  }

  /**
   * AGGIUNGE UN PRODOTTO ALTERNATIVO "VUOTO" DA COMPILARE
   * @param prodotto PRODOTTO PRINCIPALE ALLA QUALE VIENE AGGIUNO L'ALTERNATIVO
   * @param pasto
   */
  aggiungiAProdottiAlternativiXProdotto(prodotto: ProdottoDettaglio, pasto = null) {
    if (!this.divisioneXPasti) {
      let newProdottoAlternativo: ProdottoAlternativo = new ProdottoAlternativo(null)
      newProdottoAlternativo.oggettoVuoto();
      let pastoDU = new PastoClass(Pasto.DietaUnica);
      newProdottoAlternativo.pasto = pastoDU;
      prodotto.prodottiAlternativi.push(newProdottoAlternativo)
      setTimeout(() => {
        ///FUNZIONE PER LO SCROLL AUTOMATICO ALL'ULTIMO PRODOTTO ALTERNATIVO AGGIUNTO AL PRODOTTO PRINCIPALE
        let x =
          'alternativo' +
          JSON.stringify(prodotto.id) +
          JSON.stringify(prodotto.prodottiAlternativi.length - 1)
        this.scrollToElement(x)
      }, 200)
    } else if (this.divisioneXPasti && !this.appGen.isNullOrUndefined(pasto)) {
      let newProdottoAlternativo: ProdottoAlternativo = new ProdottoAlternativo(null)
      newProdottoAlternativo.oggettoVuoto()
      newProdottoAlternativo.pasto = pasto
      prodotto.prodottiAlternativi.push(newProdottoAlternativo)
      setTimeout(() => {
        ///FUNZIONE PER LO SCROLL AUTOMATICO ALL'ULTIMO PRODOTTO ALTERNATIVO AGGIUNTO AL PRODOTTO PRINCIPALE
        let x =
          'alternativo' +
          JSON.stringify(prodotto.id) +
          JSON.stringify(prodotto.prodottiAlternativi.length - 1)
        this.scrollToElement(x)
      }, 200)
    }
  }

  /**
   * todo: questa funzione converte solo per kcal, da fare anche conversione isoproteica
   * @param prodotto prodotto che passo, principale o alternativo
   * @param quantita quantità del prodotto
   * @param prodottoAlternativo prodotto alternativo passato da convertire singolarmente
   * @param prodottoAlternativoPresente booleano per verificare se sia il prodotto principale(1) o alternativo(2)
   */
  async calcolaValoriProdotto(
    prodotto: ProdottoDettaglio,
    quantita: number,
    prodottoAlternativoPresente: boolean = false,
    prodottoAlternativo: ProdottoAlternativo = null
  ) {
    try {
      prodotto.isInLoading = true
      if (prodottoAlternativoPresente === false) {
        ///(1) CALCOLA I VALORI DEL PRODOTTO PRINCIPALE E CONVERTE LE PROPRIETÀ DI TUTTI GLI ALTERNATIVI
        prodotto.quantita = Number(prodotto.quantita)
        prodotto.quantita = Number(quantita)

        prodotto.kcalCalcolate = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.kcal,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.azotoCalcolato = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.azoto,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.proteineCalcolate = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.proteine,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.lipidiCalcolati = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.lipidi,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.carboidaratiCalcolati = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.carboidrati,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.acquacalcolata = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.acqua,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        /**
         * Se cambio il prodotto pricipale si convertono tutti i prodotti alternativi
         */
        if (prodotto.prodottiAlternativi.length > 0) {
          for (const prodottoAlternativo of prodotto.prodottiAlternativi) {
            if (prodottoAlternativo.id) {
              let proprietaConvertite = await firstValueFrom(
                this.prodService.conversioneXProdottoAlternativo(
                  prodottoAlternativo.id,
                  prodotto.kcalCalcolate
                )
              )
              prodottoAlternativo.quantita = Math.round(proprietaConvertite.quantita)
              prodottoAlternativo.kcalCalcolate = Math.round(proprietaConvertite.kcal)
              prodottoAlternativo.azotoCalcolato = Math.round(proprietaConvertite.azoto)
              prodottoAlternativo.proteineCalcolate = Math.round(
                proprietaConvertite.proteine
              )
              prodottoAlternativo.carboidaratiCalcolati = Math.round(
                proprietaConvertite.carboidrati
              )
              prodottoAlternativo.lipidiCalcolati = Math.round(proprietaConvertite.lipidi)
              prodottoAlternativo.acquacalcolata = Math.round(proprietaConvertite.acqua)
            }
          }
        }
        prodotto.isInLoading = false
        if (!this.appGen.isNullOrUndefined(prodotto.prodotto)) {
          this.calcolaKcalTotali()
          this.calcolaTotaliproprieta()
          if (this.divisioneXPasti) {
            this.calcolaKcalXPasti()
          }

          if (this.dietaSettimanale) {
            this.calcolaKcalXGiorno()
          }

          if (this.dietaSettimanale && this.divisioneXPasti) {
            this.calcolaKcalXGiornoXPasto()
          }
        }
      } else if (
        prodottoAlternativoPresente === true &&
        this.appGen.isNullOrUndefined(prodottoAlternativo)
      ) {
        ///(2) CALCOLA I VALORI DEL SOLO PRODOTTO ALTERNATIVO, VIENE TRIGGERATA SE CAMBIO LA QUANTITÀ DEL PRODOTTO ALTERNATIVO
        prodotto.quantita = Number(quantita)

        prodotto.kcalCalcolate = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.kcal,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.azotoCalcolato = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.azoto,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.proteineCalcolate = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.proteine,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.lipidiCalcolati = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.lipidi,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.carboidaratiCalcolati = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.carboidrati,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.acquacalcolata = Math.round(
          this.appGen.ProporzioneValori(
            prodotto.acqua,
            prodotto.quantita,
            prodotto.quantitaBase
          )
        )

        prodotto.isInLoading = false
      } else if (
        prodottoAlternativoPresente === true &&
        !this.appGen.isNullOrUndefined(prodottoAlternativo)
      ) {
        /**
         *  Selezionando il prootto alternativo converto le proprietà in base alle kcal del principale
         *
         */
        let proprietaConvertite = await firstValueFrom(
          this.prodService.conversioneXProdottoAlternativo(
            prodottoAlternativo.id,
            prodotto.kcalCalcolate
          )
        )

        prodottoAlternativo.quantita = Math.round(proprietaConvertite.quantita)
        prodottoAlternativo.kcalCalcolate = Math.round(proprietaConvertite.kcal)
        prodottoAlternativo.azotoCalcolato = Math.round(proprietaConvertite.azoto)
        prodottoAlternativo.proteineCalcolate = Math.round(proprietaConvertite.proteine)
        prodottoAlternativo.carboidaratiCalcolati = Math.round(
          proprietaConvertite.carboidrati
        )
        prodottoAlternativo.lipidiCalcolati = Math.round(proprietaConvertite.lipidi)
        prodottoAlternativo.acquacalcolata = Math.round(proprietaConvertite.acqua)

        prodotto.isInLoading = false
      }
    } catch (error) {
      console.error(error)
      prodotto.isInLoading = false
      this.notificate.error('È stato riscontrato un errore, riprovare')
    }
  }

  /**
   * FUNZIONE SUL CHECK "ALTERNATIVO", VEDE SE È ABILITATO IL PRODOTTO ALTERNATIVO O MENO SUL PRODOTTO PRINCIPALE
   * @param prodotto PRODOTTO PRINCIPALE
   * @param pasto
   */
  statusProdottoAlternativo(prodotto: ProdottoDettaglio, pasto = null) {
    prodotto.alternativoAbilitato = !prodotto.alternativoAbilitato

    if (prodotto.alternativoAbilitato) {
      this.aggiungiAProdottiAlternativiXProdotto(prodotto, pasto)
    } else if (!prodotto.alternativoAbilitato) {
      ///SE SI DISATTIVA AZZERA L'ARRAY DI PRODOTTI ALTERNATIVI
      prodotto.prodottiAlternativi = []
    }
  }

  /**
   * DETERMINA SE SI SCEGLIE DI FARE LA DIETA DIVISA PER PASTI
   */
  statusDivisioneXPasti(event: MatSlideToggleChange) {
    if (this.listaProdottiSelezionati.length > 0) {
      Swal.fire({
        title: 'Sei sicuro?',
        text: 'I prodotti selezionati verranno rimossi',
        icon: 'warning',
        iconColor: '#d33',
        showCancelButton: false,
        showDenyButton: true,
        confirmButtonColor: '#00afa6',
        denyButtonColor: '#d33',
        confirmButtonText: 'Sì',
        denyButtonText: 'No, annulla',
      }).then((result) => {
        if (result.isConfirmed) {
          this.divisioneXPasti = event.checked
          this.listaProdottiSelezionati = []
          if (!this.divisioneXPasti) {
            for (const pasto of this.listaPasti) {
              pasto.expanded = false
              pasto.kcal = 0
            }
            this.kcalTotali = 0
          }
          if (!this.divisioneXPasti && this.dietaSettimanale) {
            for (const giorno of this.listaGiorni) {
              giorno.kcalGiornaliere = 0
              for (const pasto of giorno.pasti) {
                pasto.kcal = 0
              }
            }
            this.kcalTotali = 0
          }
        }
        if (result.isDenied) {
          event.checked = true
          this.divisioneXPastoForm.setValue(true)
          this.divisioneXPasti = event.checked
        }
      })
    } else {
      this.divisioneXPasti = event.checked
      this.listaProdottiSelezionati = []
      if (!this.divisioneXPasti) {
        for (const pasto of this.listaPasti) {
          pasto.expanded = false
          pasto.kcal = 0
          this.kcalTotali = 0
        }
      }
      if (!this.divisioneXPasti && this.dietaSettimanale) {
        for (const giorno of this.listaGiorni) {
          giorno.kcalGiornaliere = 0
          for (const pasto of giorno.pasti) {
            pasto.kcal = 0
            this.kcalTotali = 0
          }
        }
      }
    }
  }

  /**
   * DETERMINA SE SI SCEGLIE DI FARE LA DIETA DIVISA PER GIORNI DELLA SETTIMANA
   */
  statusDietaSettimanale() {
    this.dietaSettimanale = !this.dietaSettimanale
    if (!this.dietaSettimanale) {
      for (const prodotto of this.listaProdottiSelezionati) {
        prodotto.settimana.nuovoOggetto()
      }
      for (const giorno of this.listaGiorni) {
        giorno.kcalGiornaliere = 0
        for (const pasto of giorno.pasti) {
          pasto.kcal = 0
        }
      }
    }
  }

  selectedConclusionePredefinita(conclusione) {
    this.formNoteConclusioni.get('conclusioniPredefinite').reset()

    if (!this.appGen.isNullOrUndefined(conclusione)) {
      this.formNoteConclusioni
        .get('conclusioni')
        .setValue(this.formNoteConclusioni.get('conclusioni').value + ' ' + conclusione)
    }
  }

  /**
   * RIMUOVE IL PRODOTTO PASSATO, SE VIENE PASSATO L'ALTERNATIVO INVECE RIMUOVE IL PRODOTTO ALTERNATIVO DAL PRODOTTO PRINCIPALE
   * @param prodotto PRODOTTO PRINCIPALE
   * @param prodottoAlternativo
   */
  removeProduct(
    prodotto: ProdottoDettaglio,
    prodottoAlternativo: ProdottoAlternativo = null
  ) {
    if (this.appGen.isNullOrUndefined(prodottoAlternativo)) {
      this.listaProdottiSelezionati = _.without(this.listaProdottiSelezionati, prodotto)
    } else if (!this.appGen.isNullOrUndefined(prodottoAlternativo)) {
      prodotto.prodottiAlternativi = _.without(
        prodotto.prodottiAlternativi,
        prodottoAlternativo
      )
      if (prodotto.prodottiAlternativi.length == 0) {
        prodotto.alternativoAbilitato = false
      }
    }
    this.calcolaKcalTotali()
    this.calcolaTotaliproprieta()
    if (this.dietaSettimanale && !this.divisioneXPasti) {
      this.calcolaKcalXGiorno()
    } else if (this.divisioneXPasti && !this.dietaSettimanale) {
      this.calcolaKcalXPasti()
    } else if (this.divisioneXPasti && this.dietaSettimanale) {
      this.calcolaKcalXGiorno()
      this.calcolaKcalXGiornoXPasto()
    }
  }

  /**
   * SI ATTIVA QUANDO SI PROVA A SALVARE UNA DIETA, ESEGUE UN CICLO SUI PRODOTTI
   * SE SI È SCELTO DI FARE UNA DIETA CON GIORNI DELLA SETTIMANA ALMENO UNO PER OGNI PRODOTTO È DA SELEZIONARE
   * SE SI È SCERLTO DI FARE UNA DIETA PER PASTI DEVE ESSERE PRESENTE LA PROPRIETÀ PASTO NEL PRODOTTO
   * @returns TRUE SE NON CONTIENE ERRORI, FALSE SE INVECE PRESENTA ERRORI
   */
  checkValiditaProdotti() {
    this.prodottiSelezionatiNonCorrettamente = []
    for (const prodotto of this.listaProdottiSelezionati) {
      if (!this.dietaSettimanale && !this.divisioneXPasti) {
        let checkAlternativi = this.checkValiditaProdottiAlternativi(prodotto)
        if (
          this.appGen.isNullOrUndefined(prodotto.quantita) ||
          Number(prodotto.quantita) <= 0 ||
          this.appGen.isNullOrUndefined(prodotto.prodotto) ||
          prodotto.prodotto.trim() == '' ||
          checkAlternativi === false
        ) {
          this.prodottiSelezionatiNonCorrettamente.push(prodotto)
        }
      }

      if (this.divisioneXPasti && !this.dietaSettimanale) {
        let checkAlternativi = this.checkValiditaProdottiAlternativi(prodotto)
        if (
          this.appGen.isNullOrUndefined(prodotto.quantita) ||
          Number(prodotto.quantita) <= 0 ||
          this.appGen.isNullOrUndefined(prodotto.prodotto) ||
          prodotto.prodotto.trim() == '' ||
          this.appGen.isNullOrUndefined(prodotto.pasto.id) ||
          checkAlternativi === false
        ) {
          this.prodottiSelezionatiNonCorrettamente.push(prodotto)
        }
      }

      if (!this.divisioneXPasti && this.dietaSettimanale) {
        let x = _.every(prodotto.settimana, function (val) {
          return val == false
        })
        let checkAlternativi = this.checkValiditaProdottiAlternativi(prodotto)
        if (
          this.appGen.isNullOrUndefined(prodotto.quantita) ||
          Number(prodotto.quantita) <= 0 ||
          this.appGen.isNullOrUndefined(prodotto.prodotto) ||
          prodotto.prodotto.trim() == '' ||
          //se è false vuol dire che almeno un giorno è stato segnato e quindi è giusto
          x === true ||
          checkAlternativi === false
        ) {
          this.prodottiSelezionatiNonCorrettamente.push(prodotto)
        }
      }

      if (this.divisioneXPasti && this.dietaSettimanale) {
        let x = _.every(prodotto.settimana, function (val) {
          return val == false
        })
        let checkAlternativi = this.checkValiditaProdottiAlternativi(prodotto)
        if (
          this.appGen.isNullOrUndefined(prodotto.quantita) ||
          Number(prodotto.quantita) <= 0 ||
          this.appGen.isNullOrUndefined(prodotto.prodotto) ||
          prodotto.prodotto.trim() == '' ||
          //se è false vuol dire che almeno un giorno è stato segnato e quindi è giusto
          x === true ||
          this.appGen.isNullOrUndefined(prodotto.pasto.id) ||
          checkAlternativi === false
        ) {
          this.prodottiSelezionatiNonCorrettamente.push(prodotto)
        }
      }
    }
    if (this.prodottiSelezionatiNonCorrettamente.length > 0) {
      return false
    } else {
      return true
    }
  }

  /**
   * ESEGUE UN CHECK SUI PRODOTTI PRINCIPALI DEI PRODOTTI ALTERNATIVI
   * @param prodotto PRODOTTO PRINCIPALE DI RIFERIMENTO
   * @returns TRUE SE È TUTTO OK, FALSE SE È PRESENTE QUALCHE ERRORE
   */
  checkValiditaProdottiAlternativi(prodotto: ProdottoDettaglio) {
    if (prodotto.prodottiAlternativi.length > 0) {
      for (const prodottoAlternativo of prodotto.prodottiAlternativi) {
        prodotto.listaAlternativiIncompleti = []
        if (
          this.appGen.isNullOrUndefined(prodottoAlternativo.quantita) ||
          Number(prodottoAlternativo.quantita) <= 0 ||
          this.appGen.isNullOrUndefined(prodottoAlternativo.prodotto) ||
          prodottoAlternativo.prodotto.trim() == ''
        ) {
          prodotto.listaAlternativiIncompleti.push(prodottoAlternativo)
        }
      }
      if (prodotto.listaAlternativiIncompleti.length > 0) {
        return false
      } else {
        true
      }
    } else {
      return true
    }
  }

  /**
   * EFFETTUA UNO SCROLL AUTOMATICO
   * @param element
   * @param scrollOptions OPZIONI PER UNO SCROLL DIFFERENTE RISPETTO A QUELLO STANDARD
   */
  scrollToElement(element, scrollOptions = null): void {
    if (this.appGen.isNullOrUndefined(scrollOptions)) {
      const x = document.getElementById(element)
      x.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    } else {
      const x = document.getElementById(element)
      x.scrollIntoView(scrollOptions)
    }
  }

  /**
   * Compila la lista per essere inserita nell'alert
   * @param lista lista degli import falliti
   * @returns
   */
  generaLista(lista: ProdottoDettaglio[]) {
    let optionItems
    lista.forEach((item) => {
      if (this.appGen.isNullOrUndefined(optionItems)) {
        optionItems =
          `<li>
          <span style="font-weight: bold;">
          ${item.prodotto ? item.prodotto : 'PRODOTTO ASSENTE'}
          </span>` +
          `
          ${item.pasto ? 'in ' : ''}
          ` +
          `
          <span style="color:#00afa6; font-weight: bold;">${
            item.pasto ? item.pasto.nome.toLocaleUpperCase() : ''
          }</span>
          </li>`
      } else if (!this.appGen.isNullOrUndefined(optionItems)) {
        optionItems +=
          `<li>
          <span style="font-weight: bold;">
          ${item.prodotto ? item.prodotto : 'PRODOTTO ASSENTE'}
          </span>` +
          `
          ${item.pasto ? 'in ' : ''}
          ` +
          `
          <span style="color:#00afa6; font-weight: bold;">${
            item.pasto ? item.pasto.nome.toLocaleUpperCase() : ''
          }</span>
          </li>`
      }
    })
    return optionItems
  }

  /**
   * CREA UN FOOTER DINAMICO PER L'ALERT IN CASO DI PRODOTTI INSERITI NON CORRETTAMENTE
   * @returns IL TESTO DEL FOOTER
   */
  createFooterXSwal() {
    let text = ''
    if (!this.divisioneXPasti && !this.dietaSettimanale) {
      text =
        'Controllare se per ogni prodotto sono stati inseriti quantità e il nome del prodotto'
    } else if (!this.divisioneXPasti && this.dietaSettimanale) {
      text =
        'Controllare se per ogni prodotto sono stati inseriti quantità, nome del prodotto e almeno un giorno della settimana'
    } else if (this.divisioneXPasti && !this.dietaSettimanale) {
      text =
        'Controllare se per ogni prodotto sono stati inseriti quantità e nome del prodotto nei vari pasti'
    } else if (this.divisioneXPasti && this.dietaSettimanale) {
      text =
        'Controllare se per ogni prodotto sono stati inseriti quantità, nome del prodotto e almeno un giorno della settimana nei vari pasti'
    }
    return text
  }

  async saveDietaXAnamnesi() {
    try {
      this.calcolaTotaliproprieta()
      let dieta: ProdottiAnamnesi = {
        Prodotti: this.listaProdottiSelezionati,
        KcalTotaliDieta: this.kcalTotali,
        ProteineTotaliDieta: this.proteineTotali,
        AzotoTotaliDieta: this.azotoTotale,
        CarboidratiTotaliDieta: this.carboidratiTotali,
        LipidiTotaliDieta: this.lipidiTotali,
        ApportoIdrico: this.apportoIdrico,
        IdVisita: this.idVisita,
        IdPaziente: this.idPaziente,
        Note: this.formNoteConclusioni.controls.note.value,
        DiagnosiNutrizionale:
          this.formNoteConclusioni.controls.diagnosiNutrizionale.value,
      }
      let dietaToDTO: ProdottiAnamnesiToDTO = new ProdottiAnamnesiToDTO(dieta);
      await firstValueFrom(this.dietaService.salvaAnamnesi(dietaToDTO))
      this.salvato = true
      this.isEdit = false
      this.editProdotti = false
    } catch (error) {
      console.error(error)
      this.notificate.error('Non è stato possibile salvare la dieta, riprovare')
    }
  }

  async saveDietaXPianoNutrizionale() {
    try {
     /* if (!this.formNoteConclusioni.valid) {
        this.notificate.error('Il campo conclusioni è obbligatorio per proseguire oooo')
        return
      }*/
      this.calcolaTotaliproprieta()
      let dieta: ProdottiPiano = {
        Prodotti: this.listaProdottiSelezionati,
        KcalTotaliDieta: this.kcalTotali,
        ProteineTotaliDieta: this.proteineTotali,
        AzotoTotaliDieta: this.azotoTotale,
        CarboidratiTotaliDieta: this.carboidratiTotali,
        LipidiTotaliDieta: this.lipidiTotali,
        ApportoIdrico: this.apportoIdrico,
        IdVisita: this.appGen.isNullOrUndefined(this.idVisita) ? '' : this.idVisita,
        IdPaziente: this.idPaziente,
        Diagnosi: this.formNoteConclusioni.controls.conclusioni.value,
        NotePianoNutr: this.formNoteConclusioni.controls.note.value,
        IdValutazioneNutrizionale: this.idValutazione,
        IdDietaRiferimento: this.appGen.isNullOrUndefined(this.idDieta)
          ? null
          : this.idDieta,
      }

      let dietaToDTO: ProdottiPianoToDTO = new ProdottiPianoToDTO(dieta)
      await firstValueFrom(this.dietaService.salvaNutrizioneNaturale(dietaToDTO))

      // let obj = {
      //   getVisitaPadre: false,
      //   idVisita: this.idVisita,
      // }

      // this.router.navigate(['/app/visite/piani-alimentari/nuovo', this.idPaziente], {
      //   queryParams: { visit: this.idVisita, vnutr: this.idValutazione, new: false}
      // })
      this.activateRoute.queryParams.subscribe(async (params) => {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: { visit: this.idVisita, vnutr: this.idValutazione, new: false },
          queryParamsHandling: '',
        })
      })

      this.salvaNoteDietista()
      this.getDettaglioPianoNutrizionale()

      this.salvato = true
      this.isEdit = false
      this.editProdotti = false
      this.isDettaglioDieta = false
    } catch (error) {
      console.error(error)
    }
  }

  async saveDietaXDietePredefinite() {
    try {
      if (this.nomeDieta.value.trim() !== '') {
        this.calcolaTotaliproprieta()
        let dieta = new SalvaDietaRequest()
        dieta.Prodotti = []
        this.listaProdottiSelezionati.forEach((prodotto) => {
          let x: ProdottoPrincipaleToDTO
          x = new ProdottoPrincipaleToDTO(prodotto)
          dieta.Prodotti.push(x)
        })
        ;(dieta.Proteine = !this.appGen.isNullOrUndefined(this.proteineTotali)
          ? this.proteineTotali
          : 0),
          (dieta.Azoto = !this.appGen.isNullOrUndefined(this.azotoTotale)
            ? this.azotoTotale
            : 0),
          (dieta.Carboidrati = !this.appGen.isNullOrUndefined(this.carboidratiTotali)
            ? this.carboidratiTotali
            : 0)
        ;(dieta.Lipidi = !this.appGen.isNullOrUndefined(this.lipidiTotali)
          ? this.lipidiTotali
          : 0),
          (dieta.ApportoIdrico = !this.appGen.isNullOrUndefined(this.apportoIdrico)
            ? this.apportoIdrico
            : 0),
          (dieta.Kcal = !this.appGen.isNullOrUndefined(this.kcalTotali)
            ? this.kcalTotali
            : 0)
        dieta.NomeDieta = this.nomeDieta.value
        dieta.IdDieta =
          this.idDieta && this.proprietaDieta.creatoDaUtenteLoggato ? this.idDieta : null

        await firstValueFrom(this.dietaService.salvaDietaPredefinita(dieta))
        this.salvato = true
        this.isEdit = false
        this.editProdotti = false
        this.backToPrevious()
      } else {
        this.notificate.warning('Non è stato inserito alcun nome alla dieta')
      }
    } catch (error) {
      console.error(error)
      this.notificate.error('Non è stato possibile salvare, riprovare')
    }
  }

  /**
   * Funzione che salva le note del dietista
   */
  async salvaNoteDietista() {
    try {
      if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
        const note = this.formNoteConclusioni.get('noteDietista').value

        const obj = {
          idVisita: this.idVisita,
          note: note,
        }
        await firstValueFrom(this.visitaServ.salvaNoteDietista(obj))
        this.formNoteConclusioni.get('noteDietista').disable()
      }
    } catch (error) {
      console.error('error')
      this.appGen.notificate.error(
        'È stato riscontrato un problema durante il salvataggio delle no'
      )
    }
  }

  async concludiVisita() {
    // const obj = this.getProdottiObj();
    // if (obj.length <= 0 && !this.isStepAnamnesi) {
    //   this.notificate.error('Selezionare almeno un prodotto')
    //   this.inError = false
    //   return true
    // }

    const message = `Vuoi concludere la visita? <br>Cliccando su conferma
    la visita non sarà più modificabile e verranno compilati i relativi documenti`
    const dialogData = new ConfirmDialogModel('Attenzione!', message)
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe(
      await (async (dialogResult) => {
        if (dialogResult) {
          if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
            ///Se l'utente è dietista salva la dieta e poi salva le note nella visita
            const obj = {
              idVisita: this.idVisita,
              idTipoAlimentazione: TipoAlimentazione.NaturaleMista,
            }

            await this.service
              .postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj })
              .then(() => {
                this.router.navigate(['/app/visite/step/conclusioni', this.idPaziente], {
                  queryParams: { visit: this.idVisita, vnutr: this.idValutazione },
                })
              })
          } else if (this.authGuard.canRole(this.appGen.ruolo.Medico)) {

            this.service
            .putCallRequest({ action: 'concludiVisita', param: this.idVisita })
            .then(() => {
              this.router.navigate(['/app/visite/step/riepilogo', this.idPaziente], {
                queryParams: {
                  visit: this.idVisita,
                  showKcal: !this.kcalNonVisibili,
                },
              })
            })

          /*  const conclusioni = this.formNoteConclusioni.controls.conclusioni.value
            if (
              !this.appGen.isNullOrUndefined(conclusioni) &&
              conclusioni.trim() !== ''
            ) {
              // if (this.appGen.configLinfa.InvioRefertiSenzaFirma === true) {
              //   await firstValueFrom(this.visitaServ.matchtiporichiesta(this.idVisita))
              // }
              this.service
                .putCallRequest({ action: 'concludiVisita', param: this.idVisita })
                .then(() => {
                  this.router.navigate(['/app/visite/riepilogo', this.idPaziente], {
                    queryParams: {
                      visit: this.idVisita,
                      showKcal: !this.kcalNonVisibili,
                    },
                  })
                })
            } else if (
              this.appGen.isNullOrUndefined(conclusioni) ||
              conclusioni.trim() === ''
            ) {
              this.notificate.warning(
                'Il campo conclusioni è obbligatorio per proseguire, cliccare su "modifica" per abilitare il campo e poterlo compilare '
              )
            }*/
          }
        }
      })
    )
  }

  async onSubmit() {
    try {
      const result = this.checkValiditaProdotti()
      if (result === false) {
        ///Swal con messaggio
        Swal.fire({
          title: 'Impossibile salvare',
          html:
            `<div>
            Alcuni alimenti, o i suoi prodotti alternativi non sono stati inseriti correttamente:
            <ul style="max-height: 360px; overflow-y: auto; text-align: justify;">` +
            this.generaLista(this.prodottiSelezionatiNonCorrettamente) +
            `</ul>
          </div>`,
          icon: 'warning',
          footer:
            `<span style="padding: 16px; font-weight: bold">` +
            this.createFooterXSwal() +
            `</span>`,
        })
        return true
      } else {
        ///Funzione salvataggio
        this.appGen.loadingPanel.show()

        if (this.isStepAnamnesi) {
          this.saveDietaXAnamnesi()
        }
        if (this.stepCorrente === this.stepVisita.Predefinita) {
          this.saveDietaXDietePredefinite()
        }

        if (this.isStepPianoNutrizionale) {
          this.saveDietaXPianoNutrizionale()
        }

        if (this.formNoteConclusioni.valid) {
          this.formNoteConclusioni.disable()
          this.formMacro.disable()
          this.editorConfig.editable = false
          this.editorConfig.showToolbar = false
        }
        this.appGen.loadingPanel.hide()
      }
    } catch (error) {
      console.error(error)
      this.notificate.error('Errore durante il salvataggio, riprovare')
    }
  }

  modificaProdotti() {
    this.editProdotti = !this.editProdotti
    this.isEdit = !this.isEdit
    this.salvato = !this.salvato
    this.formNoteConclusioni.enable()
    this.formMacro.enable()
    if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.formNoteConclusioni.get('noteDietista').enable()
    } else if (!this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.formNoteConclusioni.get('noteDietista').disable()
    }
    this.editorConfig.editable = true
    this.editorConfig.showToolbar = true
  }

  statusKcal() {
    this.kcalNonVisibili = !this.kcalNonVisibili
  }

  buildToolTip(value: number) {
    let string = 'Visualizzazione proprietà prodotti.'
    if (value === 1) {
      string =
        'Vengono mostrati per ogni singolo prodotto l’apporto energetico (kcal), i macronutrienti (g) e l’apporto idrico (ml).'
    } else if (value === 2) {
      string =
        'Viene mostrato per ogni singolo prodotto l’apporto energetico in percentuale, dato da ognuno dei tre macronutrienti sul totale calorico dell’alimento. La somma delle tre percentuali rappresenta infatti il 100% dell’energia fornita.'
    } else if (value === 3) {
      string =
        'Viene mostrata l’incidenza in percentuale delle kilocalorie, di ogni macronutriente e dell’apporto idrico dell’alimento sul totale della dieta. Sommando la percentuale di ogni alimento si ottiene il 100% che rappresenta la totalità della dieta.'
    } else if (value === 4) {
      string =
        'Viene mostrato per ogni singolo prodotto l’apporto energetico in kcal, dato da ognuno dei tre macronutrienti: proteine, lipidi e carboidrati. La somma fornisce le kcal totali dell’alimento.'
    }
    return string
  }

  //#region docs
  async bozzaAnamnesiAlimentare() {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetAnamnesiAlimentareVisita', param: this.idVisita })
      .then((res) => {
        let isDietaSettimanale = false
        if (
          this.dietaSettimanale === true &&
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana &&
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana?.length > 0
          && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != ""
        ) {
          isDietaSettimanale = true
        }
        const obj = {
          pdfFile: this.report.createAnamnesiAlimentare(
            res,
            true,
            isDietaSettimanale,
            this.kcalNonVisibili
          ),
          isReferto: false,
          nomeDocumento: 'Anamnesi alimentare',
          title: 'Bozza anamnesi alimentare',
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

  async bozzaPianoNutrizionale() {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: this.idVisita })
      .then(async (res) => {
        let isDietaSettimanale = false
        if (
          this.dietaSettimanale === true &&
          res.visita?.idTipoAlimentazione === TipoAlimentazione.NaturaleMista &&
          !this.appGen.isNullOrUndefined(res.prodotti?.prodotti[0]?.prodotti[0]?.settimana &&
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana?.length > 0 )
        ) {
          isDietaSettimanale = true
        }
        for (const prodotto of res.prodotti.prodotti) {
          if (prodotto.idConfezionamentoProdotto) {
            prodotto.confezionamentoSelezionato = await firstValueFrom(
              this.confService.getConfezionamentoById(prodotto.idConfezionamentoProdotto)
            )
            prodotto.quantitaConfezionamento =
              prodotto.confezionamentoSelezionato.quantita
            prodotto.unitaMisuraConfezionamento =
              prodotto.confezionamentoSelezionato.unitaMisura
            prodotto.nConfezionamentiDaUtilizzare = Math.ceil(
              prodotto.quantita / prodotto.quantitaConfezionamento
            )
            prodotto.nConfezionamentiReali =
              prodotto.quantita / prodotto.quantitaConfezionamento
          }
        }
        const obj = {
          pdfFile: this.report.createPianoNutrizionale(
            res,
            true,
            isDietaSettimanale,
            this.kcalNonVisibili
          ),
          isReferto: false,
          nomeDocumento: 'Piano nutrizionale',
          title: 'Bozza piano nutrizionale',
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

  async bozzaReferto() {
    //già filtrato in base al tipo alimentazione, lato server
    const res = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisita));

        const obj = {
          pdfFile: this.report.createReferto(res, true, this.kcalNonVisibili),

          nomeDocumento: res.nomeDocumento,
          idVisita: this.idVisita,
          title: 'Bozza referto',
        }

        this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })

  }
  //#endregion
}
