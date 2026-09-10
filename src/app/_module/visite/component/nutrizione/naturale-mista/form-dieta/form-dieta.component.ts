/* eslint-disable no-debugger */

import { Location } from '@angular/common'
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSelect } from '@angular/material/select'
import { ActivatedRoute, Router } from '@angular/router'
import { Options } from '@m0t0r/ngx-slider'
import { getWeekYearWithOptions } from 'date-fns/fp'
import levenshtein from 'fast-levenshtein';
import { ReplaySubject, Subject, firstValueFrom } from 'rxjs'
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import {
  Pasto,
  StepVisita,
  TipoAlimentazione,
  TipoProdotto,
} from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { FiltroProdottiService } from 'src/app/_core/services/prodotti.service'
import { ReportService } from 'src/app/_core/services/report.service'
import {
  SalvaDietaRequest,
  SalvaDietaXpazienteRequest,
} from 'src/app/_module/visite/_dto-visite/dto-visite'
import { ModalAnteprimaComponent } from 'src/app/_module/visite/component/nutrizione/modal-anteprima/modal-anteprima.component'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import { ProdottiService } from 'src/app/_repositories/prodotti_repo.service'
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service'
import {
  ConfirmDialogModel,
  ModalConfirmComponent,
} from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import { ModalInfoProdottiComponent } from 'src/app/shared/modal/modal-info-prodotti/modal-info-prodotti.component'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import Swal from 'sweetalert2'
import _ from 'underscore'

@Component({
  selector: 'app-form-dieta',
  templateUrl: './form-dieta.component.html',
  styleUrls: ['./form-dieta.component.scss'],
})
export class FormDietaComponent implements OnInit {

  //#region Dati


  editorConfig
  pasto = Pasto
  tipoProdotto = TipoProdotto
  formDieta: FormGroup;

  msgErrore: string
  // ID
  idPaziente
  idValutazione
  idDieta
  idVisita
  idNutrizione
  nomeDietaEsistente
  notaPredefinita

  //bool
  salvato = true
  getFromAnamnesi = false
  getFromPianoAlimentare = false
  nutrizioneEsistente = false
  isDettaglioDieta = false
  editProdotti = true
  isDettaglioPianoNutrizionale = false
  showCancelBtn = false
  bEdit = true
  isDietaXpaziente = false
  isNuovaDieta = true
  inError = false
  isStepAnamnesi = false
  anamnesiVisitaPrecedente = false
  pianoAlimentarePrecedente = false
  creatoDaUtenteLoggato = false

  //liste / oggetti
  prodottiSelezionati: any = []
  listaProdotti: any = []
  listaLiquidi: any = []
  listaProdottiArtificiali: any = []
  listaMisura
  listaConclusioniPredefinite
  listaNotePredefinite

  nProdotto = 0

  totKcalSomma = 0
  totProteineSomma = 0
  totAzotoSomma = 0
  totCarboidratiSomma = 0
  totLipidiSomma = 0
  totApportoIdricoSomma = 0

  colazioneTot = 0
  azotoColazione = 0
  proteineColazione = 0
  lipidiColazione = 0
  carboidratiColazione = 0
  acquaColazione = 0

  spuntinoTot = 0
  acquaSpuntino = 0
  azotoSpuntino = 0
  proteineSpuntino = 0
  lipidiSpuntino = 0
  carboidratiSpuntino = 0

  pranzoTot = 0
  azotoPranzo = 0
  acquaPranzo = 0
  proteinePranzo = 0
  lipidiPranzo = 0
  carboidratiPranzo = 0

  merendaTot = 0
  azotoMerenda = 0
  acquaMerenda = 0
  proteineMerenda = 0
  lipidiMerenda = 0
  carboidratiMerenda = 0

  cenaTot = 0
  azotoCena = 0
  proteineCena = 0
  acquaCena = 0
  lipidiCena = 0
  carboidratiCena = 0

  spuntinoSeraleTot = 0
  azotoSpuntinoSerale = 0
  proteineSpuntinoSerale = 0
  acquaSpuntinoSerale = 0
  lipidiSpuntinoSerale = 0
  carboidratiSpuntinoSerale = 0

  liquidiTot = 0
  azotoLiquidi = 0
  proteineLiquidi = 0
  acquaLiquidi = 0
  lipidiLiquidi = 0
  carboidratiLiquidi = 0

  integratoriTot = 0
  azotoIntegratori = 0
  acquaIntegratori = 0
  proteineIntegratori = 0
  lipidiIntegratori = 0
  carboidratiIntegratori = 0

  minLength = 2;

  kcalNonVisibili = false;

