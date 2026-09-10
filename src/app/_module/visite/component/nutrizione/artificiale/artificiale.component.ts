import { Location } from '@angular/common'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast'
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { AngularEditorConfig } from '@kolkov/angular-editor'
import { Options } from '@m0t0r/ngx-slider'
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom, takeUntil } from 'rxjs'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import {
  TipoAlimentazione,
  TipoNutrizioneArtificiale,
  TipoProdotto,
} from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { FiltroProdottiService } from 'src/app/_core/services/prodotti.service'
import { ReportService } from 'src/app/_core/services/report.service'
import { ModalCreaSaccaComponent } from 'src/app/_module/prodotti/component/miscele/modal-crea-sacca/modal-crea-sacca.component'
import { ModalInfoMiscelaComponent } from 'src/app/_module/prodotti/component/miscele/modal-info-miscela/modal-info-miscela.component'
import { TabellaProdottiComponent } from 'src/app/_module/visite/component/nutrizione/tabella-prodotti/tabella-prodotti.component'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service'
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service'
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import { ModalInfoProdottiComponent } from 'src/app/shared/modal/modal-info-prodotti/modal-info-prodotti.component'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import Swal from 'sweetalert2'
import _, { object } from 'underscore'

@Component({
  selector: 'app-artificiale',
  templateUrl: './artificiale.component.html',
  styleUrls: ['./artificiale.component.scss'],
})
export class ArtificialeComponent implements OnInit {
  @Input() isDaRefertare
  @Input() dataPianoNutrizionale
  @Input() isRiepilogoStorico !: boolean
  formArtificiale: FormGroup

  @ViewChild(TabellaProdottiComponent, { static: false })
  private tabellaProdottiComponent: TabellaProdottiComponent
  @ViewChild('ProdottoSelezionato') ProdottoSelezionato

  //ID
  idPaziente
  idVisitaUtente
  idValutazioneNutrizionale
  idNutrizione
  idGara

  tipoProdotto = TipoProdotto
  TipoAlimentazioneArtificiale = TipoNutrizioneArtificiale
  idTipoAlimentazioneArtificiale
  params
  msgErrore: string
  //Boolean
  mostraSacche = false
  stepVisita = true
  panelOpenState = false
  bEdit = true
  editProdotti = true
  inError = false
  isRiepilogo = false
  isAccettata = false
  isLoaded = false
  nutrizioneEsistente = false
  isDietaXpaziente = false
  isStoricoCruscotto = true
  pianoNutrizionaleExist = true
  misceleVisibili = false;
  //Liste
  listaTipiSonda: any = []
  listaCalibriSonda: any = []
  listaProdotti: any = []
  listaDisfagia: any = []
  listaGare: any = []
  listaGradiDisfagia: any = []
  listaMetodiSomministrazione: any = []
  listaConclusioniPredefinite: any = []
  listaTipoAlimentazioneArtificiale: any = []
  listaDimensioneSonda: any = []

  //Obj
  nutrizioneArtificiale
  valutazioneNutrizionale
  AlimentazioneArtificialeValue
  prodottiSelezionati: any = []
  notePianoNutr: string

  kcalVal = 0
  protVal = 0
  azotoVal = 0
  apportoIdricoVal = 0

  kcalNonVisibili = false;

  optionsKcal: Options = {
    readOnly: this.isRiepilogo,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }

  optionsProt: Options = {
    readOnly: this.isRiepilogo,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  optionsAzoto: Options = {
    readOnly: this.isRiepilogo,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }
  optionsApportoIdrico: Options = {
    readOnly: this.isRiepilogo,
    showTicksValues: true,
    floor: 0,
    ceil: 0,
  }

  minLength = 2;

  editorConfig: AngularEditorConfig;
  protected _onDestroy = new Subject<void>();
  isDettaglioPianoNutrizionale = false;
  public filtroProdotti: FormControl = new FormControl(null, Validators.minLength(this.minLength));
  listaProvvisoria  = [];


  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private report: ReportService,
    private backPreviousPage: Location,
    public authGuard: AuthGuard,
    private prodServ: FiltroProdottiService,
    private confService: ConfezionamentiService,
    private visitaServ : VisitaRepoService,
    private documentHttp: DocumentiService
  ) {
    //dizionari per select
    this.getTipoAlimentazioneArtificiale()
    this.getGare()
    this.getTipiSonda()
    this.getListaCalibro()
  }

