import { Location } from '@angular/common'
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSelect } from '@angular/material/select'
import { MatTableDataSource } from '@angular/material/table'
import moment from 'moment'
import {
  debounceTime,
  firstValueFrom,
  ReplaySubject,
  Subject,
  takeUntil,
  throwError,
} from 'rxjs'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import {
  Ruoli,
  StatoRichiesta,
  TipoEnti,
  TipoIndirizzo,
  TipoPrestazione,
  TipoRicerca,
  TipoRichiesta,
} from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { FiltroRicercaPaziente, UtenteMedico } from 'src/app/_models/common'
import { Comune, PazienteNuovaRichiesta } from 'src/app/_models/paziente'
import {
  Ambulatorio,
  NuovaRichiesta,
  NuovaRichiestaDaInviare,
  TipoPrestazione as Prestazione,
  Priorita,
  TipiRichiesta as Richiesta,
  TipiRichiesta,
} from 'src/app/_models/richieste'
import { CommonService } from 'src/app/_repositories/common_repo.service'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import { RichiestaService } from 'src/app/_repositories/richiesta_repo.service'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import Swal from 'sweetalert2'
import _, { forEach } from 'underscore'
import { MatSort } from '@angular/material/sort'
import { FiltroProdottiService } from 'src/app/_core/services/prodotti.service'
import { DistrettiService } from 'src/app/_repositories/distretti.service'
import { EntiXUtente } from 'src/app/_models/configurazione'

@Component({
  selector: 'app-modal-prenota-richiesta',
  templateUrl: './modal-prenota-richiesta.component.html',
  styleUrls: ['./modal-prenota-richiesta.component.scss'],
})
export class ModalPrenotaRichiestaComponent implements OnInit, AfterViewInit {
  @ViewChild('pazienteSelect') pazienteSelect: MatSelect

  formRichiesta: FormGroup
  formFiltriPaziente: FormGroup

  tipoUtente = Ruoli
  idStatoRichiestaRichiesta = StatoRichiesta

  utenteLoggato
  //id
  idPaziente
  idRichiesta
  idPazienteSelezionato

  //liste

  listaPazienti: any = []

  //boolean
  searchOpen = true
  isRiepilogo = false
  isCup = false
  isInterna = false
  isSapio = false
  isCancellataTerminata = false
  isVisitaDomicilio = false
  messageVisibile = false
  pazientePresente = false;
  editAbilitato = false;

  //backup residenza e domicilio
  backupComuneResidenza :string = '';
  backupIndirizzoResidenza :string= '';
  backupComuneDomicilio :string= '';
  backupIndirizzoDomicilio: string = '';


  tipoPrestazione = TipoPrestazione
  tipoRichiesta = TipoRichiesta
  richiestaObj
  orariDurata = Array.from({ length: 8 }, (_, i) => i + 1)
  editRichiesta = false
  calendarioRichieste = true

  fromRiepilogoVisita = false
  @Input() tipoRichiestaRoute: TipoRichiesta | null

  idpaziente
  idVisita
  idAmbulatorio

  //#region Ricerca esterna
  ancheEsterni = false
  tipoRicerca = TipoRicerca
  ricercaSelezionata: TipoRicerca = TipoRicerca.Entrambi
  visualizzaTabellaPazienti = true
  visualizzaNuovaRichiesta = false
  listaPazientiPerRichiesta = new MatTableDataSource<PazienteNuovaRichiesta>()
  pazienteColumns = ['cognome', 'cf', 'dataNascita', 'nosologico', 'action']
  formRichiestaEsterna: FormGroup

  listaUrgenze: Priorita[] = []
  listaTipiRichieste: Richiesta[] = []
  listaTipoPrestazione: Prestazione[] = []
  listaAmbulatori: Ambulatorio[] = []

  listaMedici: UtenteMedico[] = []
  listaDietisti: UtenteMedico[] = []
  listaInfermiere: UtenteMedico[] = []
  dataPrestazione: Date
  pazienteSelezionatoXRichiesta: PazienteNuovaRichiesta
  ///#endregion Ricerca esterna

  listaComuniResidenza = []
  listaComuniDomicilio = []

  filtroComuneResidenza: FormControl = new FormControl('')
  filtroComuneDomicilio: FormControl = new FormControl('')

  comuniResidenzaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  comuniDomicilioFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1)

  residenzaDaDb = false;
  domicilioDaDb = false;
  protected _onDestroy = new Subject<void>()

  tipoIndirizzo = TipoIndirizzo

  // @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.listaPazientiPerRichiesta.paginator = value
  }

  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    this.listaPazientiPerRichiesta.sort = value
  }

  constructor(
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public authGuard: AuthGuard,
    @Optional() public dialogRef: MatDialogRef<ModalPdfViewerComponent>,
    private pazienteHttp: PazienteService,
    private richiesteHttp: RichiestaService,
    private commonHttp: CommonService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data,
    private backPreviousPage: Location,
    private prodServ: FiltroProdottiService,
    private distrettiService: DistrettiService
  ) {
    // richieste con calendario hanno bisogno di avere la data  altre tipo orderenty e distretto non hanno bisogno della data

    this.dataPrestazione = data && data.dataPrestazione ? data.dataPrestazione : null
  }

  ngOnInit() {
    if (this.tipoRichiestaRoute) {
      this.ricercaSelezionata = this.tipoRicerca.Esterna
    }

    this.generateForm()
    this.formFiltriPaziente = this.formBuilder.group({
      nome: [null],
      cognome: [null],
      cf: [
        null,
        [
          Validators.pattern(
            '^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$'
          ),
          Validators.minLength(16),
          Validators.maxLength(16),
        ],
      ],
      nosologico: [null],
      nascita: [null],
    })
    this.creaFormPaziente()

    /** Le Liste */
    this.getListaPriorita()
    this.getTipiRichiesta()
    this.getListaTipiPrestazione()
    this.getListaAmbulatori()

    if (
      this.tipoRichiestaRoute != this.tipoRichiesta.Reparto
      //&& this.tipoRichiestaRoute != this.tipoRichiesta.Distretto
    ) {
      this.getListaMedici()
      this.getListaDietisti()
      this.getListaInfermiere()
    }
    this.setFiltriSelect()
  }

  ngAfterViewInit(): void {
    this.listaPazientiPerRichiesta.paginator = this.paginator
    this.listaPazientiPerRichiesta.sort = this.sort
  }

  /**
   *  Funzione che gestisce la visualizzazione dei campi nel form dipendenti dal tipo Prestazione
   * @param val - id del  TipoPrestazione.VisitaControllo
   */
  tipoRichiestaSelezionato(val) {
    //debugger
    switch (val) {
      case TipoRichiesta.Cup:
        this.isCup = true
        this.isInterna = false
        this.formRichiesta.get('ambulatorio').reset()

        break
      case TipoRichiesta.Interna:
        this.isInterna = true
        this.isCup = false
        this.formRichiesta.get('ambulatorio').setValue(3) //PRESSO REPARTO RICHIEDENTE

        break

      default:
        this.isInterna = false
        this.isCup = false
        this.formRichiesta.get('ambulatorio').reset()

        break
    }
  }

  async getAmbulatorio(idVisita) {
    await this.service
      .getCallRequest({ action: 'getAmbulatorioFromVisita', param: idVisita })
      .then((data) => {
        this.idAmbulatorio = data
      })
  }

  onDismiss(): void {
    this.dialogRef.close()
  }

  get formRichiestaControls() {
    return this.formRichiesta.controls
  }

  async findIdComune(
    _paziente: PazienteNuovaRichiesta | null = null,
    tipo: 'residenza' | 'domicilio'
  ): Promise<number> {
    let idComune = null
    //*IMPORTANT: manca comune domicilio
    if (_paziente && _paziente.comuneResidenzaCodice && tipo === 'residenza') {
      let comuni: any = await firstValueFrom(
        this.pazienteHttp.ricercaComuneByDescrizione(_paziente.comuneResidenza)
      )
      this.comuniResidenzaFiltrate.next(comuni.slice())
      let comune = _.findWhere(comuni, {
        codiceIstat: _paziente.comuneResidenzaCodice.toString(),
      })
      idComune = comune.idComune
    } else if (_paziente && _paziente.comuneDomicilioCodice && tipo === 'domicilio') {
      let comuni: any = await firstValueFrom(
        this.pazienteHttp.ricercaComuneByDescrizione(_paziente.comuneDomicilio)
      )
      this.comuniDomicilioFiltrati.next(comuni.slice())
      let comune = _.findWhere(comuni, {
        codiceIstat: _paziente.comuneDomicilioCodice.toString(),
      })
      idComune = comune.idComune
    }

    return idComune
  }

  async creaFormPaziente(_paziente: PazienteNuovaRichiesta | null = null) {
    this.residenzaDaDb = false;
    this.domicilioDaDb = false;
    if (_paziente) {
      this.pazientePresente = true;
    }
    
    const idComuneResidenza = await this.findIdComune(_paziente, 'residenza')
    const idComuneDomicilio = await this.findIdComune(_paziente, 'domicilio')

    this.pazienteSelezionatoXRichiesta = { ..._paziente }
    this.formRichiestaEsterna = this.formBuilder.group({
      anagrafica: new FormGroup({
        nome: new FormControl(
          {
            value: _paziente ? _paziente.nome : null,
            disabled: _paziente ? true : false,
          },
          Validators.required
        ),
        cognome: new FormControl(
          {
            value: _paziente ? _paziente.cognome : null,
            disabled: _paziente ? true : false,
          },
          Validators.required
        ),
        sesso: new FormControl(
          {
            value: _paziente ? _paziente.sesso : null,
            disabled: _paziente ? true : false,
            //  disabled: _paziente ? true : false,
          },
          Validators.required
        ),
        dataNascita: new FormControl(
          {
            value: _paziente ? _paziente.dataNascita : null,
            disabled: _paziente ? true : false,
          },
          Validators.required
        ),
        cf: new FormControl(
          { value: _paziente ? _paziente.cf : null, disabled: _paziente ? true : false },
          [
            Validators.required,
            Validators.pattern(
              '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$'
            ),
          ]
        ),
        telefono: new FormControl({
          value: _paziente ? _paziente.telefono : null,
          disabled: _paziente ? true : false,
        }),
        email: new FormControl(
          {
            value: _paziente ? _paziente.email : null,
            disabled: _paziente ? true : false,
          },
          Validators.email
        ),
        comuneResidenza: new FormControl({
          value: _paziente ? idComuneResidenza : null,
            disabled: _paziente ? true : false,
        }),
        comuneDomicilio: new FormControl({
          value: _paziente ? idComuneDomicilio : null,
          disabled: _paziente ? true : false,
        }),
        capNascita: new FormControl(''),
        capResidenza: new FormControl(''),
        capDomicilio: new FormControl(''),
        comuneNascitaCodice: new FormControl({
          value: _paziente ? _paziente?.comuneNascitaCodice : null,
          disabled: _paziente?.comuneNascitaCodice ? true : false,
        }),
        comuneResidenzaCodice: new FormControl({
          value: _paziente?.comuneResidenzaCodice ? _paziente.comuneResidenzaCodice : null,
          disabled: _paziente ? true : false,
        }),
        comuneDomicilioCodice: new FormControl({
          value: _paziente ? _paziente.comuneDomicilioCodice : null,
          disabled: _paziente?.comuneDomicilioCodice ? true : false,
        }),
        indirizzoResidenza: new FormControl({
          value: _paziente ? _paziente.indirizzoResidenza : null,
          disabled: _paziente?.indirizzoResidenza ? true : false,
        }),
        indirizzoDomicilio: new FormControl({
          value: _paziente ? _paziente.indirizzoDomicilio : null,
          disabled:_paziente?.indirizzoDomicilio ? true : false,
        }),
      }),
      richiesta: new FormGroup({
        nosologico: new FormControl(
          _paziente ? _paziente.nosologico : null,
          Validators.required
        ),
        postodegenza: new FormControl(_paziente ? _paziente.postodegenza : null),
        motivoRichiesta: new FormControl(''), //, Validators.required
        dataPrestazione: new FormControl(this.dataPrestazione, Validators.required),
        priorita: new FormControl(''),
        tipoRichiesta: new FormControl(
          { value: '', disabled: this.tipoRichiestaRoute ? true : false },
          Validators.required
        ),
        paziente: new FormControl(''),
        tipoPrestazione: new FormControl(''),
        infermiere: new FormControl(''),
        ambulatorio: new FormControl('', Validators.required),
        repartoRichiedente: new FormControl(''),
        idMedicoPrincipale: new FormControl(
          '',
          !this.authGuard.canRole(this.appGen.ruolo.SAPIOext) &&
          !this.authGuard.canRole(this.appGen.ruolo.Distretto)
            ? Validators.required
            : null
        ),
        // medicoSpecialista: new FormControl({value: '', disabled: this.isRiepilogo}, !this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? Validators.required : null)
        idMedicoSecondario: new FormControl(''),
        durataPrestazione: new FormControl(''),
        motivoCambiamento: new FormControl(
          '',
          this.editRichiesta ? Validators.required : null
        ),
      }),
    })

    this.visualizzaNuovaRichiesta = true
    if (idComuneResidenza !== null) {
      this.residenzaDaDb = true;
    }

    if (idComuneDomicilio !== null) {
      this.domicilioDaDb = true;
    }

    if (this.authGuard.canRole(this.appGen.ruolo.Distretto)) {
      this.formRichiestaEsterna.get('anagrafica').get('telefono').setValidators(Validators.required);
      this.formRichiestaEsterna.get('anagrafica').get('telefono').updateValueAndValidity();
    }
    this.setFormFields()
  }


  editResidenzaDomicilio(cancel = false){
    if (cancel === false) {
      this.editAbilitato = true;
      this.backupComuneResidenza = this.formRichiestaEsterna.get('anagrafica').get('comuneResidenza').value;
      this.backupIndirizzoResidenza = this.formRichiestaEsterna.get('anagrafica').get('indirizzoResidenza').value;
      this.backupComuneDomicilio = this.formRichiestaEsterna.get('anagrafica').get('comuneDomicilio').value;
      this.backupIndirizzoDomicilio = this.formRichiestaEsterna.get('anagrafica').get('indirizzoDomicilio').value;
      this.formRichiestaEsterna.get('anagrafica').get('comuneResidenza').enable();
      this.formRichiestaEsterna.get('anagrafica').get('indirizzoResidenza').enable();
      this.formRichiestaEsterna.get('anagrafica').get('comuneDomicilio').enable();
      this.formRichiestaEsterna.get('anagrafica').get('indirizzoDomicilio').enable();
    } else if(cancel === true){
      this.editAbilitato = false;
      this.formRichiestaEsterna.get('anagrafica').get('comuneResidenza').setValue(this.backupComuneResidenza);
      this.formRichiestaEsterna.get('anagrafica').get('indirizzoResidenza').setValue(this.backupIndirizzoResidenza);
      this.formRichiestaEsterna.get('anagrafica').get('comuneDomicilio').setValue(this.backupComuneDomicilio);
      this.formRichiestaEsterna.get('anagrafica').get('indirizzoDomicilio').setValue(this.backupIndirizzoDomicilio);

      this.formRichiestaEsterna.get('anagrafica').get('comuneResidenza').disable();
      this.formRichiestaEsterna.get('anagrafica').get('indirizzoResidenza').disable();
      this.formRichiestaEsterna.get('anagrafica').get('comuneDomicilio').disable();
      this.formRichiestaEsterna.get('anagrafica').get('indirizzoDomicilio').disable();
    }

  }


  /**
   * Per utente OrderEntry e Distretto devo settare diversi cambi
   * Se sono entrato come utente Order entry devo settare campi
   * richiesti:
   * Nosologico
   * tipo richiesta - Reparto - campo disabilitato
   * tipo prestazione = visita di controll - disabilitato
   * data ora prestazione - disabilitato
   * Medico, Dietista - disabilitato
   */
  setFormFields() {
    // order entry
    if (this.tipoRichiestaRoute === this.tipoRichiesta.Reparto) {
      this.formRichiestaEsterna.get('richiesta').get('dataPrestazione').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('dataPrestazione').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('idMedicoPrincipale')
        .clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('idMedicoPrincipale').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('idMedicoSecondario')
        .clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('idMedicoSecondario').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('repartoRichiedente')
        .clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('repartoRichiedente').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('repartoRichiedente')
        .clearValidators()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('priorita')
        .setValidators([Validators.required])

      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoRichiesta')
        .setValue(TipoRichiesta.Reparto)
      this.formRichiestaEsterna.get('richiesta').get('tipoRichiesta').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoPrestazione')
        .setValue(TipoPrestazione.PrimaVisita)
      this.formRichiestaEsterna.get('richiesta').get('tipoPrestazione').disable()
    }
    // distretto
    else if (this.tipoRichiestaRoute === this.tipoRichiesta.Distretto) {
      this.formRichiestaEsterna.get('richiesta').get('nosologico').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('nosologico').disable()

      this.formRichiestaEsterna.get('richiesta').get('priorita').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('priorita').disable()

      this.formRichiestaEsterna.get('richiesta').get('dataPrestazione').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('dataPrestazione').disable()

      // this.formRichiestaEsterna
      //   .get('richiesta')
      //   .get('idMedicoPrincipale')
      //   .clearValidators()
      // this.formRichiestaEsterna.get('richiesta').get('idMedicoPrincipale').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('idMedicoSecondario')
        .clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('idMedicoSecondario').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoRichiesta')
        .setValue(TipoRichiesta.Distretto)
      this.formRichiestaEsterna.get('richiesta').get('repartoRichiedente').disable()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoPrestazione')
        .setValue(TipoPrestazione.VisitaDomicilio)
      this.formRichiestaEsterna.get('richiesta').get('tipoPrestazione').disable()
      this.selectedTipoPrestazione(TipoPrestazione.VisitaDomicilio)

      this.formRichiestaEsterna.get('richiesta').get('priorita').clearValidators()

      this.formRichiestaEsterna.get('richiesta').get('infermiere').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('infermiere').clearValidators()

      this.formRichiestaEsterna
        .get('richiesta')
        .get('durataPrestazione')
        .clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('durataPrestazione').disable()

      this.formRichiestaEsterna.get('richiesta').get('motivoRichiesta').clearValidators()

      this.formRichiestaEsterna.get('richiesta').get('postodegenza').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('motivoRichiesta').clearValidators()

      //  this.appGen.validateokFormFields(this.formRichiestaEsterna)
    } else if (this.tipoRichiestaRoute === this.tipoRichiesta.Interna) {
      this.formRichiestaEsterna.get('richiesta').get('postodegenza').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('motivoRichiesta').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('infermiere').clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('priorita').clearValidators()
      this.formRichiestaEsterna
        .get('richiesta')
        .get('idMedicoSecondario')
        .clearValidators()
      this.formRichiestaEsterna.get('richiesta').get('nosologico').clearValidators()
    }

    this.formRichiestaEsterna.updateValueAndValidity()
  }

  generateForm() {
    this.formRichiesta = this.formBuilder.group({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      sesso: new FormControl('', Validators.required),
      dataNascita: new FormControl('', Validators.required),
      cf: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$'
        ),
      ]),
      nosologico: new FormControl(''),
      postodegenza: new FormControl(''),
      motivoRichiesta: new FormControl(
        '',
        this.authGuard.canRole(this.appGen.ruolo.Distretto) ? Validators.required : null
      ),
      dataPrestazione: new FormControl(''),
      priorita: new FormControl(''),
      tipoRichiesta: new FormControl('', Validators.required),
      paziente: new FormControl(''),
      tipoPrestazione: new FormControl(''),
      infermiere: new FormControl(''),
      ambulatorio: new FormControl('', Validators.required),
      repartoRichiedente: new FormControl(''),
      idMedicoPrincipale: new FormControl(
        '',
        !this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? Validators.required : null
      ),
      // medicoSpecialista: new FormControl({value: '', disabled: this.isRiepilogo}, !this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? Validators.required : null)
      idMedicoSecondario: new FormControl(''),
      durataPrestazione: new FormControl(''),
      motivoCambiamento: new FormControl(
        '',
        this.editRichiesta ? Validators.required : null
      ),
    })
  }

  setDataRichiesta(data) {
    this.formRichiesta.get('dataPrestazione').setValue(data)
    this.appGen.scroll('form')
  }

  async onSubmit() {
    let continua = true

    if (!this.formRichiesta.valid && this.formRichiesta.status !== 'DISABLED') {
      this.appGen.validateAllFormFields(this.formRichiesta)
      continua = false
      return
    }

    let idPrimaVisita

    //sono in creazione di una nuova richiesta
    if (!this.fromRiepilogoVisita) {
      const tipoPrestazione = this.formRichiesta.get('tipoPrestazione').value
      //se setto visita di controllo o visita domicilio controllo che esista prima una "prima visita" a cui associare
      //controllo anche se non sia già stata creata una prima visita
      if (
        tipoPrestazione == TipoPrestazione.VisitaControllo ||
        tipoPrestazione == TipoPrestazione.VisitaDomicilio ||
        tipoPrestazione == TipoPrestazione.PrimaVisita
      ) {
        const json = {
          cf: this.formRichiesta.get('cf').value,
          tipoPrestazione: this.formRichiesta.get('tipoPrestazione').value,
        }
        await this.service
          .postCallRequest({ action: 'CheckRichiestaPrimaVisita', param: json })
          .then((data) => {
            //Se sto creando una prima visita e non ne esiste una già allora permetto di crearla
            if (!data.exist && tipoPrestazione == TipoPrestazione.PrimaVisita) {
              continua = true
            }

            //se la prima visita esiste già e sto creando una nuova prima visita non lo permetto
            if (data.exist && tipoPrestazione == TipoPrestazione.PrimaVisita) {
              continua = false
              return
            }

            //se sto creando una di controllo o domicilio e non esiste la prima visita allora lo blocco
            if (!data.exist && tipoPrestazione != TipoPrestazione.PrimaVisita) {
              continua = false
              return
            } else {
              //altrimenti se esiste la prima visita, gli assegno l'id per associarlo
              idPrimaVisita = data.idPrimaVisita
            }
          })
      }
    }

    if (continua) {
      let Richiesta
      let obj
      //se sono nel riepilogo della visita allroa sto prenotando una visita di controllo
      if (this.fromRiepilogoVisita) {
        Richiesta = {
          IdTipoRichiesta: 4, //accettazione diretta
          MotivoRichiesta: this.formRichiesta.get('motivoRichiesta').value,
          DataPrestazione: this.appGen.convertToLocaleDate(
            this.formRichiesta.get('dataPrestazione').value
          ), // this.appGen.convertUTCDateToLocalDate(dataPrestazioneTmp),
          IdTipoPrestazione: TipoPrestazione.VisitaControllo, //visita controllo
          IdStatoRichiesta: StatoRichiesta.Accettata,
          IdAmbulatorio: this.idAmbulatorio,
          RepartoRichiedente: this.formRichiesta.get('repartoRichiedente').value,
        }

        obj = {
          Richiesta,
          IdVisitaCorrente: this.idVisita,
          IdPaziente: this.idpaziente,
        }
      } else {
        Richiesta = {
          Nome: this.formRichiesta.get('nome').value,
          Cognome: this.formRichiesta.get('cognome').value,
          Sesso: this.formRichiesta.get('sesso').value,
          Cf: this.formRichiesta.get('cf').value,
          DataNascita: this.formRichiesta.get('dataNascita').value, //this.appGen.convertUTCDateToLocalDate(dataNascitaTmp),
          IdTipoRichiesta: this.formRichiesta.get('tipoRichiesta').value,
          IdPriorita: this.isVisitaDomicilio
            ? null
            : this.formRichiesta.get('priorita').value,
          MotivoRichiesta: this.formRichiesta.get('motivoRichiesta').value,
          DataPrestazione: this.appGen.convertToLocaleDate(
            this.formRichiesta.get('dataPrestazione').value
          ), // this.appGen.convertUTCDateToLocalDate(dataPrestazioneTmp),
          DurataPrestazione: this.isVisitaDomicilio
            ? this.formRichiesta.get('durataPrestazione').value
            : 0,
          IdTipoPrestazione: this.formRichiesta.get('tipoPrestazione').value,
          IdStatoRichiesta: StatoRichiesta.Accettata,
          //se sono come utente sapio prendo user sapio loggato, altrimenti il medico selezionato
          IdMedicoPrincipale: this.authGuard.canRole(this.appGen.ruolo.SAPIOext)
            ? -1
            : this.formRichiesta.get('idMedicoPrincipale').value,
          IdMedicoSecondario: this.authGuard.canRole(this.appGen.ruolo.SAPIOext)
            ? null
            : this.formRichiesta.get('idMedicoSecondario').value,
          IdAmbulatorio: this.formRichiesta.get('ambulatorio').value,
          RepartoRichiedente: this.formRichiesta.get('repartoRichiedente').value,
          Infermiere: this.formRichiesta.get('infermiere').value,
        }

        obj = {
          Richiesta,
          IdPrimaVisita: this.appGen.isNullOrUndefined(idPrimaVisita)
            ? null
            : idPrimaVisita,
          IdPaziente:
            this.idPazienteSelezionato == undefined ? null : this.idPazienteSelezionato,
        }
      }

      await this.service
        .postCallRequest({ action: 'inserimentorichiesta', param: obj })
        .then(() => {
          this.dialogRef.close(true)
        })
    }
  }

  async verificaPazienteRichiesta(obj) {
    await this.service.postCallRequest({
      action: 'verificaPazienteRichiesta',
      param: obj,
    })
  }

  selectedPaziente(evt) {
    this.formRichiesta.get('nome').setValue(evt.nome)
    this.formRichiesta.get('cognome').setValue(evt.cognome)
    this.formRichiesta.get('cf').setValue(evt.cf)
    this.formRichiesta.get('dataNascita').setValue(evt.dataNascita)
    this.formRichiesta.get('sesso').setValue(evt.sesso)

    this.formRichiesta.get('nome').disable()
    this.formRichiesta.get('cognome').disable()
    this.formRichiesta.get('cf').disable()
    this.formRichiesta.get('dataNascita').disable()
    this.formRichiesta.get('sesso').disable()

    this.idPazienteSelezionato = evt.idPaziente
  }

  svuotaPaziente() {
    this.formRichiesta.get('nome').reset()
    this.formRichiesta.get('cognome').reset()
    this.formRichiesta.get('cf').reset()
    this.formRichiesta.get('dataNascita').reset()
    this.formRichiesta.get('sesso').reset()
    this.formRichiesta.get('paziente').reset()

    this.formRichiesta.get('nome').enable()
    this.formRichiesta.get('cognome').enable()
    this.formRichiesta.get('cf').enable()
    this.formRichiesta.get('dataNascita').enable()
    this.formRichiesta.get('sesso').enable()

    this.idPazienteSelezionato = null
  }
  /**
   *  Funzione che gestisce la visualizzazione dei campi nel form dipendenti dal tipo Prestazione
   * @param val  -id prestazione
   */
  selectedTipoPrestazione(val) {
    //enum da fare
    if (val === this.tipoPrestazione.VisitaDomicilio) {
      //visita a domicilio
      this.isVisitaDomicilio = true
      this.formRichiesta.controls.durataPrestazione.enable()

      //perchè essendo a casa non sarà in nessun ambulatorio
      this.formRichiesta.controls.ambulatorio.disable()
      this.formRichiesta.controls.ambulatorio.clearValidators()

      this.formRichiesta.controls.durataPrestazione.setValidators([Validators.required])

      this.formRichiesta.controls.motivoRichiesta.setValue('controllo domiciliare')
      this.formRichiesta.controls.tipoRichiesta.setValue(
        this.tipoRichiesta.AccettazioneDiretta
      )
    } else {
      this.isVisitaDomicilio = false
      this.formRichiesta.controls.ambulatorio.enable()
      this.formRichiesta.controls.ambulatorio.setValidators([Validators.required])

      this.formRichiesta.controls.durataPrestazione.disable()
      this.formRichiesta.controls.durataPrestazione.clearValidators()
      // this.formRichiesta.controls.motivoRichiesta.reset()
    }

    //aggiorno il form
    this.formRichiesta.updateValueAndValidity()
  }

  /**
   * Cambio data nel filtro quando uso picer
   * @param
   * @param ricellField
   */
  changeDate($event) {
    const data = moment($event).format('DD/MM/YYYY')
    this.formFiltriPaziente.controls.nascita.reset()
    this.formFiltriPaziente.controls.nascita.setValue(data)
  }

  cambiaRicerca(value) {
    //debugger
    this.ancheEsterni = value
  }

  //#region esterna
  async searchPaziente() {
    /** Guardo se abilitata la ricerca esterna per capire quanti cambi sono abilitati , per tutta la ricerca metto rquisito per*/

    try {
      if (
        this.formFiltriPaziente.get('cf').valid &&
        this.formFiltriPaziente.get('cf').value != null
      ) {
      } else {
        this.appGen.loadingPanel.show()
        let count = 0

        // se abbilitata la esterna cambio i numero di campi obbligatori
        let minFiledCompiled = 1

        switch (this.ricercaSelezionata) {
          case TipoRicerca.Entrambi:
          case TipoRicerca.Esterna:
            minFiledCompiled = 2
            break
          default:
            minFiledCompiled = 1
            break
        }

        this.formFiltriPaziente.controls.nome.value != null &&
        this.formFiltriPaziente.controls.nome.valid
          ? count++
          : null
        this.formFiltriPaziente.controls.cognome.value != null &&
        this.formFiltriPaziente.controls.cognome.valid
          ? count++
          : null
        this.formFiltriPaziente.controls.nascita.value != null &&
        this.formFiltriPaziente.controls.nascita.valid
          ? count++
          : null

        count = 2
        if (count >= minFiledCompiled) {
        } else {
          Swal.fire({
            icon: 'error',
            iconColor: '#d33',
            title: 'Impossibile effettuare la ricerca',
            text: 'Inserire il codice fiscale o, in mancanza di esso almeno due campi',
          })
          return null
        }
      }

      const filtro: FiltroRicercaPaziente = new FiltroRicercaPaziente({
        nome: this.formFiltriPaziente.get('nome').value,
        cognome: this.formFiltriPaziente.get('cognome').value,
        cf: this.formFiltriPaziente.get('cf').value,
        nosologico: this.formFiltriPaziente.get('cf').value,
        dataNascita: this.formFiltriPaziente.get('nascita').value
          ? moment(this.formFiltriPaziente.get('nascita').value, 'DD/MM/YYYY').format()
          : null,
      })
      this.listaPazientiPerRichiesta.data = []
      switch (this.ricercaSelezionata) {
        case TipoRicerca.Entrambi:
          // richiamo interna e esterna
          await this.ricercaEsterna(filtro)
          await this.ricercaInterna(filtro)
          break

        case TipoRicerca.Interna:
          // richiamo solo interna
          await this.ricercaInterna(filtro)
          break

        case TipoRicerca.Esterna:
          // richiamo solo esterna
          await this.ricercaEsterna(filtro)
          break
      }
      this.visualizzaTabellaPazienti = true
      this.messageVisibile = true
      this.appGen.loadingPanel.hide()
      // Imposto le pagine e numero di delementi
      //this.listaPazientiPerRichiesta.paginator = this.paginator

      /* let obj = new Object()
    obj = {
      Nome: this.formFiltriPaziente.get('nome').value,
      Cognome: this.formFiltriPaziente.get('cognome').value,
      Cf: this.formFiltriPaziente.get('cf').value,
      DataNascita: this.formFiltriPaziente.get('nascita').value
        ? moment(this.formFiltriPaziente.get('nascita').value, 'DD/MM/YYYY').format()
        : null,
      page: 0,
      elementForPage: 10,
    }
  
    await this.service
      .postCallRequest({ action: 'listapazienti', param: obj, loadingPanel: false })
      .then((data) => {
        this.listaPazienti = data['listaPazienti']
        setTimeout(() => {
          this.pazienteSelect.open()
        }, 0)
      })*/
    } catch (error) {
      console.error(error)
      this.appGen.loadingPanel.hide()
    }
  }

  /**
   * Funzione della ricerca pazienti esterni
   * @param filtro - filtro del paziente
   */
  async ricercaEsterna(filtro: FiltroRicercaPaziente) {
    try {
      //debugger
      this.listaPazientiPerRichiesta.data = this.listaPazientiPerRichiesta.data.concat(
        await firstValueFrom(this.pazienteHttp.listaPazientiEsterni(filtro))
      )
    } catch (error) {
      console.error(error)
      this.appGen.notificate.error('Problema con la ricerca esterna')
    }
  }

  /**
   * Funzione della ricerca pazienti interni
   * @param filtro - filtro del paziente
   */
  async ricercaInterna(filtro: FiltroRicercaPaziente) {
    try {
      //!BUG sambiare come vienie gestita listapazienti da altre parti xk ho disabilitato il warning quando non torna nessuno paziente
      //debugger
      this.listaPazientiPerRichiesta.data = this.listaPazientiPerRichiesta.data.concat(
        await firstValueFrom(this.pazienteHttp.listaPazientiInterni(filtro))
      )
    } catch (error) {
      console.error(error)
      this.appGen.notificate.error('Problema con la ricerca interna')
    }
  }

  async usaPazienteSelezionato(paziente: PazienteNuovaRichiesta) {
    let _pazienteRichiesta = null
    // ho selezionato il paziente interno devo fare una nuova ricerca per paziente esterno ma informo prima il l'utente
    // se esterna è abbilitata
    if (!paziente.esterno && this.ancheEsterni) {
      _pazienteRichiesta = await this.cercaAlEsternoConCF(paziente)

      // Se non norna nessun paziente allora uso la richiesta interna per paziente interno altrimenti uso la esterna
      //_verificaPazienteEsterno? insertRichiestaInterna(paziente): insertRichiestaEsterna(_verificaPazienteEsterno)
    } else {
      // ho selezionato il paziente esterno quindi posso gia fare la richiesta
      _pazienteRichiesta = paziente
    }

    // creo la form
    this.creaFormPaziente(_pazienteRichiesta)
    this.visualizzaTabellaPazienti = false
    this.visualizzaNuovaRichiesta = true

    if (this.tipoRichiestaRoute === TipoRichiesta.Reparto) {
      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoPrestazione')
        .setValue(TipoPrestazione.PrimaVisita)
      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoRichiesta')
        .setValue(TipoRichiesta.Reparto)
      // cambio campi visibili nel form, dipende da TipoPrestazione
      this.selectedTipoPrestazione(TipoPrestazione.PrimaVisita)
    } else if (this.tipoRichiestaRoute === this.tipoRichiesta.Distretto) {
      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoPrestazione')
        .setValue(TipoPrestazione.VisitaDomicilio)
      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoRichiesta')
        .setValue(TipoRichiesta.Distretto)
      // cambio campi visibili nel form, dipende da TipoPrestazione
      this.selectedTipoPrestazione(TipoPrestazione.VisitaDomicilio)
    } else if (_pazienteRichiesta.esterno) {
      // se paziente esterno e non richiesta orderenry o distretto imposto visitita di controllo come richiesta di default
      this.formRichiestaEsterna
        .get('richiesta')
        .get('tipoRichiesta')
        .setValue(TipoPrestazione.VisitaControllo)
      // cambio campi visibili nel form, dipende da TipoPrestazione
      this.selectedTipoPrestazione(TipoPrestazione.VisitaControllo)
    }

    if (_pazienteRichiesta) {
      //this.formRichiestaEsterna.
    }
  }

  /**
   *Ricerca esterna con il marge
   * @param cf - codice fiscale del paziente selezionato
   */
  async cercaAlEsternoConCF(paziente: PazienteNuovaRichiesta) {
    try {
      if (paziente && paziente.cf) {
        Swal.fire({
          title: 'Verifica esterna',
          html: "Prima di procedere, il sistema deve verificare se il paziente selezionato è presente nell'anagrafica esterna.",
          icon: 'info',
          //  iconColor: '#d33',
          showCancelButton: false,
          confirmButtonColor: '#00afa6',
          //  cancelButtonColor: '#d33',
          confirmButtonText: 'Procedi',
          //  cancelButtonText: 'No, annulla',
        })
          .then(async (result) => {
            if (result.isConfirmed) {
              this.appGen.loadingPanel.show()
              const filtro: FiltroRicercaPaziente = new FiltroRicercaPaziente({
                cf: paziente.cf,
              })
              const _pazienteEsterno: PazienteNuovaRichiesta[] = await firstValueFrom(
                this.pazienteHttp.listaPazientiEsterni(filtro)
              )

              // se ci sono piu righe invio errore
              if (_pazienteEsterno && _pazienteEsterno.length > 1) {
                this.appGen.notificate.error(
                  "L'anagrafica esterna contiene i dati sporchi"
                )
                return null
              }
              // tutto ok torno i dati del paziente nuovo
              //     this.visualizzaTabellaPazienti = false
              //   this.visualizzaNuovaRichiesta = true
              // se trovo nuovo paziente lo torno se no torno paziente iniziale (locale)
              return _pazienteEsterno && _pazienteEsterno.length == 1
                ? _pazienteEsterno[0]
                : paziente
            }
          })
          .finally(() => {
            this.appGen.loadingPanel.hide()
          })
      } else {
        throw new Error('Dati insufficienti per la ricerca esterna')
      }
    } catch (error) {
      this.appGen.loadingPanel.hide()
      this.appGen.notificate.error(error.message)
    }
  }

  /** Lista delle Priorita */
  async getListaPriorita() {
    this.listaUrgenze = await firstValueFrom(this.richiesteHttp.getPriorita())
  }

  /** Get tipi richiesta */
  async getTipiRichiesta() {
    this.listaTipiRichieste = await firstValueFrom(this.richiesteHttp.getTipiRichieste())
  }

  async getListaTipiPrestazione() {
    this.listaTipoPrestazione = await firstValueFrom(
      this.richiesteHttp.getListaTipiPrestazione()
    )
  }

  async getListaAmbulatori() {
    this.listaAmbulatori = await firstValueFrom(this.richiesteHttp.getListaAmbulatori())
  }
  // prova555
  /**Lista Medici */
  async getListaMedici() {
    if (!this.authGuard.canRole(this.tipoUtente.Distretto)) {
      this.listaMedici = await firstValueFrom(this.commonHttp.listaMedici(Ruoli.Medico))
    } else if (this.authGuard.canRole(this.tipoUtente.Distretto)) {
      this.listaMedici = await firstValueFrom(
        this.distrettiService.getMediciXDistrettoXRichiesta(TipoEnti.Distretto)
      )
      if (this.listaMedici.length === 1) {
        this.formRichiestaEsterna
          .get('richiesta')
          .get('idMedicoPrincipale')
          .setValue(this.listaMedici[0].matricola)
        this.formRichiestaEsterna.get('richiesta').get('idMedicoPrincipale').disable()
      }
    }
  }

  /** Lista Dietiste */
  async getListaDietisti() {
    this.listaDietisti = await firstValueFrom(this.commonHttp.listaMedici(Ruoli.Dietista))
  }
  /** Lista Infermiere */
  async getListaInfermiere() {
    this.listaInfermiere = await firstValueFrom(
      this.commonHttp.listaMedici(Ruoli.Infermiere)
    )
  }

  resetForm() {
    this.formRichiestaEsterna.reset()
    this.formRichiestaEsterna.enable()
    this.setFormFields()
  }

  backToPrevious() {
    this.backPreviousPage.back()
  }

  async inviaNuovaRichiesta() {
    try {
      // Controllo se la form è valida se non esco
      if (
        !this.formRichiestaEsterna.valid
      ) {
        this.appGen.hasValidateFormFields(this.formRichiestaEsterna.get('richiesta'))
        //console.log("----------------------------------")
        this.appGen.hasValidateFormFields(this.formRichiestaEsterna.get('anagrafica'))
        this.appGen.validateAllFormFields(this.formRichiestaEsterna);
        return
      }
      // form è valida devo prendere i dati e mappare a una richiesta ( o gestita internamento o estarnemante)

      const pazienteFromForm = this.formRichiestaEsterna.getRawValue();
      const richiestaFromForm = pazienteFromForm.richiesta;

      // cancello la richiesta per aver il paziente pulito
      if (pazienteFromForm.hasOwnProperty('richiesta')) {
        delete pazienteFromForm?.richiesta
      }

      const _paziente: PazienteNuovaRichiesta = {
        ...this.pazienteSelezionatoXRichiesta,
        ...pazienteFromForm.anagrafica,
      }
      //console.log(_paziente)
      //debugger;
      const _richiesta: NuovaRichiesta = new NuovaRichiesta(
        richiestaFromForm.idMedicoPrincipale,
        richiestaFromForm.tipoRichiesta,
        richiestaFromForm.tipoPrestazione,
        richiestaFromForm.priorita,
        richiestaFromForm.dataPrestazione,
        richiestaFromForm.motivoRichiesta,
        richiestaFromForm.idMedicoSecondario,
        richiestaFromForm.ambulatorio,
        richiestaFromForm.infermiera,
        richiestaFromForm.nosologico,
        richiestaFromForm.postodegenza
      )
      const nuovaRichiesta = new NuovaRichiestaDaInviare(_paziente, _richiesta)
      await firstValueFrom(this.richiesteHttp.postNuovaRichiesta(nuovaRichiesta))
      //**se tutto ok torno  nel dietro  */
      this.backPreviousPage.back()
    } catch (error) {
      console.error(error)
    }
  }
  /*
  this.pazienteSelezionatoXRichiesta={
 this.formRichiestaEsterna.controls.r
}


  new NuovaRichiesta
 const x = new NuovaRichiestaDaInviare(this.pazienteSelezionatoXRichiesta,{})
*/

  setFiltriSelect() {
    this.filtroComuneResidenza.valueChanges
      .pipe(debounceTime(500), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraComune(this.filtroComuneResidenza.value, TipoIndirizzo.Residenza)
      })

    this.filtroComuneDomicilio.valueChanges
      .pipe(debounceTime(500), takeUntil(this._onDestroy))
      .subscribe((item: string) => {
        this.filtraComune(item, TipoIndirizzo.Domicilio)
      })
  }

  async filtraComune(stringaRicerca: string, tipo: TipoIndirizzo) {
    switch (tipo) {
      case TipoIndirizzo.Residenza:
        if (stringaRicerca.length >= 2) {
          this.listaComuniResidenza = []
          this.listaComuniResidenza = await firstValueFrom(
            this.pazienteHttp.ricercaComuneByDescrizione(stringaRicerca)
          )
          let listaFiltrataOrdinata: any = []
          listaFiltrataOrdinata = this.prodServ.filtroComuni(
            stringaRicerca,
            this.listaComuniResidenza
          )
          this.comuniResidenzaFiltrate.next(listaFiltrataOrdinata.slice())
        }
        break

      case TipoIndirizzo.Domicilio:
        if (stringaRicerca.length >= 2) {
          this.listaComuniDomicilio = []
          this.listaComuniDomicilio = await firstValueFrom(
            this.pazienteHttp.ricercaComuneByDescrizione(stringaRicerca)
          )
          let listaFiltrataOrdinata: any = []
          listaFiltrataOrdinata = this.prodServ.filtroComuni(
            stringaRicerca,
            this.listaComuniDomicilio
          )
          this.comuniDomicilioFiltrati.next(listaFiltrataOrdinata.slice())
        }
        break

      default:
        break
    }
  }

  setCap(comuneId: any, tipo: TipoIndirizzo) {
    try {
      let comune
      switch (tipo) {
        case TipoIndirizzo.Domicilio:
          // cerco il comune con id passato nel comuneId
          comune = _.findWhere(this.listaComuniDomicilio, { idComune: comuneId })
          if (comune) {
            this.formRichiestaEsterna
              .get('anagrafica')
              .get('capDomicilio')
              .setValue(comune.cap)
            this.formRichiestaEsterna
              .get('anagrafica')
              .get('comuneDomicilioCodice')
              .setValue(comune.codiceIstat)
          }

          break
        case TipoIndirizzo.Residenza:
          comune = _.findWhere(this.listaComuniResidenza, { idComune: comuneId })
          if (comune) {
            this.formRichiestaEsterna
              .get('anagrafica')
              .get('capResidenza')
              .setValue(comune.cap)
            this.formRichiestaEsterna
              .get('anagrafica')
              .get('comuneResidenzaCodice')
              .setValue(comune.codiceIstat)
          }
          break
      }
    } catch (error) {
      console.error(error)
    }
  }
}

//#endregion esterna