  protected _onDestroy = new Subject<void>()
  public filtroProdotti: FormControl = new FormControl(null, Validators.minLength(this.minLength));
  public filtroLiquidi: FormControl = new FormControl(null, Validators.minLength(this.minLength));
  public filtroProdottiArtificiali: FormControl = new FormControl(null, Validators.minLength(this.minLength))
  public prodottiFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public liquidiFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public prodottiArtificialiFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)

  tipoAlimentazione = TipoAlimentazione;

  @ViewChild('selectProdotti', { static: true }) selectProdotti: MatSelect
  @Input() isRiepilogoVisita = false
  @Input() isDaRefertare = false
  @Input() isAnteprima = false
  @Input() fromPianoAlimentare = false
  @Input() fromAnamnesi = false
  @Input() fromListaDiete = false
  @Input() riepilogoVisitaAnamnesi = false
  @Input() stepCorrente
  @Input() idPazienteAnteprima = ''
  @Input() anamnesiObj
  @Input() dataPianoNutrizionale

  stepVisita = StepVisita
  params

  nutrizione
  //slider fabbisogni default
  kcalVal = 0

  optionsKcal: Options = {
    readOnly: this.editProdotti,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  protVal = 0
  optionsProt: Options = {
    readOnly: this.editProdotti,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  azotoVal = 0
  optionsAzoto: Options = {
    readOnly: this.editProdotti,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  lipidiVal = 0
  optionsLipidi: Options = {
    readOnly: this.editProdotti,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  carboidratiVal = 0
  optionsCarboidrati: Options = {
    readOnly: this.editProdotti,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  apportoIdricoVal = 0
  optionsApportoIdrico: Options = {
    readOnly: this.editProdotti,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
    //#endregion Dati

  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public authGuard: AuthGuard,
    private notificate: SnackBarService,
    private backPreviousPage: Location,
    private router: Router,
    private dialog: MatDialog,
    private report: ReportService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private prodottiHttp: ProdottiService,
    private prodServ: FiltroProdottiService,
    private confService: ConfezionamentiService,
    private visitaServ: VisitaRepoService
  ) {}

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges()
  }

  async ngOnInit() {
    this.editorConfig = this.appGen.editorDefaultConfig()
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')
    this.editorConfig.editable = true
    this.editorConfig.showToolbar = true
    if (this.stepCorrente == this.stepVisita.AnamnesiAlimentare) {
      this.isStepAnamnesi = true
    }

    this.generateForm()

    //Liste
    this.getlistaMisura()
    this.getListNotePredefinite()

    await this.getListProdotti()

    let newPianoVisita = false
    this.activateRoute.queryParams.subscribe(async (params) => {
      this.params = params

      //nel caso in cui sono nella visita ho già magari creato un piano alimentare, ma torno indietro nella lista e clicco su nuovo
      if (!this.appGen.isNullOrUndefined(params.new)) {
        newPianoVisita = params.new
      }

      //dettaglio piano nutrizionale
      if (!this.appGen.isNullOrUndefined(this.dataPianoNutrizionale)) {
        this.idPaziente = params.patient
        this.editProdotti = params.edit == 'false' ? false : true

        if (!this.editProdotti) {
          this.formDieta.get('notePianoNutr').disable();
        }
      }

      //dettaglio dieta
      if (!this.appGen.isNullOrUndefined(params.detail)) {
        this.idDieta = params.detail
        this.isDettaglioDieta = true
      }

      //se ho l'idVisita e id paziente sarò in fase di visita del paziente
      if (!this.appGen.isNullOrUndefined(params.visit)) {
        this.idVisita = params.visit

        if (!this.appGen.isNullOrUndefined(this.idPaziente)) {
          this.getListConclusioniPredefinite()

          this.isDietaXpaziente = true

          this.formDieta.controls.nomeDieta.clearValidators()
          this.formDieta.controls.nomeDieta.disable()
          this.formDieta.updateValueAndValidity()

          //sono in fase di visita, mi prendo i valori calcolati per il paziente in base agli step precedenti (esempio kcal da assegnare)
          if (!this.isStepAnamnesi && this.isDietaXpaziente) {
            await this.getNutrizionePrecompiled()
          }
        }

        if (this.isStepAnamnesi) {
          //controllo se esistono anamnesi e/o piani alimentare in caso sono in una visita di controllo in modo da renderli importabili
          this.checkLastPianoAnamnesiExist()

          //controllo se esiste già un anamnesi per questa visita in modo da tirarmi giù eventuale riepilogo
          this.getDettaglioAnamnesi()
        }
      }

      //Mi passo l'id della valutazione nutrizionale in modo da assegnarlo alla dieta del paziente
      if (!this.appGen.isNullOrUndefined(params.vnutr)) {
        this.idValutazione = params.vnutr
      }

      if (!this.appGen.isNullOrUndefined(params.nutrexist)) {
        this.nutrizioneEsistente = params.nutrexist === 'true' ? true : false
        // this.editProdotti = params.nutrexist ==="true"?  false : true
      }

      //sono nello step della compilazione dieta, scelgo da dove importare nel caso in cui ho compilato in visite precedenti una dieta o nell'anamensi della visita
      if (!this.appGen.isNullOrUndefined(params.anamnesi)) {
        this.getFromAnamnesi = true
      }
      if (!this.appGen.isNullOrUndefined(params.piano)) {
        this.getFromPianoAlimentare = true
      }

      if (this.fromListaDiete || this.getFromAnamnesi) {
        //controllo se esiste già un anamnesi per questa visita in modo da tirarmi giù eventuale riepilogo
        this.getDettaglioAnamnesi()

        if (this.fromListaDiete) {
          this.editProdotti = false
        }
      } else {
        // await this.getRiepilogoDietaPaziente()
        if (this.nutrizioneEsistente && !this.riepilogoVisitaAnamnesi) {
          await this.getRiepilogoDietaPaziente()
        }
        // sono in anteprima, quindi ho aperto il popup per visualizzare il dettaglio da importare
        if (this.isAnteprima) {
          this.getAnteprima()
        } else {
          //Sono in riepilogo dieta mi tiro giù i prodotti (quindi non dentro la visita)
          if (
            this.isDettaglioDieta &&
            !this.getFromAnamnesi &&
            !this.nutrizioneEsistente &&
            !this.appGen.isNullOrUndefined(this.idDieta)
          ) {
            this.getDettaglioDieta(this.idDieta)
          } else {
            if (
              !this.appGen.isNullOrUndefined(this.idVisita) &&
              !this.riepilogoVisitaAnamnesi &&
              !this.isRiepilogoVisita &&
              !newPianoVisita
            ) {
              //ho riaperto la visita, controllo che esista
              this.checkVisitaIniziata().then(async () => {
                if (this.nutrizioneEsistente && !this.isStepAnamnesi) {
                  //TODO: zajac la gestione da rifare checkParamEdit è un tapullo per il momento
                  const checkParamEdit = params.edit === 'false' ? false : false
                  if ((this.params.new || this.params.detail) && checkParamEdit) {
                    this.editProdotti = true

                  } else {
                    this.editProdotti = false
                  }

                  if (!this.isDaRefertare) {
                    this.editorConfig.editable = false
                    this.editorConfig.showToolbar = false
                  }

                  this.formDieta.disable();
                  this.colazione.disable();

                  this.formDieta.updateValueAndValidity();
                  this.getRiepilogoDietaPaziente()
                } else {
                  //sono in fase di visita, mi prendo i valori calcolati per il paziente in base agli step precedenti (esempio kcal da assegnare)
                  if (!this.isStepAnamnesi && this.isDietaXpaziente) {
                    await this.getNutrizionePrecompiled()
                  }
                }
              })
            }
          }
        }
      }

      if (this.isRiepilogoVisita) {
        this.editProdotti = false
        if (!this.isDaRefertare) {
          this.editorConfig.editable = false
          this.editorConfig.showToolbar = false
        }
        this.formDieta.disable()
        this.formDieta.updateValueAndValidity()
        if (!this.riepilogoVisitaAnamnesi) {

          this.getRiepilogoDietaPaziente()
        } else {
          this.getDettaglioAnamnesi()
        }
      }

      //Se sono nel dettaglio di un piano nutrizionale

      if (!this.appGen.isNullOrUndefined(this.dataPianoNutrizionale)) {
        this.isDettaglioPianoNutrizionale = true
        this.formDieta.controls.nomeDieta.disable()
        this.formDieta.updateValueAndValidity()

        this.setValueDieta(this.dataPianoNutrizionale)
      }

      this.setFiltriSelect()
    })

    if (!this.appGen.isNullOrUndefined(this.idVisita)) {
      this.checkNoteEsistenti();
    }
  }

  generateForm() {
    this.formDieta = this.formBuilder.group({
      nomeDieta: new FormControl(
        { value: '', disabled: !this.editProdotti || this.isRiepilogoVisita },
        this.isStepAnamnesi ? null : Validators.required
      ),
      colazione: new FormArray([]),
      merenda: new FormArray([]),
      spuntino: new FormArray([]),
      pranzo: new FormArray([]),
      cena: new FormArray([]),
      integratori: new FormArray([]),
      spuntinoSerale: new FormArray([]),
      liquidi: new FormArray([]),
      diagnosi: new FormControl(
        { value: '', disabled: false },
        this.authGuard.canRole(this.appGen.ruolo.Medico) && this.isDietaXpaziente
          ? Validators.required
          : null
      ),
      // note per anamnesi alimentare ?
      note: new FormControl({
        value: '',
        disabled: !this.editProdotti || this.isRiepilogoVisita,
      }),
      //diagnosi sotto anamnesi alimentare
      diagnosiNutrizionale:new FormControl({
        value: '',
        disabled: !this.editProdotti || this.isRiepilogoVisita,
      }),
      notePianoNutr: new FormControl({
        value: '',
        disabled: !this.editProdotti || this.isRiepilogoVisita,
      }),
      noteDietista :new FormControl({
        value: '',
        disabled: !this.authGuard.canRole(this.appGen.ruolo.Dietista) || !this.editProdotti || this.isRiepilogoVisita,
      }),
      conclusioniPredefinite: new FormControl(''),
      notePredefinite: new FormControl(''),
    })
  }

  setFiltriSelect() {
    // listen for search field value changes
    this.filtroProdottiArtificiali.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraProdottiArtificiali()
      })

    // listen for search field value changes
    this.filtroProdotti.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._onDestroy)).subscribe(() => {
      this.filtraProdotti()
    })
    // listen for search field value changes
    this.filtroLiquidi.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._onDestroy)).subscribe(() => {
      this.filtraLiquidi()
    })
  }

  selectedNotePredefinita(nota) {
    this.formDieta.get('notePredefinite').reset()
    if (!this.appGen.isNullOrUndefined(nota)) {
      this.formDieta
        .get('notePianoNutr')
        .setValue(this.formDieta.get('notePianoNutr').value + ' ' + nota)
    }
  }

  //TODO: fare la divisione lato server non FE
  async getListProdotti() {
    this.appGen.loadingPanel.show();
    try {
          //this.listaProdotti = [];
    await this.getProdotti().then(async (data) => {
      data.forEach((element) => {
        //Mi tiro giù tutti i prodotti

        //tutti i prodotti quindi liquidi e solidi tranne integratori li metto dentro la lista prodotti
        if (element.idTipoProdotto != TipoProdotto.Integratori) {
          this.listaProdotti.push(element);
        }

        //filtro le due liste per mostrarle filtrate nei due tab specifici
        switch (element.idTipoProdotto) {
          case TipoProdotto.Liquidi:
            this.listaLiquidi.push(element)

            break
          case TipoProdotto.Integratori:
            this.listaProdottiArtificiali.push(element)
            break

          default:
            break
        }
      })

      this.liquidiFiltrati.next(this.listaLiquidi.slice())
      this.prodottiFiltrati.next(this.listaProdotti.slice())
      this.prodottiArtificialiFiltrati.next(this.listaProdottiArtificiali.slice())
    })
    this.appGen.loadingPanel.hide();
    } catch (error) {
      this.appGen.loadingPanel.hide();
      console.error(error)
      this.notificate.error('Si è verificato un errore durante il recupero dei dati, riprovare');
    }

  }

  async getListConclusioniPredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'conclusioni' })
      .then((data) => {
        this.listaConclusioniPredefinite = data
      })
  }

  async getListNotePredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'note' })
      .then((data) => {
        this.listaNotePredefinite = data
      })
  }

  /**Controllo se la visita è già stata iniziata ed esiste una nutrizione già compilata */
  async checkVisitaIniziata() {
    const obj = {
      idPaziente: this.idPaziente,
      idVisita: this.idVisita,
    }
    await this.service
      .postCallRequest({ action: 'checkVisitaIniziata', param: obj })
      .then((data) => {
        if (data.existVisita) {
          this.nutrizioneEsistente = true
        }
      })
  }

  ngOnDestroy() {
    this._onDestroy.next(null)
    this._onDestroy.complete()
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
            //cancello i prodotti gia selezionati per non avere il problema con i vecchi se rimangono , solo qundo torno in dietro
            const _result: boolean = await firstValueFrom(
              this.prodottiHttp.deletePianoNelVisitaNaturale(this.idVisita)
            )

            this.router.navigate(
              ['/app/visite/piani-alimentari/lista', this.idPaziente],
              { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } }
            )
            // this.editProdotti=true;
          }
        })
      } else {
        this.backPreviousPage.back()
      }
    } catch (error) {
      console.error(error)
    }
  }


  backToList() {
    this.router.navigate(['/app/visite/piani-nutrizionali/lista'])
  }


  protected setInitialValue() {

    this.prodottiFiltrati.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      this.selectProdotti.compareWith = (a: any, b: any) => a && b && a.id === b.id
    })
  }

  get f() {
    return this.formDieta.controls
  }
  get colazione() {
    return this.f.colazione as FormArray
  }
  get spuntino() {
    return this.f.spuntino as FormArray
  }
  get pranzo() {
    return this.f.pranzo as FormArray
  }
  get merenda() {
    return this.f.merenda as FormArray
  }
  get cena() {
    return this.f.cena as FormArray
  }
  get integratori() {
    return this.f.integratori as FormArray
  }
  get spuntinoSerale() {
    return this.f.spuntinoSerale as FormArray
  }
  get liquidi() {
    return this.f.liquidi as FormArray
  }

  /**controllo se esiste già un anamnesi per questa visita in modo da tirarmi giù eventuale riepilogo */
  async getDettaglioAnamnesi() {
    await this.service
      .getCallRequest({ action: 'getDettaglioAnamnesi', param: this.idVisita })
      .then(async (data) => {
        if (data.exist) {
          //TODO: da rivedere flusso e funzione setValueDieta
          if (!this.listaProdotti || this.listaProdotti.length === 0) {
            await this.getListProdotti().then(() => {

              this.setValueDieta(data)
            })
          } else {
            this.setValueDieta(data)
          }

        }
      })
  }

  async importaAnamnesiVisitaPrecedente() {
    const message = `Vuoi riportare l'anamnesi della visita precedente?`
    const obj = {
      message,
      idPaziente: this.idPaziente,
      fromAnamnesi: true,
    }

    const dialogRef = this.dialog.open(ModalAnteprimaComponent, {
      data: obj,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.service
          .getCallRequest({ action: 'prodottixanamnesi', param: this.idPaziente })
          .then((data) => {

            this.setValueDieta(data)
            this.anamnesiVisitaPrecedente = false
            this.salvato = false
          })
      }
    })
  }



  /**Controllo se prima di questa visita è presente un'altra visita e nel caso controllo se ci sono l'anamnesi e/o la nutrizione naturale compilata */
  async checkLastPianoAnamnesiExist() {
    const obj = {
      idVisita: this.idVisita,
    }
    await this.service
      .postCallRequest({ action: 'checkLastPianoAnamnesiExist', param: obj })
      .then((data) => {
        this.anamnesiVisitaPrecedente = data.anamnesiExist
        this.pianoAlimentarePrecedente = data.pianoAlimentare
        this.showCancelBtn = true
      })
  }

  async checkNoteEsistenti(){
    try {
      if (!this.isStepAnamnesi && !this.isAnteprima && !this.isDettaglioPianoNutrizionale) {
        const noteDietista = await firstValueFrom(this.visitaServ.checkNoteDietistaCompilate(this.idVisita));
        this.formDieta.get('noteDietista').setValue(noteDietista);
      }
    } catch (error) {
      this.appGen.notificate.error('È stato riscontrato un problema durante il recupero delle note del dietista')
    }
  }


  async getRiepilogoDietaPaziente() {
    const obj = {
      getVisitaPadre: false,
      idVisita: this.idVisita,
    }

    this.service
      .postCallRequest({ action: 'getVisitaNaturalePaziente', param: obj })
      .then((data) => {
        this.setValueDieta(data)
      })
  }

  async getlistaMisura() {
    await this.service.getCallRequest({ action: 'unitamisura' }).then((data) => {
      //nell'alimentazione non serve che mettiamo come unità di misura gr/g e N/g per cui li rimuovo dalla lista, non li rimuovo dal db perchè li usiamo dalle dipendenze
      data = data.filter((item) => item.id !== 2)
      data = data.filter((item) => item.id !== 3)

      this.listaMisura = data
    })
  }

  async getDettaglioDieta(idDieta) {
    await this.service
      .getCallRequest({ action: 'dieta', param: idDieta })
      .then((data) => {

        this.setValueDieta(data)
      })
  }

  /**sono in fase di visita, mi prendo i valori calcolati per il paziente in base agli step precedenti (esempio kcal da assegnare)*/
  async getNutrizionePrecompiled() {

    //prendo l'alimentazione artificiale per recuperarmi alcuni dati, tipo le kcal

    await this.service
      .getCallRequest({ action: 'getNutrizionePrecompiled', param: this.idVisita })
      .then((data) => {
        this.nutrizione = data

        this.nutrizione.protMin = Math.round(this.nutrizione.protMin)
        this.nutrizione.protMax = Math.round(this.nutrizione.protMax)
        this.nutrizione.azotoMax = Math.round(this.nutrizione.azotoMax)
        this.nutrizione.azotoMin = Math.round(this.nutrizione.azotoMin)
        this.nutrizione.kcalMax = Math.round(this.nutrizione.kcalMax)
        this.nutrizione.kcalMin = Math.round(this.nutrizione.kcalMin)
        this.nutrizione.carboidratiMax = Math.round(this.nutrizione.carboidratiMax)
        this.nutrizione.carboidratiMin = Math.round(this.nutrizione.carboidratiMin)
        this.nutrizione.lipidiMax = Math.round(this.nutrizione.lipidiMax)
        this.nutrizione.lipidiMin = Math.round(this.nutrizione.lipidiMin)

        this.kcalVal = this.nutrizione.kcal
        this.protVal = this.nutrizione.proteine
        this.azotoVal = this.nutrizione.azoto
        this.carboidratiVal = this.nutrizione.carboidrati
        this.lipidiVal = this.nutrizione.lipidi
        this.apportoIdricoVal = this.nutrizione.apportoIdrico

        this.setSliderOptions()
      })
  }

  updateColor(progress, tot) {
    if (progress >= tot) {
      return 'warn'
    } else if (progress <= tot / 2) {
      return 'primary'
    } else if (progress > tot / 2) {
      return 'accent'
    }
  }

  statusKcal(){
    this.kcalNonVisibili = !this.kcalNonVisibili;
  }

  async getAnteprima() {
    // if (!this.isStepAnamnesi) {
    //   await this.service.prodottixanamnesi(this.idRichiesta).then(data => {
    //     this.setValueDieta(data);
    //     if (this.isAnteprima) {
    //       this.editProdotti = false;
    //     }
    //   });
    // } else {

    this.checkLastPianoAnamnesiExist().then(async () => {
      let idPaziente
      if (this.isAnteprima) {
        idPaziente = this.idPazienteAnteprima
      }

      if (this.getFromAnamnesi || this.getFromPianoAlimentare) {
        idPaziente = this.idPaziente
      }

      //ho aperto l'anteprima cliccando sul pulsante importa da piano e importo da lì
      if (this.fromPianoAlimentare) {
        const obj = {
          getVisitaPadre: true,
          idVisita: this.idVisita,
        }
        const data = await firstValueFrom(
          this.visitaServ.getPianoNutrizionalePrecedente(this.idPaziente)
        )
        this.setValueDieta(data)
        this.editProdotti = false
        this.formDieta.disable()
        this.formDieta.updateValueAndValidity()
      }

      //ho aperto l'anteprima cliccando sul pulsante importa da anamnesi e importo da lì
      if (this.fromAnamnesi) {
        await this.service
          .getCallRequest({
            action: 'prodottixanamnesi',
            param: this.idPazienteAnteprima,
          })
          .then((data) => {
            this.setValueDieta(data)
            if (this.isAnteprima) {
              this.editProdotti = false
              this.formDieta.disable()
              this.formDieta.updateValueAndValidity()
            }
          })
      }
    })

    // }
  }

  async getProdotti() {
    const obj = {}
    try {
      this.appGen.loadingPanel.show();
      const data =  await this.service.postCallRequest({ action: 'listaprodotti', param: obj });
      this.appGen.loadingPanel.hide();
      return data;
    } catch (error) {
      console.error(error);
      this.notificate.error('Si è verificato un errore durante il recupero dei dati, riprovare');
      this.appGen.loadingPanel.hide();
    }
  }

  addProdotto(idpasto) {

    let array
    let id

    switch (idpasto) {
      case this.pasto.Colazione:
        array = this.colazione
        id = 'colazione'
        break
      case this.pasto.Spuntino:
        array = this.spuntino
        id = 'spuntino'
        break
      case this.pasto.Pranzo:
        array = this.pranzo
        id = 'pranzo'
        break
      case this.pasto.Merenda:
        array = this.merenda
        id = 'merenda'
        break
      case this.pasto.Cena:
        array = this.cena
        id = 'cena'
        break
      case this.pasto.Integratori:
        array = this.integratori
        id = 'integratori'
        break
      case this.pasto.SpuntinoSerale:
        array = this.spuntinoSerale
        id = 'spuntinoSerale'
        break
      case this.pasto.LiquidiAssunti:
        array = this.liquidi
        id = 'liquidi'
        break

      default:
        break
    }

    array.push(this.initProdotto(idpasto))
    this.appGen.scroll(id)
  }

  initProdotto(idpasto) {
    return this.formBuilder.group({
      Quantita: [
        { value: '', disabled: !this.editProdotti },
        [Validators.min(0), Validators.max(9999)],
      ],
      Kcal: [''],
      Carboidrati: [''],
      Lipidi: [''],
      Proteine: [''],
      Azoto: [''],
      Acqua: [''],
      IdProdotto: [''],
      IdUnitaMisura: [''],
      IdPasto: [idpasto],
      Alternativo: [false],
      IsPercentuale: [false],
      ProdottiAlternativi: this.formBuilder.array([]),
    })
  }

  addProdottiAlternativi(control, j) {
    control.controls.ProdottiAlternativi.push(
      this.formBuilder.group({
        IdProdotto: new FormControl(''),
        IdUnitaMisura: new FormControl(''),
        Quantita: new FormControl({ value: '', disabled: !this.editProdotti }, [
          Validators.min(0),
          Validators.max(9999),
        ]),
        Kcal: new FormControl(''),
        Proteine: new FormControl(''),
        Acqua: new FormControl(''),
        Azoto: new FormControl(''),
        Lipidi: new FormControl(''),
        Carboidrati: new FormControl(''),
        IsPercentuale: new FormControl(false),
        idprodottoxvisita: new FormControl(null)
      })
    )

    this.appGen.scroll('alternativo' + j)
  }

  alternativoCheck(check, i, idpasto, form) {
    if (check.checked) {
      this.addProdottiAlternativi(form, i)
      form.controls.Alternativo.value = true
    } else {
      form.controls.ProdottiAlternativi.controls = []
      form.controls.Alternativo.value = false;
      form.controls.Alternativo.clearValidators();
      form.controls.Alternativo.setErrors(null);
      form.controls.Alternativo.updateValueAndValidity();

      form.controls.ProdottiAlternativi.clearValidators();
      form.controls.ProdottiAlternativi.setErrors(null);
      form.controls.ProdottiAlternativi.updateValueAndValidity();
    }
  }

  modificaProdotti() {
    this.editProdotti = !this.editProdotti;
    if (this.editProdotti) {
      this.formDieta.enable();
      this.editorConfig.editable = true;
      this.editorConfig.showToolbar = true;
      if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
        this.formDieta.get('noteDietista').enable();
      } else if (!this.authGuard.canRole(this.appGen.ruolo.Dietista)){
        this.formDieta.get('noteDietista').disable();
      }
    this.formDieta.updateValueAndValidity()
    this.setSliderOptions()
  }
}