  ngOnInit() {
    this.editorConfig = this.appGen.editorDefaultConfig()

    /**
     * Sono in riepilogo piano nutrizionale
     * utilizzo il form artificiale dove faccio la gestione dei prodotti
     * nascondo quello che non mi serve
     */
    if (!this.appGen.isNullOrUndefined(this.dataPianoNutrizionale)) {
      this.isDettaglioPianoNutrizionale = true

      //se esiste la nutrizione, prendo i dati della visita riguardanti a di kcal, prot, azoto e acqua calcolati dalla visita
      if (
        !this.appGen.isNullOrUndefined(this.dataPianoNutrizionale.nutrizioneArtificiale)
      ) {
        this.selectedTipoAlimentazione(
          this.dataPianoNutrizionale.nutrizioneArtificiale.idArtificiale
        )
        this.prodottiSelezionati = this.dataPianoNutrizionale.prodotti.prodotti

        this.kcalVal = this.dataPianoNutrizionale.nutrizioneArtificiale.kcal
        this.protVal = this.dataPianoNutrizionale.nutrizioneArtificiale.proteine
        this.azotoVal = this.dataPianoNutrizionale.nutrizioneArtificiale.azoto
        this.apportoIdricoVal =
          this.dataPianoNutrizionale.nutrizioneArtificiale.apportoIdrico
        this.notePianoNutr = this.dataPianoNutrizionale.pianoNutrizionale.note
      } else {
        this.pianoNutrizionaleExist = false
      }
    } else {
      this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')
    }

    this.activateRoute.queryParams.subscribe((params) => {
      if (!this.appGen.isNullOrUndefined(params)) {
        //dettaglio piano nutrizionale
        if (!this.appGen.isNullOrUndefined(this.dataPianoNutrizionale)) {
          this.idPaziente = params.patient
          this.editProdotti = params.edit == 'false' ? false : true
        } else {
          //sono in fase di visita normale/riepilogo

          this.idVisitaUtente = params.visit
          this.isDietaXpaziente = true
          this.params = params
          //ho riaperto la visita
          if (params.nutrexist) {
            this.nutrizioneEsistente = true
          }
          if (params.vnutr) {
            this.idValutazioneNutrizionale = params.vnutr
          }
        }
      }
    })

    this.generateForm()
    if (!this.isDettaglioPianoNutrizionale) {
      //allora mi trovo nella visita normale
      if (!this.appGen.isNullOrUndefined(this.isRiepilogoStorico)) {
        if (this.isRiepilogoStorico) {
          if (!this.isDaRefertare) {
            this.editorConfig.editable = false
            this.editorConfig.showToolbar = false
          }
          //this.noteDietista.disable();
          this.formArtificiale.disable()
          this.formArtificiale.updateValueAndValidity()
        }
      }
      this.editorConfig.editable = true
      this.editorConfig.showToolbar = true

      this.getListConclusioniPredefinite()
      this.getAlimentazioneArtificiale()

      //controllo se esiste già una nutrizione artificiale compilata per questo paziente
      this.checkNutrizioneEsistente()
    }
    this.setFiltriSelect();
    this.checkNoteEsistenti();

  }

  ngOnChanges(changes) {
    if (!this.appGen.isNullOrUndefined(changes.prodottiSelezionati)) {
      this.prodottiSelezionati = changes.prodottiSelezionati.currentValue
    }
  }