/**
 * Vienie richiamata se sono nel piano nutrizionale se no parte la deleteProdottoAlternativi()
 * @param form
 * @param j
 */
  deleteProdottoAlternativiWarning(form,j){
    try {
      Swal.fire({
        title: 'Attenzione',
        html: 'Cancellando questo prodotto sara aggiornato anche il piano nutrizionale  <br>Vuoi proseguire?',
        icon: 'warning',
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        cancelButtonText: 'No',
        confirmButtonText: 'Si',
      }).then((result) => {
        if (result.isConfirmed) {
         this. deleteProdottoAlternativi(form, j)


        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  async deleteProdottoAlternativi(form, j) {
    try {
      const prodottoDaCancellare=form.controls.ProdottiAlternativi.at(j)
      const idProdottoXPiano = prodottoDaCancellare.controls.idprodottoxvisita.value;
      // se ho id allora prodotto è gia inserito nel piano quindi devo rimuoverlo anche da la altimenti basta cancellare solo dalla lista.
      let deleted =false;
      if(idProdottoXPiano){
   deleted= await firstValueFrom(this.prodottiHttp.deleteProdottiDalPiano([idProdottoXPiano]))

      }
      // se deleted è diverso dal true, entro nel errore
      if(!deleted && idProdottoXPiano)
      {
        throw new Error('prodotto alternativo non è stato cancellato correttamente ')
      }
      form.controls.ProdottiAlternativi.removeAt(j)
      if (form.controls.ProdottiAlternativi.controls.length <= 0) {
        //svuoto per sicurezza l'array e imposto a false la checkbox in modo da togliere il flag sui prodotti alternativi
        form.controls.ProdottiAlternativi.controls = []
        form.controls.Alternativo.setValue(false)
      }
    } catch (error) {
      console.error(error)
      this.notificate.error('prodotto alternativo non è stato cancellato correttamente ')
    }

  }

  /**
 * Vienie richiamata se sono nel piano nutrizionale se no parte la deleteProdottoAlternativi()
 * @param form
 * @param j
 */
  async deleteProdottoWarning(i, pasto) {

    Swal.fire({
      title: 'Attenzione',
      html: 'Cancellando questo prodotto sara aggiornato anche il piano nutrizionale  <br>Vuoi proseguire?',
      icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      cancelButtonText: 'No',
      confirmButtonText: 'Si',
    }).then( (result) => {
      if (result.isConfirmed) {
        this.deleteProdotto(i,pasto);


      }
    })
  }

 async deleteProdotto(i, idpasto) {
  try {
    const array = this.getArrayFormPasto(idpasto);
    const prodottoDaCancellare=array.at(i)
    const idProdottoXPiano = prodottoDaCancellare.controls?.idprodottoxvisita?.value;
    const prodottoSelezionato = prodottoDaCancellare.controls.IdProdotto?.value
    // se ho id allora prodotto è gia inserito nel piano quindi devo rimuoverlo anche da la altimenti basta cancellare solo dalla lista.
    let deleted =false;
    if(idProdottoXPiano){
 deleted= await firstValueFrom(this.prodottiHttp.deleteProdottiDalPiano([idProdottoXPiano]))

    }
    // se ho inserito la nuova riga per il prodotto ma non ho selezionato ancora il prodotto
    if(!idProdottoXPiano)
    {

      deleted=true;
    }

    // se deleted è diverso dal true, entro nel errore
    if(!deleted)
    {
      throw new Error('prodotto non è stato cancellato correttamente ')
    }
    // cancello dal form
    array.removeAt(i)

    i -= i
    // ricalcolo tutti i dati ?
    this.calcolaTot(array, idpasto)
    this.nProdotto--
  } catch (error) {
    console.error(error)
    this.notificate.error('prodotto non è stato cancellato correttamente ')
  }







  // cancella dal form il prodotto

  }

  /**
   * In base pasto recupero la lista corrente tra prodotti, integratori/artificiale e liquidi
   * @param pasto
   * @returns listaProdotti
   */
  getListaFromPasto(pasto) {

    let listaProdotti = []

    switch (pasto) {
      case Pasto.Integratori:
        listaProdotti = this.listaProdottiArtificiali

        break
      case Pasto.LiquidiAssunti:
        listaProdotti = this.listaLiquidi
        break

      default:
        listaProdotti = this.listaProdotti

        break
    }

    return listaProdotti
  }

  getInfoProdotto(form, pasto, i, isAlternativo) {
    const listaProdotti = this.getListaFromPasto(pasto)

    let prodotto

    if (isAlternativo) {
      prodotto = this.appGen.getElementByFilter(
        form.controls.ProdottiAlternativi.value[i].IdProdotto,
        listaProdotti
      )[0]
    } else {
      prodotto = this.appGen.getElementByFilter(
        form.value[i].IdProdotto,
        listaProdotti
      )[0]
    }

    if (this.appGen.isNullOrUndefined(prodotto)) {
      this.notificate.error('Non è stato selezionato un prodotto')
      return
    }

    this.dialog.open(ModalInfoProdottiComponent, {
      data: prodotto,
      panelClass: 'modal-info-prodotti',
    })
  }

  /**
   * In base al pasto assegno il form array alla variabile
   * @param idPasto
   */
  getArrayFormPasto(idPasto) {

    let array
    switch (idPasto) {
      case this.pasto.Colazione:
        array = this.colazione
        break
      case this.pasto.Spuntino:
        array = this.spuntino
        break
      case this.pasto.Pranzo:
        array = this.pranzo
        break
      case this.pasto.Merenda:
        array = this.merenda
        break
      case this.pasto.Cena:
        array = this.cena
        break
      case this.pasto.Integratori:
        array = this.integratori
        break

      case this.pasto.SpuntinoSerale:
        array = this.spuntinoSerale
        break
      case this.pasto.LiquidiAssunti:
        array = this.liquidi
        break
      default:
        break
    }

    return array
  }

  /**
   * Mi costruisco l'array con le categorie e i prodotti all'interno di ciascuna
   */
  getProdottiObj() {


    const obj = []

    this.colazione.value.forEach((pasto) => {
      obj.push(pasto)
    })

    this.spuntino.value.forEach((pasto) => {
      obj.push(pasto)
    })

    this.pranzo.value.forEach((pasto) => {
      obj.push(pasto)
    })

    this.merenda.value.forEach((pasto) => {
      obj.push(pasto)
    })

    this.cena.value.forEach((pasto) => {
      obj.push(pasto)
    })

    this.integratori.value.forEach((pasto) => {
      obj.push(pasto)
    })

    this.spuntinoSerale.value.forEach((pasto) => {
      obj.push(pasto)
    })
    this.liquidi.value.forEach((pasto) => {
      obj.push(pasto)
    })

    return obj
  }

  //essendo tante sezioni, identifico dove riscontro l'errore
  checkErroriPasti() {
    const pasti = []

    if (this.formDieta.controls.colazione.invalid) {
      pasti.push('<strong>colazione</strong>')
    }
    if (this.formDieta.controls.spuntino.invalid) {
      pasti.push('<strong>spuntino</strong>')
    }
    if (this.formDieta.controls.pranzo.invalid) {
      pasti.push('<strong>pranzo</strong>')
    }
    if (this.formDieta.controls.merenda.invalid) {
      pasti.push('<strong>merenda</strong>')
    }
    if (this.formDieta.controls.cena.invalid) {
      pasti.push('<strong>cena</strong>')
    }
    if (this.formDieta.controls.integratori.invalid) {
      pasti.push('<strong>integratori</strong>')
    }
    if (this.formDieta.controls.spuntinoSerale.invalid) {
      pasti.push('<strong>spuntino serale</strong>')
    }
    if (this.formDieta.controls.liquidi.invalid) {
      pasti.push('<strong>liquidi</strong>')
    }
    if (pasti.length > 0) {
      this.msgErrore =
        'Sono presenti errori o campi vuoti nella sezione: ' + pasti.join(', ')
    }
  }

  checkProdotto(prodotto) {
    if (
      this.appGen.isNullOrUndefined(prodotto.IdProdotto) ||
      this.appGen.isNullOrUndefined(prodotto.Quantita) ||
      this.appGen.isNullOrUndefined(prodotto.IdUnitaMisura)
    ) {
      return false
    }
    return true
  }

  /**calcolo le percentuai di ciascun prodotti, di ciascun valore nutrizionale per il totale di quel valore
   * es: (proteine del prodotto / totale somma proteine di tutti i prodotti) *100 e ottengo percentuale
   */
  calcolaPercentuale(value: number, sommaTot: number, checked: boolean) {
    if (checked) {
      if (value == 0) {
        return 0 + '%'
      }
      return Number((value / sommaTot) * 100).toFixed(1) + '%'
    }
    return value
  }

  /**Calcola le percentuali sui totali giornalieri */
  percentualeTotali(value, checked) {
    if (checked) {
      if (value == 0) {
        return 0 + '%'
      }

      if (this.isDietaXpaziente && !this.isStepAnamnesi) {
        //nell'assegnazione dela dieta calcolerò i totali sul fabbisogno di kcal calcolato per la dieta
        return Number((value / this.kcalVal) * 100).toFixed(1) + '%'
      } else {
        //in anamnesi calcolerò i totali sulle kcal totali date dai prodotti
        return Number((value / this.totKcalSomma) * 100).toFixed(1) + '%'
      }
    }
    return value
  }

  set(val, form) {
    if (val) {
      form.controls.forEach((item) => {
        item.controls.IsPercentuale.setValue(true)
      })
    } else {
      form.controls.forEach((item) => {
        item.controls.IsPercentuale.setValue(false)
      })
    }
  }

  async onSubmit(goFoward?: boolean) {

    const obj = this.getProdottiObj()
    if (this.formDieta.invalid) {
      this.appGen.validateAllFormFields(this.formDieta)
      this.checkErroriPasti()
      this.inError = true
      return true
    }

    //per l'anamnesi, se clicco salva e prosegui ma non ho salvato nulla non creo righe vuote
    if (
      obj.length <= 0 &&
      this.isStepAnamnesi &&
      this.appGen.isNullOrUndefined(this.formDieta.get('note').value)
    ) {
      this.salvato = true
      this.showCancelBtn = true
      return
    }

    if (obj.length <= 0 && !this.isStepAnamnesi) {
      this.notificate.error('Selezionare almeno un prodotto')
      this.inError = false
      return true
    }
    this.inError = false

    const request = new SalvaDietaRequest()

    request.Prodotti = obj
    request.Kcal = this.totKcalSomma
    request.Proteine = this.totProteineSomma
    request.Azoto = this.totAzotoSomma
    request.Carboidrati = this.totCarboidratiSomma
    request.Lipidi = this.totLipidiSomma
    request.ApportoIdrico = this.totApportoIdricoSomma
    if (!this.isDietaXpaziente && !this.isStepAnamnesi) {
      request.NomeDieta = this.formDieta.get('nomeDieta').value
    }

    //se è nel dettaglio e la dieta è stata creata dall'utente loggato setto l'id, altrimenti la creo come nuova per l'utente attuale
    if (this.isDettaglioDieta && this.creatoDaUtenteLoggato) {
      request.IdDieta = this.idDieta
    }

    //se sono in salvatagio di una nuova precompilata oppure in update
    if (!this.isDietaXpaziente && !this.isStepAnamnesi) {
      await this.service
        .postCallRequest({ action: 'salvadieta', param: request })
        .then(() => {
          this.router.navigate(['/app/visite/piani-alimentari/lista'])
        })
    }
    if (this.isStepAnamnesi) {
      request.IdVisita = this.idVisita
      request.IdPaziente = this.idPaziente
      request.Lipidi = this.totLipidiSomma
      request.Carboidrati = this.totCarboidratiSomma
      request.ApportoIdrico = this.totApportoIdricoSomma
      request.Note = this.formDieta.get('note').value
      request.DiagnosiNutrizionale= this.formDieta.get('diagnosiNutrizionale').value
      await this.service
        .postCallRequest({ action: 'salvaAnamnesi', param: request })
        .then(() => {
          this.salvato = true
          this.showCancelBtn = true
        })
    }
  }

  async salvaDietaXPaziente() {

    if (this.isDietaXpaziente) {
      //assegno un valore per validare il form poichè nella dieta per paziente non salviamo il nome
      this.formDieta.get('nomeDieta').setValue('dietaPaziente')
    }

    if (
      this.appGen.isNullOrUndefined(this.formDieta.get('diagnosi').value) &&
      this.authGuard.canAccess(this.appGen.permesso.ConcludiVisita)
    ) {
      this.msgErrore =
        'É necessario compilare le <strong> conclusioni </strong> per proseguire'
      this.inError = true
      return
    }

    const obj = this.getProdottiObj();


    if (this.formDieta.invalid) {
      this.appGen.validateAllFormFields(this.formDieta)
      this.checkErroriPasti()

      this.inError = true
      return
    }

    this.inError = false

    if (obj.length <= 0) {
      this.notificate.error('Selezionare almeno un prodotto')
      return
    }
    const request = new SalvaDietaXpazienteRequest()

    request.Prodotti = obj
    request.Kcal = this.kcalVal
    request.Proteine = this.protVal
    request.Carboidrati = this.carboidratiVal
    request.Lipidi = this.lipidiVal
    request.Azoto = this.azotoVal
    request.Diagnosi = this.formDieta.get('diagnosi').value
    request.Note = this.formDieta.get('diagnosiNutrizionale').value
    request.NotePianoNutr = this.formDieta.get('notePianoNutr').value
    request.ApportoIdrico = this.apportoIdricoVal
    // request.IdVisita = this.idVisita;
    request.IdValutazioneNutrizionale = this.idValutazione
    request.IdVisita = this.appGen.isNullOrUndefined(this.idVisita) ? '' : this.idVisita
    request.IdDietaRiferimento = this.appGen.isNullOrUndefined(this.idDieta)
      ? null
      : this.idDieta

    const message = `Vuoi assegnare questo piano alimentare al paziente?`
    const dialogData = new ConfirmDialogModel('Attenzione!', message)
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })


    dialogRef.afterClosed().subscribe(
      await (async (dialogResult) => {
        if (dialogResult) {
          // const _result: boolean = await firstValueFrom(
          //   this.prodottiHttp.deletePianoNelVisitaNaturale(this.idVisita)
          // )
          this.service
            .postCallRequest({ action: 'salvanutrizionenaturale', param: request })
            .then((data) => {
              // this.idVisita = data;
              this.idNutrizione = data
              this.editProdotti = false
              this.formDieta.disable()
              this.formDieta.updateValueAndValidity()
              this.inError = false
              this.editorConfig.editable = false
              this.editorConfig.showToolbar = false
              this.setSliderOptions()


              if(this.authGuard.canRole(this.appGen.ruolo.Dietista)){
                this.salvaNoteDietista();
              }
              // this.router.navigate(['/app/visite/piani-alimentari/dettaglio', this.idPaziente],
              //   { queryParams: { visit: this.idVisita, vnutr: this.idValutazione, nutrexist: true } })//nutrexist: true

              this.router.navigate([], {
                relativeTo: this.activateRoute,
                queryParams: { nutrexist: true },
                queryParamsHandling: 'merge',
              })
            })

        }
      })
    )
  }

  selectedConclusionePredefinita(conclusione) {

    this.formDieta.get('conclusioniPredefinite').reset()

    if (!this.appGen.isNullOrUndefined(conclusione)) {
      this.formDieta
        .get('diagnosi')
        .setValue(this.formDieta.get('diagnosi').value + ' ' + conclusione)
    }
  }

  /**
   * Quando seleziono un prodotto dalla lista assegno i valori all'interno dell'array.
   * Se seleziono un alternativo, dato il prodotto principale, mi ricavo i valori proporzionali
   */
  async setValProdotto(form, idProdotto, i, pasto, prodottoAlternativo?, j?) {
    const listaProdotti = this.getListaFromPasto(pasto)

    const prodotto = await (this.appGen.getElementByFilter(idProdotto, listaProdotti)[0]);

    this.calcolaValoriProdotto(form, pasto, i);

    //Se ho selezionato un alternativo entro qui
    if (prodottoAlternativo != null) {
      prodottoAlternativo.controls.IdUnitaMisura.setValue(prodotto.idUnitaMisura);

      //in questo caso vuol dire che non ho selezionato il prodotto principale e ho aggiunto un alternativo (nel caso il medico facesse prove del genere)
      if (this.appGen.isNullOrUndefined(form.value[i].Kcal)) {
        return
      }

      const param = {
        idProdotto: idProdotto,
        kcal: form.value[i].Kcal,
      }
      await this.service
        .postCallRequest({ action: 'prodottoalternativo', param: param })
        .then((data) => {
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.IdProdotto.setValue(idProdotto)
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Quantita.setValue(
            data.quantita === null
              ? form.value[i].Quantita
              : Math.round(data.quantita + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.IdUnitaMisura.setValue(
            data.idUnitaMisura === null ? form.value[i].IdUnitaMisura : data.idUnitaMisura
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Kcal.setValue(
            data.kcal === null
              ? form.value[i].Kcal
              : Math.round(data.kcal + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Proteine.setValue(
            data.proteine === null
              ? form.value[i].Proteine
              : Math.round(data.proteine + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Azoto.setValue(
            data.azoto === null
              ? form.value[i].Azoto
              : Math.round(data.azoto + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Lipidi.setValue(
            data.lipidi === null
              ? form.value[i].Lipidi
              : Math.round(data.lipidi + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Carboidrati.setValue(
            data.carboidrati === null
              ? form.value[i].Carboidrati
              : Math.round(data.carboidrati + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Acqua.setValue(
            data.acqua === null
              ? form.value[i].Acqua
              : Math.round(data.acqua + Number.EPSILON)
          )
        });
        this.calcolaValoriProdottoAlternativo(form, pasto, i, j)
    }
    ////SE cambia il prodotto principale vado a cambiare anche le sue proprietà, cambia l'alternativo lo fa già sopra
    if (this.appGen.isNullOrUndefined(j)) {
      form.value[i].Kcal = prodotto.kcal
      form.value[i].Proteine =
        prodotto.proteineTotali === null ? 0 : prodotto.proteineTotali
      form.value[i].Azoto = prodotto.azoto == null ? 0 : prodotto.azoto
      form.value[i].Lipidi = prodotto.lipidiTotali == null ? 0 : prodotto.lipidiTotali
      form.value[i].Carboidrati =
        prodotto.glucidiDispon == null ? 0 : prodotto.glucidiDispon
      form.controls[i].controls.IdUnitaMisura.setValue(prodotto.idUnitaMisura)
    }
    // this.calcolaTot(form, pasto, i);
  }

  /**
   * FUNZIONE CHE CALCOLA I VALORI DELLE PROPRIETÀ DELL'ALIMENTO QUANDO VIENE CAMBIATO LA QUANTITÀ DEL PRODOTTO ALTERNATIVO
   * @param form
   * @param pasto
   * @param i INDEX DEL PRODOTTO ORIGINALE
   * @param j INDEX DEL PRODOTTO ALTERNATIVO
   */
  calcolaValoriProdottoAlternativo(form, pasto, i, j) {
    let resProdotto = 0
    let resAzotoProdotto = 0
    let resProteineProdotto = 0
    let resCarboidratiProdotto = 0
    let resLipidiProdotto = 0
    let resAcquaProdotto = 0

    const listaProdotti = this.getListaFromPasto(pasto)

    const prodotto = this.appGen.getElementByFilter(
      form.value[i].ProdottiAlternativi[j].IdProdotto,
      listaProdotti
    )[0]

    if (form.value[i].IdProdotto !== undefined && prodotto.quantita !== undefined) {
      resProdotto = this.appGen.ProporzioneValori(
        prodotto.kcal,
        form.value[i].ProdottiAlternativi[j].Quantita,
        prodotto.quantita
      )
      resProteineProdotto = this.appGen.ProporzioneValori(
        prodotto.proteineTotali,
        form.value[i].ProdottiAlternativi[j].Quantita,
        prodotto.quantita
      )
      resAzotoProdotto = this.appGen.ProporzioneValori(
        prodotto.azoto,
        form.value[i].ProdottiAlternativi[j].Quantita,
        prodotto.quantita
      )
      resCarboidratiProdotto = this.appGen.ProporzioneValori(
        prodotto.glucidiDispon,
        form.value[i].ProdottiAlternativi[j].Quantita,
        prodotto.quantita
      )
      resLipidiProdotto = this.appGen.ProporzioneValori(
        prodotto.lipidiTotali,
        form.value[i].ProdottiAlternativi[j].Quantita,
        prodotto.quantita
      )
      resAcquaProdotto = this.appGen.ProporzioneValori(
        prodotto.acqua,
        form.value[i].ProdottiAlternativi[j].Quantita,
        prodotto.quantita
      )
    }

    switch (pasto) {
      case this.pasto.Colazione:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.colazione.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .patchValue(resProdotto)
          this.colazione.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.colazione.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.colazione.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.colazione.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.colazione.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Merenda:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.merenda.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.merenda.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.merenda.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.merenda.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.merenda.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.merenda.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Pranzo:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.pranzo.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.pranzo.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.pranzo.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.pranzo.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.pranzo.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.pranzo.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Spuntino:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.spuntino.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.spuntino.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.spuntino.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.spuntino.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.spuntino.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.spuntino.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Cena:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.cena.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.cena.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.cena.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.cena.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.cena.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.cena.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Integratori:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.integratori.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.integratori.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.integratori.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.integratori.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.integratori.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.integratori.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break
      case this.pasto.SpuntinoSerale:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.spuntinoSerale.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.spuntinoSerale.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.spuntinoSerale.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.spuntinoSerale.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.spuntinoSerale.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.spuntinoSerale.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }

        break
      case this.pasto.LiquidiAssunti:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value[i].ProdottiAlternativi.length > 0) {
          this.liquidi.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Kcal')
            .setValue(resProdotto)
          this.liquidi.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Proteine')
            .setValue(resProteineProdotto)
          this.liquidi.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Azoto')
            .setValue(resAzotoProdotto)
          this.liquidi.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Lipidi')
            .setValue(resLipidiProdotto)
          this.liquidi.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.liquidi.controls[i]
            .get('ProdottiAlternativi')
            ['controls'][j].get('Acqua')
            .setValue(resAcquaProdotto)
        }
        break

      default:
        break
    }
  }

  async calcolaValoriProdotto(form, pasto, i) {
    let resProdotto = 0
    let resAzotoProdotto = 0
    let resProteineProdotto = 0
    let resCarboidratiProdotto = 0
    let resLipidiProdotto = 0
    let resAcquaProdotto = 0

    const listaProdotti = this.getListaFromPasto(pasto)

    const prodotto = this.appGen.getElementByFilter(
      form.value[i].IdProdotto,
      listaProdotti
    )[0]

    if (form.value[i].IdProdotto !== undefined && prodotto.quantita !== undefined) {
      resProdotto = this.appGen.ProporzioneValori(
        prodotto.kcal,
        form.value[i].Quantita,
        prodotto.quantita
      )
      resProteineProdotto = this.appGen.ProporzioneValori(
        prodotto.proteineTotali,
        form.value[i].Quantita,
        prodotto.quantita
      )
      resAzotoProdotto = this.appGen.ProporzioneValori(
        prodotto.azoto,
        form.value[i].Quantita,
        prodotto.quantita
      )
      resCarboidratiProdotto = this.appGen.ProporzioneValori(
        prodotto.glucidiDispon,
        form.value[i].Quantita,
        prodotto.quantita
      )
      resLipidiProdotto = this.appGen.ProporzioneValori(
        prodotto.lipidiTotali,
        form.value[i].Quantita,
        prodotto.quantita
      )
      resAcquaProdotto = this.appGen.ProporzioneValori(
        prodotto.acqua,
        form.value[i].Quantita,
        prodotto.quantita
      )
    }

    switch (pasto) {
      case this.pasto.Colazione:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.colazione.controls[i].get('Kcal').setValue(resProdotto)
          this.colazione.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.colazione.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.colazione.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.colazione.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.colazione.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Merenda:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.merenda.controls[i].get('Kcal').setValue(resProdotto)
          this.merenda.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.merenda.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.merenda.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.merenda.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.merenda.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Pranzo:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.pranzo.controls[i].get('Kcal').setValue(resProdotto)
          this.pranzo.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.pranzo.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.pranzo.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.pranzo.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.pranzo.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Spuntino:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.spuntino.controls[i].get('Kcal').setValue(resProdotto)
          this.spuntino.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.spuntino.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.spuntino.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.spuntino.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.spuntino.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Cena:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.cena.controls[i].get('Kcal').setValue(resProdotto)
          this.cena.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.cena.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.cena.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.cena.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.cena.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break

      case this.pasto.Integratori:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.integratori.controls[i].get('Kcal').setValue(resProdotto)
          this.integratori.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.integratori.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.integratori.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.integratori.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.integratori.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break
      case this.pasto.SpuntinoSerale:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.spuntinoSerale.controls[i].get('Kcal').setValue(resProdotto)
          this.spuntinoSerale.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.spuntinoSerale.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.spuntinoSerale.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.spuntinoSerale.controls[i]
            .get('Carboidrati')
            .setValue(resCarboidratiProdotto)
          this.spuntinoSerale.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }

        break
      case this.pasto.LiquidiAssunti:
        //setto le kcal, proteine e azoto per il singolo prodotto selezionato
        if (form.value.length > 0) {
          this.liquidi.controls[i].get('Kcal').setValue(resProdotto)
          this.liquidi.controls[i].get('Proteine').setValue(resProteineProdotto)
          this.liquidi.controls[i].get('Azoto').setValue(resAzotoProdotto)
          this.liquidi.controls[i].get('Lipidi').setValue(resLipidiProdotto)
          this.liquidi.controls[i].get('Carboidrati').setValue(resCarboidratiProdotto)
          this.liquidi.controls[i].get('Acqua').setValue(resAcquaProdotto)
        }
        break

      default:
        break
    }

    this.calcolaTot(form, pasto)

    /**
     * Nel caso in cui venga modificata la q.ta del prodotto originale e siano presenti degli alternativi
     * la q.ta e le proprietà delle alternative cambiano di conseguenza a quelli principali
     */
    if (form.controls[i].controls.ProdottiAlternativi.value.length > 0) {

      const lista = form.controls[i].controls.ProdottiAlternativi
      for (let j = 0; j < lista.length; j++) {
        const prod = lista.value[j];
        const idProdotto = prod.IdProdotto;
        const param = {
          idProdotto: idProdotto,
          kcal: form.value[i].Kcal,
        }
        await this.service
        .postCallRequest({ action: 'prodottoalternativo', param: param })
        .then((data) => {

          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.IdProdotto.setValue(idProdotto)
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Quantita.setValue(
            data.quantita === null
              ? form.value[i].Quantita
              : Math.round(data.quantita + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.IdUnitaMisura.setValue(
            data.idUnitaMisura === null ? form.value[i].IdUnitaMisura : data.idUnitaMisura
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Kcal.setValue(
            data.kcal === null
              ? form.value[i].Kcal
              : Math.round(data.kcal + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Proteine.setValue(
            data.proteine === null
              ? form.value[i].Proteine
              : Math.round(data.proteine + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Azoto.setValue(
            data.azoto === null
              ? form.value[i].Azoto
              : Math.round(data.azoto + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Lipidi.setValue(
            data.lipidi === null
              ? form.value[i].Lipidi
              : Math.round(data.lipidi + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Carboidrati.setValue(
            data.carboidrati === null
              ? form.value[i].Carboidrati
              : Math.round(data.carboidrati + Number.EPSILON)
          )
          form.controls[i].controls.ProdottiAlternativi.controls[
            j
          ].controls.Acqua.setValue(
            data.acqua === null
              ? form.value[i].Acqua
              : Math.round(data.acqua + Number.EPSILON)
          )
        })
      }
    }

  }

  /**
   * Utilizzo per calcolare i totali delle kcal, proteine e azoto.
   * Ogni volta che aggiungo un prodotto effettuo di nuovo la chiamata a questa funzione
   */
  async calcolaTot(data, pasto) {
    let resProdotto = 0
    let resAzotoProdotto = 0
    let resProteineProdotto = 0
    let resLipidiProdotto = 0
    let resCarboidratiProdotto = 0
    let resAcquaProdotto = 0
    let tot = 0
    let totAzoto = 0
    let totProteine = 0
    let totLipidi = 0
    let totCarboidrati = 0
    let totAcqua = 0

    const listaProdotti = this.getListaFromPasto(pasto)

    if (data.value.length > 0) {
      for await (const element of data.value) {
        const prodotto = this.appGen.getElementByFilter(
          element.IdProdotto,
          listaProdotti
        )[0]

        if (
          !this.appGen.isNullOrUndefined(element.IdProdotto) &&
          !this.appGen.isNullOrUndefined(prodotto.quantita)
        ) {
          resProdotto = this.appGen.ProporzioneValori(
            prodotto.kcal,
            element.Quantita,
            prodotto.quantita
          )
          resProteineProdotto = this.appGen.ProporzioneValori(
            prodotto.proteineTotali,
            element.Quantita,
            prodotto.quantita
          )
          resAzotoProdotto = this.appGen.ProporzioneValori(
            prodotto.azoto,
            element.Quantita,
            prodotto.quantita
          )
          resLipidiProdotto = this.appGen.ProporzioneValori(
            prodotto.lipidiTotali,
            element.Quantita,
            prodotto.quantita
          )
          resCarboidratiProdotto = this.appGen.ProporzioneValori(
            prodotto.glucidiDispon,
            element.Quantita,
            prodotto.quantita
          )
          resAcquaProdotto = this.appGen.ProporzioneValori(
            prodotto.acqua,
            element.Quantita,
            prodotto.quantita
          )
          tot += resProdotto
          totAzoto += resAzotoProdotto
          totProteine += resProteineProdotto
          totLipidi += resLipidiProdotto
          totCarboidrati += resCarboidratiProdotto
          totAcqua += resAcquaProdotto
        }
      }
    }

    switch (pasto) {
      case this.pasto.Colazione:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.colazioneTot = 0
        this.azotoColazione = 0
        this.proteineColazione = 0
        this.lipidiColazione = 0
        this.carboidratiColazione = 0
        this.acquaColazione = 0

        this.colazioneTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoColazione = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineColazione = Math.round((totProteine + Number.EPSILON) * 100) / 100

        this.carboidratiColazione =
          Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiColazione = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaColazione = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break
      case this.pasto.Merenda:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.merendaTot = 0
        this.azotoMerenda = 0
        this.proteineMerenda = 0
        this.carboidratiMerenda = 0
        this.lipidiMerenda = 0
        this.acquaMerenda = 0

        this.merendaTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoMerenda = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineMerenda = Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiMerenda =
          Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiMerenda = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaMerenda = Math.round((totAcqua + Number.EPSILON) * 100) / 100

        break
      case this.pasto.Pranzo:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.pranzoTot = 0
        this.azotoPranzo = 0
        this.proteinePranzo = 0
        this.carboidratiPranzo = 0
        this.lipidiPranzo = 0
        this.acquaPranzo = 0

        this.pranzoTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoPranzo = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteinePranzo = Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiPranzo = Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiPranzo = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaPranzo = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break
      case this.pasto.Spuntino:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.spuntinoTot = 0
        this.proteineSpuntino = 0
        this.azotoSpuntino = 0
        this.carboidratiSpuntino = 0
        this.lipidiSpuntino = 0
        this.acquaSpuntino = 0

        this.spuntinoTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoSpuntino = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineSpuntino = Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiSpuntino =
          Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiSpuntino = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaSpuntino = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break
      case this.pasto.Cena:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.cenaTot = 0
        this.azotoCena = 0
        this.proteineCena = 0
        this.carboidratiCena = 0
        this.lipidiCena = 0
        this.acquaCena = 0

        this.cenaTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoCena = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineCena = Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiCena = Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiCena = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaCena = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break
      case this.pasto.Integratori:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.integratoriTot = 0
        this.azotoIntegratori = 0
        this.proteineIntegratori = 0
        this.carboidratiIntegratori = 0
        this.lipidiIntegratori = 0
        this.acquaIntegratori = 0

        this.integratoriTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoIntegratori = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineIntegratori = Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiIntegratori =
          Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiIntegratori = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaIntegratori = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break
      case this.pasto.SpuntinoSerale:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.spuntinoSeraleTot = 0
        this.azotoSpuntinoSerale = 0
        this.proteineSpuntinoSerale = 0
        this.carboidratiSpuntinoSerale = 0
        this.lipidiSpuntinoSerale = 0
        this.acquaSpuntinoSerale = 0

        this.spuntinoSeraleTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoSpuntinoSerale = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineSpuntinoSerale =
          Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiSpuntinoSerale =
          Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiSpuntinoSerale = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaSpuntinoSerale = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break
      case this.pasto.LiquidiAssunti:
        //calcolo le kcal, proteine e azoto totali per il pasto
        this.liquidiTot = 0
        this.azotoLiquidi = 0
        this.proteineLiquidi = 0
        this.carboidratiLiquidi = 0
        this.lipidiLiquidi = 0
        this.acquaLiquidi = 0

        this.liquidiTot = Math.round((tot + Number.EPSILON) * 100) / 100
        this.azotoLiquidi = Math.round((totAzoto + Number.EPSILON) * 100) / 100
        this.proteineLiquidi = Math.round((totProteine + Number.EPSILON) * 100) / 100
        this.carboidratiLiquidi =
          Math.round((totCarboidrati + Number.EPSILON) * 100) / 100
        this.lipidiLiquidi = Math.round((totLipidi + Number.EPSILON) * 100) / 100
        this.acquaLiquidi = Math.round((totAcqua + Number.EPSILON) * 100) / 100
        break

      default:
        break
    }

    this.totKcalSomma =
      this.colazioneTot +
      this.spuntinoTot +
      this.pranzoTot +
      this.merendaTot +
      this.cenaTot +
      this.integratoriTot +
      this.spuntinoSeraleTot +
      this.liquidiTot
    this.totProteineSomma =
      this.proteineColazione +
      this.proteineSpuntino +
      this.proteinePranzo +
      this.proteineMerenda +
      this.proteineCena +
      this.proteineIntegratori +
      this.proteineSpuntinoSerale +
      this.proteineLiquidi
    this.totAzotoSomma =
      this.azotoColazione +
      this.azotoSpuntino +
      this.azotoPranzo +
      this.azotoMerenda +
      this.azotoCena +
      this.azotoIntegratori +
      this.azotoSpuntinoSerale +
      this.azotoLiquidi
    this.totLipidiSomma =
      this.lipidiColazione +
      this.lipidiSpuntino +
      this.lipidiPranzo +
      this.lipidiMerenda +
      this.lipidiCena +
      this.lipidiIntegratori +
      this.lipidiSpuntinoSerale +
      this.lipidiLiquidi
    this.totCarboidratiSomma =
      this.carboidratiColazione +
      this.carboidratiSpuntino +
      this.carboidratiPranzo +
      this.carboidratiMerenda +
      this.carboidratiCena +
      this.carboidratiIntegratori +
      this.carboidratiSpuntinoSerale +
      this.carboidratiLiquidi
    this.totApportoIdricoSomma =
      this.acquaColazione +
      this.acquaSpuntino +
      this.acquaPranzo +
      this.acquaMerenda +
      this.acquaCena +
      this.acquaIntegratori +
      this.acquaSpuntinoSerale +
      this.acquaLiquidi
  }

  async setValueDieta(data) {
    this.appGen.loadingPanel.show();
    if (!this.appGen.isNullOrUndefined(data.dieta)) {
      if (!this.appGen.isNullOrUndefined(data.dieta.creatoDaUtenteLoggato)) {
        this.creatoDaUtenteLoggato = data.dieta.creatoDaUtenteLoggato
      }

      //se è stato creato dall'utente attualmente loggato allora setto il nome e posso modificarlo
      //altrimenti l'utente dovrà specificare un nome e verrà salvato come sua dieta
      if (this.creatoDaUtenteLoggato) {
        this.formDieta.get('nomeDieta').setValue(data.dieta.dieta)
      } else {
        this.nomeDietaEsistente = data.dieta.dieta
      }
    }
    if (!this.appGen.isNullOrUndefined(data.anamnesi)) {

      this.formDieta.get('note').setValue(data.anamnesi.note)
      this.formDieta.get('diagnosiNutrizionale').setValue(data.anamnesi.diagnosiNutrizionale)
    }

    if (this.isDettaglioPianoNutrizionale) {
      this.formDieta.get('notePianoNutr').setValue(data.pianoNutrizionale.note)
    }

    if (
      !this.appGen.isNullOrUndefined(data.nutrizione) &&
      !this.isAnteprima &&
      !this.isStepAnamnesi
    ) {
      this.kcalVal = data.nutrizione.kcal
      this.protVal = data.nutrizione.proteine
      this.azotoVal = data.nutrizione.azoto
      this.carboidratiVal = data.nutrizione.carboidrati
      this.lipidiVal = data.nutrizione.lipidi
      this.apportoIdricoVal = data.nutrizione.apportoIdrico

      this.setSliderOptions()

      this.formDieta.get('diagnosi').setValue(data.diagnosi)

      this.formDieta.get('note').setValue(data.nutrizione.note)
      this.formDieta.get('notePianoNutr').setValue(data.notePianoNutr)

      if (!this.appGen.isNullOrUndefined(data.nutrizione.idDietaRiferimentoNavigation)) {
        this.formDieta
          .get('nomeDieta')
          .setValue(data.nutrizione.idDietaRiferimentoNavigation.dieta)
      }
    }

    //Mi arrivano le 5 categorie di pasti: colazione, merenda, pranzo, spuntino, cena
    //Ciclo le categorie e ciclo i prodotti all'interno della categoria e li inserisco nell'array


    /**TODO: Verificare se dovesse rompersi in eguito ai cambi di alcune funzioni apportati il 15/11 */

    for (let i = 0; i < data.categorie.prodotti.length; i++) {
      const array = this.getArrayFormPasto(data.categorie.prodotti[i].id)
      //** Risolve problemi del doppioni quando salvo piano alimentare o inserisco anamnesi alimentare partendo dalla dieta predefinita*/
      array.controls = []

      let prodottoCount = 0 //per ogni prodotto parto dal primo prodotto e vado avanti (lo utilizzo per poi assegnare i suoi alternativi)
      for await (const prodotto of data.categorie.prodotti[i].prodotti) {

        array.push(
          this.formBuilder.group({
            Kcal: [prodotto.kcal],
            Proteine: [prodotto.proteine],
            Azoto: [prodotto.azoto],
            Quantita: [prodotto.quantita, [Validators.min(0), Validators.max(9999)]],
            Acqua: [prodotto.acqua],
            Carboidrati: [prodotto.carboidrati],
            Lipidi: [prodotto.lipidi],
            IdProdotto: [prodotto.idProdotto],
            IdUnitaMisura: [prodotto.idUnitaMisura],
            IdPasto: [prodotto.idPasto],
            Alternativo: [prodotto.prodottiAlternativi.length > 0 ? true : false],
            IsPercentuale: [false],
            ProdottiAlternativi: this.formBuilder.array([]),
            idprodottoxvisita: [prodotto.idprodottoxvisita]
          })
        )

        //Guardo se ho prodotti alternativi e ciclo
        if (prodotto.prodottiAlternativi.length > 0) {
          for (let j = 0; j < prodotto.prodottiAlternativi.length; j++) {
            //per ogni prodotto nella categoria di pasto se ho prodotti alternativi faccio un push dell'oggetto nell'array prodottiAlternativi
            array.controls[prodottoCount].controls.ProdottiAlternativi.push(
              this.formBuilder.group({
                Quantita: [
                  prodotto.prodottiAlternativi[j].quantita,
                  [Validators.min(0), Validators.max(9999)],
                ],
                IdProdotto: [prodotto.prodottiAlternativi[j].idProdotto],
                IdUnitaMisura: [prodotto.prodottiAlternativi[j].idUnitaMisura],
                Proteine: [prodotto.prodottiAlternativi[j].proteine],
                Azoto: [prodotto.prodottiAlternativi[j].azoto],
                Kcal: [prodotto.prodottiAlternativi[j].kcal],
                Carboidrati: [prodotto.prodottiAlternativi[j].carboidrati],
                Lipidi: [prodotto.prodottiAlternativi[j].lipidi],
                Acqua: [prodotto.prodottiAlternativi[j].acqua],
                IsPercentuale: [false],
                idprodottoxvisita: [prodotto.prodottiAlternativi[j].idprodottoxvisita]
              })
            )
          }
        }
        prodottoCount++
      }

      this.calcolaTot(array, data.categorie.prodotti[i].id)
    }
    this.appGen.loadingPanel.hide();
  }

  async concludiVisita() {
    const obj = this.getProdottiObj();
    if (obj.length <= 0 && !this.isStepAnamnesi) {
      this.notificate.error('Selezionare almeno un prodotto')
      this.inError = false
      return true
    }

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
              idTipoAlimentazione: TipoAlimentazione.NaturaleMista
            }

            this.salvaNoteDietista();
            await this.service.postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj }).then(() => {
              this.router.navigate(['/app/visite/step/conclusioni', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione,  } })
            });
          } else if (this.authGuard.canRole(this.appGen.ruolo.Medico)){
              const conclusioni = this.formDieta.get('diagnosi').value;
              if (!this.appGen.isNullOrUndefined(conclusioni) && conclusioni.trim() !== '') {
                this.service
                .putCallRequest({ action: 'concludiVisita', param: this.idVisita })
                .then(() => {
                  this.router.navigate(['/app/visite/riepilogo', this.idPaziente], {
                    queryParams: { visit: this.idVisita, showKcal: !this.kcalNonVisibili },
                  })
                })
              } else if(this.appGen.isNullOrUndefined(conclusioni) || conclusioni.trim() === ''){
                this.notificate.warning('Il campo conclusioni è obbligatorio per proseguire, cliccare su "modifica" per abilitare il campo e poterlo compilare')
              }

            }
        }
      })
    )
  }


  /**
   * Filtro che usa la lev. distance
   * @returns Una lista di prodotti che contengono il valore cercato;
   */
  protected filtraProdotti() {
    if (!this.listaProdotti) {
      return
    }
    // get the search keyword
    let search = this.filtroProdotti.value;
    //

    if (!search || search < this.minLength) {
      this.prodottiFiltrati.next(this.listaProdotti.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    let listaFiltrata: any = [];
    listaFiltrata = this.prodServ.filtroProdotti(search, this.listaProdotti);
    // Se è lunga almeno 2 caratteri filtra attraverso il service;
    if (search.length >= this.minLength) {
      this.prodottiFiltrati.next(listaFiltrata.slice());
    }
  }

    /**
   * Filtro che usa la lev. distance
   * @returns Una lista di prodotti che contengono il valore cercato;
   */
  protected filtraLiquidi() {
    if (!this.listaLiquidi) {
      return
    }
    // get the search keyword
    let search = this.filtroLiquidi.value
    if (!search) {
      this.liquidiFiltrati.next(this.listaLiquidi.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    let listaFiltrata: any = [];
    listaFiltrata = this.prodServ.filtroProdotti(search, this.listaLiquidi);
    // Se è lunga almeno 2 caratteri filtra attraverso il service;
    if (search.length >= this.minLength) {
      this.liquidiFiltrati.next(listaFiltrata.slice());
    }

  }

    /**
   * Filtro che usa la lev. distance
   * @returns Una lista di prodotti che contengono il valore cercato;
   */
  protected filtraProdottiArtificiali() {
    if (!this.listaProdottiArtificiali) {
      return
    }
    // get the search keyword // inserito collegamrento con prodotti artificiali
    let search = this.filtroProdottiArtificiali.value

    if (!search) {
      this.prodottiArtificialiFiltrati.next(this.listaProdottiArtificiali.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    let listaFiltrata: any = [];
    listaFiltrata = this.prodServ.filtroProdotti(search, this.listaProdottiArtificiali);
    // Se è lunga almeno 2 caratteri filtra attraverso il service;
    if (search.length >= this.minLength) {
      this.prodottiArtificialiFiltrati.next(listaFiltrata.slice());
    }

  }

  async salvaPianoNutrizionale() {
    const prodotti = this.getProdottiObj();

    if (prodotti.length <= 0) {
      this.notificate.error('Selezionare almeno un prodotto')
      return
    }

    if (this.formDieta.invalid) {
      this.appGen.validateAllFormFields(this.formDieta)
      this.checkErroriPasti()
      this.inError = true
      return
    }
    const obj = {
      Prodottixvisita: prodotti,
      IdPianoNutrizionale: this.dataPianoNutrizionale.pianoNutrizionale.id,
      IdPaziente: this.idPaziente,
      IdTipoAlimentazione: TipoAlimentazione.NaturaleMista,
      NotePianoNutr: this.formDieta.get('notePianoNutr').value,
    }

    await this.service
      .postCallRequest({ action: 'insertUpdatePianoNutrizionale', param: obj })
      .then(() => {
        this.backPreviousPage.back()
      })
  }

  setSliderOptions() {
    this.optionsKcal = {
      readOnly: !this.editProdotti,
      floor: this.nutrizione.kcalMin,
      ceil: this.nutrizione.kcalMax,
      tickStep: 100,
      showSelectionBarFromValue: 0,
    }

    this.optionsProt = {
      readOnly: !this.editProdotti,
      floor: this.nutrizione.protMin,
      ceil: this.nutrizione.protMax,
      tickStep: 20,
      showSelectionBarFromValue: 0,
    }
    this.optionsAzoto = {
      readOnly: !this.editProdotti,
      floor: this.nutrizione.azotoMin,
      ceil: this.nutrizione.azotoMax,
      tickStep: 2,
      showSelectionBarFromValue: 0,
    }

    this.optionsLipidi = {
      readOnly: !this.editProdotti,
      floor: this.nutrizione.lipidiMin,
      ceil: this.nutrizione.lipidiMax,
      tickStep: 2,
      showSelectionBarFromValue: 0,
    }

    this.optionsCarboidrati = {
      readOnly: !this.editProdotti,
      floor: this.nutrizione.carboidratiMin,
      ceil: this.nutrizione.carboidratiMax,
      tickStep: 2,
      showSelectionBarFromValue: 0,
    }

    this.optionsApportoIdrico = {
      readOnly: !this.editProdotti,
      floor: 0,
      ceil: this.nutrizione.apportoIdrico + 1000,
      tickStep: 2,
      showSelectionBarFromValue: 0,
    }
  }

  async bozzaReferto() {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetRefertoVisita', param: this.idVisita })
      .then((res) => {
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
      })
  }
async bozzaAnamnesiAlimentare(){
      //già filtrato in base al tipo alimentazione, lato server
      await this.service.getCallRequest({ action: 'GetAnamnesiAlimentareVisita', param: this.idVisita }).then((res) => {
        const obj = {
          pdfFile: this.report.createAnamnesiAlimentare(res, true, this.kcalNonVisibili),
          isReferto: false,
          nomeDocumento: 'Anamnesi alimentare',
          title: 'Bozza anamnesi alimentare'

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

  async bozzaPianoNutrizionale(){
      //già filtrato in base al tipo alimentazione, lato server
      await this.service.getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: this.idVisita }).then(async (res) => {

        let isDietaSettimanale = false;
        if (res.visita?.idTipoAlimentazione === this.tipoAlimentazione.NaturaleMista
          && !this.appGen.isNullOrUndefined(res.prodotti.prodotti[0].prodotti[0].settimana
            && res.prodotti.prodotti[0].prodotti[0]?.settimana[0].trim() != "")) {
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
          pdfFile: this.report.createPianoNutrizionale(res, true, isDietaSettimanale, this.kcalNonVisibili),
          isReferto: false,
          nomeDocumento: 'Piano nutrizionale',
          title: 'Bozza piano nutrizionale'

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

  /**
   * Funzione che salva le note del dietista
   */
  async salvaNoteDietista(){
    try {
      const note = this.formDieta.get('noteDietista').value;

      const obj = {
        idVisita : this.idVisita,
        note: note
      }
      await firstValueFrom(this.visitaServ.salvaNoteDietista(obj));
      this.formDieta.get('noteDietista').disable()
    } catch (error) {
      console.error('error');
      this.appGen.notificate.error('È stato riscontrato un problema durante il salvataggio delle no')
    }

  }

}