  ///APPLIACZIONE DEI FILTRI
  setFiltriSelect(){
    this.filtroProdotti.valueChanges
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._onDestroy))
      .subscribe(()=> {
      this.filtraProdotti();
      })

  }


  /**
   * Filtra i prodotti per lev. distance;
   * La lista provvisoria passa poi per la funzione returnFiltered() che prende la lista e la smista in sacche e integratori;
   */
  protected filtraProdotti(){
    if (!this.listaProdotti) {
      return;
    }
    let search = this.filtroProdotti.value;

    /// IL PARAMETRO DI RICERCA DEVE ESSERE DI ALMENO this.minLength LETTERE(2);
    if (!search || search.length < this.minLength) {
      this.listaProvvisoria = this.listaProdotti;
      return
    }else{
      search = search.toLowerCase();
    }

    if (search.length >= this.minLength) {
      this.listaProvvisoria = this.prodServ.filtroProdotti(search, this.listaProdotti);
    }

  }

  generateForm() {
    this.formArtificiale = this.formBuilder.group({
      kcal: new FormControl(''),
      proteine: new FormControl(''),
      azoto: new FormControl(''),
      apportoIdrico: new FormControl(''),
      artificiale: new FormControl(''),
      metodoSomministrazione: new FormControl(''),
      dataInizioNE: new FormControl(''),
      disfagia: new FormControl(''),
      gradoDisfagia: new FormControl(''),
      tipoSonda: new FormControl(''),
      dimensioneSonda: new FormControl(''),
      calibroSonda: new FormControl(''),
      dataPosizionamento: new FormControl(''),
      alimentazioneOS: new FormControl(false),
      gara: new FormControl(null),
     /* diagnosi: new FormControl(
        '',
        this.authGuard.canRole(this.appGen.ruolo.Medico) ? Validators.required : null
      ),*/
      note: new FormControl(''),
      tipoCatetereParenterale: new FormControl(''),
      conclusioniPredefinite: new FormControl(''),
      validitaPiano: new FormControl(30, [
        Validators.pattern("[0-9]+"),
        Validators.min(1),
        Validators.max(365),
        Validators.required,
      ]),
      prodotti: new FormArray([]),
      noteDietista : new FormControl({
        value : '',
        disabled : !this.authGuard.canRole(this.appGen.ruolo.Dietista) || !this.editProdotti || this.isRiepilogoStorico || this.isRiepilogo
      })
    })
  }

  get f() {
    return this.formArtificiale.controls
  }
  get t() {
    return this.f.prodotti as FormArray
  }
  get formArtificialeControls() {
    return this.formArtificiale.controls
  }

  async addProdotto(prodotto) {
    if (this.appGen.isNullOrUndefined(prodotto)) {
      return
    }

    const objProdotto = {
      kcal: prodotto.kcal,
      proteine: prodotto.proteineTotali,
      azoto: prodotto.azoto,
      quantita: prodotto.quantita,
      quantitaBase: prodotto.quantitaBase,
      velocitaSomministrazione: 0,
      acqua: prodotto.acqua,
      idProdotto: prodotto.id,
      idprodottoxvisita: null,
      percentuale: prodotto.percentuale,
      idUnitaMisura: prodotto.idUnitaMisura,
      unitaMisura: prodotto.unitaMisura,
      codiceProdotto: prodotto.codiceProdotto,
      prodotto: prodotto.prodotto,
      idTipoProdotto: prodotto.idTipoProdotto,
      metodoAssunzione: '',
      confezionamenti: [],
      recordEliminato: false, //IMPORTANTE: deve essere passato sempre
    }




    this.prodottiSelezionati =
      this.tabellaProdottiComponent && this.tabellaProdottiComponent.prodottiDataSource
        ? this.tabellaProdottiComponent.prodottiDataSource.data
        : []
    this.prodottiSelezionati.push(objProdotto)

    if (!this.appGen.isNullOrUndefined(this.tabellaProdottiComponent)) {
      this.tabellaProdottiComponent.generateTable();
      //this.tabellaProdottiComponent.ngOnInit();
    }else if(this.appGen.isNullOrUndefined(this.appGen.isNullOrUndefined(this.tabellaProdottiComponent))){
      this.onSubmit();
    }

    this.ProdottoSelezionato.value = null;


  }
  ///TODO: Verificare x cosa viene usato delete

  modificaProdotti() {
    this.editProdotti = true;
  }

  async saveProduct(form: FormGroup) {
    if (form.value.prodotti.length <= 0) {
      this.appGen.notificate.error('Selezionare almeno un AFMS')
      return
    }

    const obj = {
      Prodotti: form.value.prodotti,
      Kcal_tot: this.kcalVal,
    }
    await this.service
      .postCallRequest({ action: 'valoriprodotti', param: obj })
      .then((data) => {
        this.editProdotti = false
        this.prodottiSelezionati = data
      })
  }

  modificaNutrizione() {

    this.bEdit = !this.bEdit
    this.isRiepilogo = !this.isRiepilogo
    this.editProdotti = !this.editProdotti
    this.formArtificiale.enable()
    this.editorConfig.editable = true
    this.editorConfig.showToolbar = true
    this.formArtificiale.updateValueAndValidity()
    this.setSliderOptions();

    if (this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
      this.formArtificiale.get('noteDietista').enable();
    }else{
      this.formArtificiale.get('noteDietista').disable();
    }
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges()
  }

  async getAlimentazioneArtificiale() {
    //infine prendo l'alimentazione artificiale tramite l'id della visita
    this.getNutrizionePrecompiled()
  }

  async checkNutrizioneEsistente(fromOnSubmit = false) {
    const obj = {
      IdVisita: this.idVisitaUtente,
      IdPaziente: this.idPaziente,
      IdValutazioneNutrizionale: this.idValutazioneNutrizionale,
    }

    await this.service
      .postCallRequest({ action: 'checkNutrizioneArtificialeEsistente', param: obj })
      .then((data) => {
        if (data) {
          this.idNutrizione = data.idNutrizione
          this.bEdit = false
          this.isRiepilogo = true
          this.editProdotti = false
          if (!this.isDaRefertare) {
            this.editorConfig.editable = false
            this.editorConfig.showToolbar = false
          }
          this.formArtificiale.disable()
          this.formArtificiale.updateValueAndValidity()

          setTimeout(() => {
            if (!this.appGen.isNullOrUndefined(this.tabellaProdottiComponent)) {
              this.tabellaProdottiComponent.prodotti = data.prodotti

              this.tabellaProdottiComponent.note = data.notePianoNutr

              this.tabellaProdottiComponent.stepVisita = false
              this.tabellaProdottiComponent.isRiepilogo = true
              if (fromOnSubmit === true) {
                this.tabellaProdottiComponent.generateTable()
                this.tabellaProdottiComponent.refreshTable()
              }
            }
          }, 0)

          this.setValueForm(data)

          if (!this.appGen.isNullOrUndefined(data.prodotti)) {

            this.setGara(data.idgara);
            this.prodottiSelezionati = data.prodotti;
          }
        } else {
          // this.addProdotto();
          //Setto i valori iniziali come il peso, bmi ecc. per compilare la nutrizione
          this.getAlimentazioneArtificiale()
        }
      })
  }


  async checkNoteEsistenti(){
    if (this.isDettaglioPianoNutrizionale === false) {
      try {
        const noteDietista = await firstValueFrom(this.visitaServ.checkNoteDietistaCompilate(this.idVisitaUtente));
        this.formArtificiale.get('noteDietista').setValue(noteDietista)
      } catch (error) {
        this.appGen.notificate.error('È stato riscontrato un problema durante il recupero delle note del dietista')
      }
    }
  }

  statusKcal(){
    this.kcalNonVisibili = !this.kcalNonVisibili;
  }

  async getInfo(prodotto) {
    if (prodotto.idTipoProdotto == TipoProdotto.SacchePersonalizzate) {
      const objRequest = {
        action: 'getprodotto',
        param: prodotto.id,
      }
      const miscela = await this.service.getCallRequest(objRequest)

      this.appGen.dialog.open(ModalInfoMiscelaComponent, {
        data: miscela,
        panelClass: 'modal-info-prodotti',
      })
    } else {
      this.appGen.dialog.open(ModalInfoProdottiComponent, {
        data: prodotto,
        panelClass: 'modal-info-prodotti',
      })
    }
  }

  async getGare() {
    await this.service.getCallRequest({ action: 'gare' }).then((data) => {
      this.listaGare = data
    })
  }
  async getDisfagia() {
    await this.service.getCallRequest({ action: 'disfagie' }).then((data) => {
      this.listaDisfagia = data
    })
  }

  async getTipoAlimentazioneArtificiale() {
    await this.service
      .getCallRequest({ action: 'getTipoAlimentazioneArtificiale' })
      .then((data) => {
        this.listaTipoAlimentazioneArtificiale = data
      })
  }

  async getMetodiSomministrazione(idartificiale) {
    await this.service
      .getCallRequest({ action: 'metodisomministrazione', param: idartificiale })
      .then((data) => {
        this.listaMetodiSomministrazione = data
      })
  }
  async getListConclusioniPredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'conclusioni' })
      .then((data) => {
        this.listaConclusioniPredefinite = data
      })
  }

  async getGradiDisfagia() {
    await this.service.getCallRequest({ action: 'gradidisfagia' }).then((data) => {
      this.listaGradiDisfagia = data
    })
  }

  async getListaProdotti(idartificiale, idGara?) {
    try {
      idGara = this.idGara;
      //debugger
      const obj = {
        IdGara: idGara,
        IdTipoAlimentazioneArtificiale: idartificiale,
        Integratori: true,
        ProdottiXVisita: true
      }

      await this.service
        .postCallRequest({ action: 'listaprodotti', param: obj })
        .then((data) => {
          this.listaProdotti = data !== undefined? data : null;
        })
        this.listaProvvisoria = this.listaProdotti !== null? this.listaProdotti : [];
    } catch (error) {
      console.error(error);
    }
  }

  ///Funzione che prende la lista e la "Separa" nei gruppi. Generale, sacche e integratore
  returnFiltered(type) {
    try {
      if (type === 0) {
        return this.listaProvvisoria.filter(
          (i) =>
            i.idTipoProdotto != TipoProdotto.Integratori &&
            i.idTipoProdotto != TipoProdotto.SacchePersonalizzate
        )
      }
        let x :any = [];
        x = this.listaProvvisoria.filter((i) => i.idTipoProdotto === type);
        return x;

    } catch (error) {
      console.error(error)
    }

  }

  async getTipiSonda() {
    await this.service.getCallRequest({ action: 'tipisonda' }).then((data) => {
      this.listaTipiSonda = data
    })
  }

  async getListaCalibro() {
    await this.service.getCallRequest({ action: 'getListaCalibro' }).then((data) => {
      this.listaCalibriSonda = data
    })
  }

  async getValutazioneNutrizionale() {
    const obj = {
      idPaziente: this.idPaziente,
      idVisita: this.idVisitaUtente,
    }
    await this.service
      .postCallRequest({ action: 'getValutazioneNutrizionale', param: obj })
      .then((data) => {
        this.valutazioneNutrizionale = data
      })
  }

  async getNutrizioneArtificialeXVisita(idvisita) {
    await this.service
      .getCallRequest({ action: 'nutrizioneartificialexvisita', param: idvisita })
      .then((data) => {
        this.setValueForm(data)
      })
  }

  goToMonitoraggiaggio() {
    this.router.navigate(['/app/visite/followup', this.idPaziente])
  }

  async stampaReport() {
    await this.service
      .getCallRequest({ action: 'getreport', param: this.idVisitaUtente })
      .then((data) => {
        this.getpdf(data)
      })
  }

  async getpdf(namePDF) {
    await this.service.getpdf(namePDF);
  }

  async getNutrizionePrecompiled() {
    //prendo l'alimentazione artificiale per recuperarmi alcuni dati, tipo le kcal

    await this.service
      .getCallRequest({ action: 'getNutrizionePrecompiled', param: this.idVisitaUtente })
      .then((data) => {

        this.nutrizioneArtificiale = data

        this.nutrizioneArtificiale.protMin = Math.round(
          this.nutrizioneArtificiale.protMin
        )
        this.nutrizioneArtificiale.protMax = Math.round(
          this.nutrizioneArtificiale.protMax
        )
        this.nutrizioneArtificiale.azotoMax = Math.round(
          this.nutrizioneArtificiale.azotoMax
        )
        this.nutrizioneArtificiale.azotoMin = Math.round(
          this.nutrizioneArtificiale.azotoMin
        )
        this.nutrizioneArtificiale.kcalMax = Math.round(
          this.nutrizioneArtificiale.kcalMax
        )
        this.nutrizioneArtificiale.kcalMin = Math.round(
          this.nutrizioneArtificiale.kcalMin
        )

        this.AlimentazioneArtificialeValue = data

        this.kcalVal = this.nutrizioneArtificiale.kcal
        this.protVal = this.nutrizioneArtificiale.proteine
        this.azotoVal = this.nutrizioneArtificiale.azoto

        this.apportoIdricoVal = this.nutrizioneArtificiale.apportoIdrico

        this.setSliderOptions()

        this.isLoaded = true
      })
  }

  confermaProdotto(item) {
    this.prodottiSelezionati.push(item)
  }

  async onSubmit() {
    try {

    /*  if (
        this.appGen.isNullOrUndefined(this.formArtificiale.get('diagnosi').value) &&
        this.authGuard.canAccess(this.appGen.permesso.ConcludiVisita)
      ) {
        this.msgErrore =
          'É necessario compilare le <strong> conclusioni </strong> per proseguire  555'
        this.inError = true
        return
      }*/

      if (this.formArtificiale.invalid) {
        this.appGen.validateAllFormFields(this.formArtificiale)
        this.msgErrore = 'Alcuni campi obbligatori non sono compilati, prego riprovare'
        this.inError = true
        return
      }
      this.inError = false

      if (!this.tabellaProdottiComponent || this.withoutDeleted(this.tabellaProdottiComponent.prodottiDataSource.data).length <= 0 ) {
        this.appGen.notificate.error('Selezionare almeno un prodotto')
        return
      }

      const prodotti = this.withoutDeleted(this.tabellaProdottiComponent.prodottiDataSource.data);
      let prodottiSenzaConfezionamentoSelezionato = [];
      for (const prodotto of prodotti) {
        if (prodotto.confezionamenti && this.appGen.isNullOrUndefined(prodotto.idConfezionamentoProdotto) && this.idTipoAlimentazioneArtificiale === this.TipoAlimentazioneArtificiale.Enterale) {
          prodottiSenzaConfezionamentoSelezionato.push(prodotto)
        }
      }

      if (prodottiSenzaConfezionamentoSelezionato?.length > 0) {
        this.generaLista(prodottiSenzaConfezionamentoSelezionato);
        ////SWAL DA INSERIRE
        //this.appGen.notificate.error('Non è stato inserito il confezionamento di alcuni prodotti');
        Swal.fire({
          title: 'Attenzione, ai seguenti prodotti non è stato applicato il confezionamento',
          html:
          `<div style="max-height: 360px; overflow-y: auto;"> ` +
            this.generaLista(prodottiSenzaConfezionamentoSelezionato) +
            `</div>` +
          `<div>
          </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: false,
          cancelButtonText: 'Ok',
          cancelButtonColor: '#00afa6',
          //iconColor: '#00afa6'
        })
        return
      }


      const obj = {
        Kcal: this.kcalVal,
        Proteine: this.protVal,
        Azoto: this.azotoVal,
        ApportoIdrico: this.apportoIdricoVal,
        IdArtificiale: this.formArtificiale.get('artificiale').value,
        IdTipoSonda: this.formArtificiale.get('tipoSonda').value,
        DataPosizionamento: this.formArtificiale.get('dataPosizionamento').value,
        DimensioneSonda: this.formArtificiale.get('dimensioneSonda').value,
        IdCalibroSonda: this.formArtificiale.get('calibroSonda').value,
      //  Diagnosi: this.formArtificiale.get('diagnosi').value,
        Note: this.formArtificiale.get('note').value,
        IdMetodoSomministrazione: this.formArtificiale.get('metodoSomministrazione').value,
        DataInizioNE:this.formArtificiale.get('dataInizioNE').value,
        AlimentazioneOS: this.formArtificiale.get('alimentazioneOS').value,
        IdGara: this.formArtificiale.get('gara').value,
        TipoCatetereParenterale: this.formArtificiale.get('tipoCatetereParenterale').value,
        ValiditaPiano: this.formArtificiale.get('validitaPiano').value,
        Prodottixvisita: this.tabellaProdottiComponent.prodottiDataSource.data,
        NotePianoNutr: this.tabellaProdottiComponent.note,
        IdValutazioneNutrizionale: this.idValutazioneNutrizionale,
        IdVisitaNutrizioneArtificiale: this.idNutrizione,
        IdPaziente: this.idPaziente,
      }

      await this.service
        .postCallRequest({ action: 'insertUpdateNutrizioneArtificiale', param: obj })
        .then((data) => {
          // Dopo il salvataggio devo fare refresh della lista dei prodotti per ottenere id di tutti i prodotti inseriti
          this.checkNutrizioneEsistente(true)

          this.bEdit = false
          this.editProdotti = false

          this.formArtificiale.disable()
          if (!this.isDaRefertare) {
            this.editorConfig.editable = false
            this.editorConfig.showToolbar = false
          }
          this.formArtificiale.updateValueAndValidity()
          this.isRiepilogo = true
          this.setSliderOptions()
          this.router.navigate([], {
            relativeTo: this.activateRoute,
            queryParams: { nutrexist: true },
            queryParamsHandling: 'merge',
          })
        })
        if (this.formArtificiale.get('noteDietista').value && this.authGuard.canRole(this.appGen.ruolo.Dietista)) {
          this.salvaNoteDietista();
        }
    } catch (error) {
      this.appGen.notificate.error('Errore nel salvataggio piano')

      console.error(error)
    }

  }


  generaLista(lista){
    let optionItems;
    lista.forEach(item =>{
      if (this.appGen.isNullOrUndefined(optionItems)) {
        optionItems = `<p>${item.prodotto}</p>`
      } else if (!this.appGen.isNullOrUndefined(optionItems)){
        optionItems += `<p>${item.prodotto}</p>`
      }
    })
    return optionItems;
  }

  setSliderOptions() {
    this.optionsKcal = {
      readOnly: this.isRiepilogo,
      // showTicksValues: true,
      floor: this.nutrizioneArtificiale.kcalMin,
      ceil: this.nutrizioneArtificiale.kcalMax,
      // showTicks: true,
      tickStep: 100,
      showSelectionBarFromValue: 0,
    }

    this.optionsProt = {
      readOnly: this.isRiepilogo,
      // showTicksValues: true,
      floor: this.nutrizioneArtificiale.protMin,
      ceil: this.nutrizioneArtificiale.protMax,
      // showTicks: true,
      tickStep: 20,
      showSelectionBarFromValue: 0,
    }
    this.optionsAzoto = {
      readOnly: this.isRiepilogo,
      // showTicksValues: true,
      floor: this.nutrizioneArtificiale.azotoMin,
      ceil: this.nutrizioneArtificiale.azotoMax,
      // showTicks: true,
      tickStep: 2,
      showSelectionBarFromValue: 0,
    }
    this.optionsApportoIdrico = {
      readOnly: this.isRiepilogo,
      // showTicksValues: true,
      floor: 0,
      ceil: this.nutrizioneArtificiale.apportoIdrico + 1000,
      // showTicks: true,
      tickStep: 2,
      showSelectionBarFromValue: 0,
    }
  }

  async concludiVisita() {
    this.params = {...this.params, showKcal : !this.kcalNonVisibili};
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

            //Nel caso  in cui sia il dietista a salvare salva la dieta e oltre la dieta salva le note
            const obj = {
              idVisita: this.idVisitaUtente,
              idTipoAlimentazione: TipoAlimentazione.Artificiale
            }

            this.salvaNoteDietista();
            await this.service.postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj }).then(() => {
              this.router.navigate(['/app/visite/step/conclusioni', this.idPaziente], { queryParams: { visit: this.idVisitaUtente, vnutr: this.idValutazioneNutrizionale, } })
            });
          } else {
            // if (this.appGen.configLinfa.InvioRefertiSenzaFirma === true) {
            //   await firstValueFrom(this.visitaServ.matchtiporichiesta(this.idVisitaUtente))
            // }
            this.service
            .putCallRequest({ action: 'concludiVisita', param: this.idVisitaUtente })
            .then(() => {
              this.router.navigate(['/app/visite/step/riepilogo', this.idPaziente], {
                queryParams: this.params,
              })
            })
          }
        }
      })
    )
  }

  selectedConclusionePredefinita(conclusione) {
    this.formArtificiale.get('conclusioniPredefinite').reset()
    if (!this.appGen.isNullOrUndefined(conclusione)) {
      this.formArtificiale
        .get('diagnosi')
        .setValue(this.formArtificiale.get('diagnosi').value + ' ' + conclusione)
    }
  }

  async selectedTipoAlimentazione(idartificiale) {
    // Quando cambio tipo di nutrizione devo vuotare prodotto selezionato e anche la lista di prodotti
    this.ProdottoSelezionato ? (this.ProdottoSelezionato.value = null) : null
    // svuoto la tabella di prodotti selezionati e rigenero la tabella
    this.prodottiSelezionati ? (this.prodottiSelezionati = []) : null

    if (this.prodottiSelezionati && this.tabellaProdottiComponent) {
      this.tabellaProdottiComponent.resetTable()
    }

    this.idTipoAlimentazioneArtificiale = idartificiale

    //mi recupero i vari dati dalle tabelle dizionario
    this.getMetodiSomministrazione(idartificiale)

    //await this.getListaProdotti(idartificiale)

    if (idartificiale == this.TipoAlimentazioneArtificiale.Enterale) {
      // this.formArtificiale.controls.velocitaSomministrazione.clearValidators()
      this.formArtificiale.controls.tipoCatetereParenterale.clearValidators()
    }
    if (idartificiale == this.TipoAlimentazioneArtificiale.Parenterale) {
      this.formArtificiale.controls.tipoSonda.clearValidators()
      this.formArtificiale.controls.dimensioneSonda.clearValidators()
      this.formArtificiale.controls.calibroSonda.clearValidators()
    }

    this.formArtificiale.controls.gara.reset()
    this.formArtificiale.controls.metodoSomministrazione.reset()
    this.formArtificiale.controls.dataPosizionamento.reset()
    this.formArtificiale.controls.dataInizioNE.reset()
    this.formArtificiale.controls.alimentazioneOS.reset()

    this.formArtificiale.updateValueAndValidity()
  }

  async setGara(val) {
    this.idGara = val;
    await this.getListaProdotti(this.idTipoAlimentazioneArtificiale, val);


    if (this.appGen.isNullOrUndefined(val)) {
      this.misceleVisibili = false;
    } else if(!this.appGen.isNullOrUndefined(val)){
      this.misceleVisibili = true;
    }
  }

  async setValueForm(data) {
    this.selectedTipoAlimentazione(data.idartificiale)
    setTimeout(async () => {
     // this.formArtificiale.controls.diagnosi.setValue(data.diagnosi)
      this.formArtificiale.controls.note.setValue(data.note)
      this.formArtificiale.controls.alimentazioneOS.setValue(data.alimentazioneos)
      this.formArtificiale.controls.tipoSonda.setValue(data.idsonda)
      this.formArtificiale.controls.dimensioneSonda.setValue(data.dimensioneSonda)

      this.formArtificiale.controls.calibroSonda.setValue(data.idCalibroSonda)
      this.formArtificiale.controls.dataPosizionamento.setValue(data.dataPosizionamento)
      this.formArtificiale.controls.gradoDisfagia.setValue(data.idgradodisfagia)
      this.formArtificiale.controls.disfagia.setValue(data.iddisfagia)
      this.formArtificiale.controls.dataInizioNE.setValue(data.datane)
      this.formArtificiale.controls.artificiale.setValue(data.idartificiale)

      this.formArtificiale.controls.kcal.setValue(data.kcal)
      this.formArtificiale.controls.azoto.setValue(data.azoto)
      this.formArtificiale.controls.proteine.setValue(data.proteine)

      if (data.tipoCatetereParenterale) {
        this.formArtificiale.controls.tipoCatetereParenterale.setValue(data.tipoCatetereParenterale);
      }

      this.formArtificiale.controls.metodoSomministrazione.setValue(
        data.idsomministrazione
      )
      this.formArtificiale.controls.gara.setValue(data.idgara);

      this.formArtificiale.controls.validitaPiano.setValue(data.validitaPiano);

      if (this.appGen.isNullOrUndefined(this.formArtificiale.controls.gara)) {
        this.misceleVisibili = false;
      } else if(!this.appGen.isNullOrUndefined(this.formArtificiale.controls.gara)){
        this.misceleVisibili = true;
      }


      this.idGara = this.formArtificiale.controls.gara.value;

      this.setSliderOptions()
      this.kcalVal = data.kcal
      this.protVal = data.proteine
      this.azotoVal = data.azoto
      this.notePianoNutr = data.notePianoNutr
      this.apportoIdricoVal = data.apportoIdrico
    }, 1000)
  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idPaziente], {
      queryParams: this.params,
    })
  }

  backToList() {
    this.router.navigate(['/app/visite/piani-nutrizionali/lista'])
  }

  creaSacca() {
    const dialogRef = this.appGen.dialog.open(ModalCreaSaccaComponent, {
      data: null,
      panelClass: 'modal-crea-sacca',
    })

    dialogRef.afterClosed().subscribe((objSacca) => {
      if (this.appGen.isNullOrUndefined(objSacca)) {
        return
      }

      //aggiorno i prodotti per trovare la sacca selezionabile
      this.getListaProdotti(this.formArtificiale.get('artificiale').value)

      const objProdotto = {
        kcal: objSacca.prodotto.kcal,
        proteine: objSacca.proprieta.amminoacidi,
        azoto: 0,
        quantita: objSacca.prodotto.quantita,
        quantitaBase: objSacca.prodotto.quantita,
        velocitaSomministrazione: '',
        acqua: 0,
        idProdotto: objSacca.prodotto.id,
        idprodottoxvisita: null,
        idUnitaMisura: objSacca.prodotto.idUnitaMisura,
        unitaMisura: 'ml',
        codiceProdotto: '',
        prodotto: objSacca.prodotto.prodotto,
        idTipoProdotto: objSacca.prodotto.idTipoProdotto,
        metodoAssunzione: '',
        saccaEditabile: true,
        recordEliminato: false, //IMPORTANTE: deve essere passato sempre
      }


      this.prodottiSelezionati.push(objProdotto);
      this.tabellaProdottiComponent.generateTable()
      this.ProdottoSelezionato.value = null
    })
  }

  async salvaPianoNutrizionale() {

    if (this.tabellaProdottiComponent.prodottiDataSource.data.length <= 0) {
      this.appGen.notificate.error('Selezionare almeno un prodotto')
      return
    }

    const obj = {
      Prodottixvisita: this.tabellaProdottiComponent.prodottiDataSource.data,
      IdPianoNutrizionale: this.dataPianoNutrizionale.pianoNutrizionale.id, //ok
      IdPaziente: this.idPaziente, //ok
      NotePianoNutr: this.tabellaProdottiComponent.note, //ok
      IdTipoAlimentazione: TipoAlimentazione.Artificiale, //ok
    }

    await this.service
      .postCallRequest({ action: 'insertUpdatePianoNutrizionale', param: obj })
      .then(() => {
        this.backPreviousPage.back()
      })
  }

  async bozzaReferto() {
    //già filtrato in base al tipo alimentazione, lato server

        //console.log(res);
        const res = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisitaUtente));

        const obj = {
          pdfFile: this.report.createReferto(res, true),

          nomeDocumento: res.nomeDocumento,
          idVisita: this.idVisitaUtente,
          title: 'Bozza referto',
        }

        this.dialog.open(ModalPdfViewerComponent, {
          data: obj,
          panelClass: 'modal-anteprima-pdf',
        })
  }

  async bozzaAnamnesiAlimentare(){
    //già filtrato in base al tipo alimentazione, lato server
    await this.service.getCallRequest({ action: 'GetAnamnesiAlimentareVisita', param: this.idVisitaUtente }).then((res) => {
      let isDietaSettimanale = false
        if (
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana &&
          res.prodotti?.prodotti[0]?.prodotti[0]?.settimana?.length > 0
          && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != ""
        ) {
          isDietaSettimanale = true
        }

      const obj = {
        pdfFile: this.report.createAnamnesiAlimentare(res, true, isDietaSettimanale, this.kcalNonVisibili),
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

  async bozzaPianoNutrizionale() {
    //già filtrato in base al tipo alimentazione, lato server
    await this.service
      .getCallRequest({ action: 'GetPianoNutrizionaleVisita', param: this.idVisitaUtente })
      .then(async (res) => {
        let isDietaSettimanale = false;

        if (res.visita?.idTipoAlimentazione === TipoAlimentazione.NaturaleMista
          && !this.appGen.isNullOrUndefined(res.prodotti?.prodotti[0]?.prodotti[0]?.settimana
            && res.prodotti?.prodotti[0]?.prodotti[0]?.settimana[0].trim() != "")
          ) {
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

        const obj = {
          pdfFile: this.report.createPianoNutrizionale(res,true, isDietaSettimanale, this.kcalNonVisibili),
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

   /**
   * Senza prodotti cancellati
   * @param x
   * @returns
   */
   withoutDeleted(x:any) {
    return _.where(x, { recordEliminato: false })
  }


  /**
   * Funzione che salva le note del dietista
   */
  async salvaNoteDietista(){
    try {
      const note = this.formArtificiale.get('noteDietista').value;
      const obj = {
        idVisita : this.idVisitaUtente,
        note : note
      }

      await firstValueFrom(this.visitaServ.salvaNoteDietista(obj));
    } catch (error) {
      console.error('error');
      this.appGen.notificate.error('È stato riscontrato un problema durante il salvataggio delle note')
    }

  }

}
