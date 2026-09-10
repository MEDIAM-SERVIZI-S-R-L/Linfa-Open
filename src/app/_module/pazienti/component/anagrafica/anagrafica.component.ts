import { Component, OnInit, Input } from '@angular/core'
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms'
import {
  AnagraficaPaziente,
  Paziente,
  Persona,
  Domicilio,
  Residenza,
} from '../../_dto-pazienti/dto-pazienti'
import { Router, ActivatedRoute } from '@angular/router'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { mail, StepPaziente, TipoIndirizzo } from 'src/app/_core/helpers/enums'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { Location } from '@angular/common'
import { ModalDocumentoPrivacyComponent } from 'src/app/shared/modal/modal-documento-privacy/modal-documento-privacy.component'
import { MatDialog } from '@angular/material/dialog'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { ReportService } from 'src/app/_core/services/report.service'
import {
  StatoCivile,
  Convivenze,
  TitoliStudio,
  LivelliPrivacy,
  Regione,
  Provincia,
} from 'src/app/_dtos/models_old'
import { takeUntil, take, debounceTime } from 'rxjs/operators'
import { firstValueFrom, ReplaySubject, Subject, Subscription } from 'rxjs'
import moment from 'moment'
import _ from 'underscore'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import { Comune } from 'src/app/_models/paziente'
import { FiltroProdottiService } from 'src/app/_core/services/prodotti.service'

@Component({
  selector: 'app-anagrafica',
  templateUrl: './anagrafica.component.html',
  styleUrls: ['./anagrafica.component.scss'],
})
export class AnagraficaComponent implements OnInit {
  tipoIndirizzo = TipoIndirizzo
  stepEnum = StepPaziente
  step = this.stepEnum.Anagrafica

  formAnagrafica: FormGroup
  idPaziente: string
  idVisita: string
  validitaPrivacy: string
  //liste
  listaStatoCivile: StatoCivile[]
  listaConvivenze: Convivenze[]
  listaTitoliStudio: TitoliStudio[]
  livelliPrivacy: LivelliPrivacy[]
  listaNucleoFamiliare : number[] = [];
  listaRegioni
  //nascita
  listaProvinceNascita
  listaComuniNascita
  //residenza
  listaProvinceResidenza
  listaComuniResidenza
  //domicilio
  listaProvinceDomicilio
  listaComuniDomicilio

  //boolean
  isSameAdress = true
  bEdit = false
  isNuovaVisita = false
  isRiepilogo = false
  privacyFirmata = false
  ricercaTramiteComuneXResidenza = false;
  ricercaTramiteComuneXDomicilio = false;
  ricercaTramiteComuneXNascita = false;
  mailAssente = false;

  //obj
  queryParams: any = {}
  ricercaParam: any
  params: any

  @Input() stepper: any
  @Input() isRiepilogoVisita: boolean

  protected _onDestroy = new Subject<void>()

  public filtroRegioniNascita: FormControl = new FormControl()
  public filtroRegioniResidenza: FormControl = new FormControl()
  public filtroRegioniDomicilio: FormControl = new FormControl()
  public filtroProvinciaNascita: FormControl = new FormControl()
  public filtroProvinciaDomicilio: FormControl = new FormControl()
  public filtroProvinciaResidenza: FormControl = new FormControl()

  public filtroComuneNascita: FormControl = new FormControl()
  public filtroComuneDomicilio: FormControl = new FormControl()
  public filtroComuneResidenza: FormControl = new FormControl()

  public filtroComuneResidenzaXDescr : FormControl = new FormControl()
  public filtroComuneDomicilioXDescr : FormControl = new FormControl()
  public filtroComuneNascitaXDescr : FormControl = new FormControl()

  public regioniResidenzaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public regioniNascitaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public regioniDomicilioFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)

  public provinceResidenzaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public provinceNascitaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public provinceDomicilioFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)

  public comuniResidenzaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public comuniNascitaFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)
  public comuniDomicilioFiltrate: ReplaySubject<[]> = new ReplaySubject<[]>(1)

  constructor(
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public appGen: AppGeneralService,
    private notificate: SnackBarService,
    private backPreviousPage: Location,
    private dialog: MatDialog,
    private report: ReportService,
    private pazienteServ: PazienteService,
    private prodServ : FiltroProdottiService
  ) {
    this.appGen.loadingPanel.show()
  }
 x: Subscription
  async ngOnInit(): Promise<void> {
    if (this.appGen.isNullOrUndefined(this.isRiepilogoVisita)) {
      this.isRiepilogoVisita = false
    }

    this.generateForm()
    if (this.isRiepilogoVisita) {
      this.formAnagrafica.disable()
    }

    if (this.appGen.configLinfa.PrivacyAbilitata) {
      this.getLivelliPrivacy()
    }

    this.setOrDisableValidators(true)

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')

    await this.service.getCallRequest({ action: 'regioni' }).then((data) => {
      this.listaRegioni = data

      this.regioniDomicilioFiltrate.next(this.listaRegioni.slice())
      this.regioniResidenzaFiltrate.next(this.listaRegioni.slice())
      this.regioniNascitaFiltrate.next(this.listaRegioni.slice())
      this.setFiltriSelect();
      this.setFiltriRicercaTramiteComune();
    })

    await this.service
      .getCallRequest({ action: 'statocivili' })
      .then((data) => (this.listaStatoCivile = data))
    await this.service
      .getCallRequest({ action: 'convivenze' })
      .then((data) => (this.listaConvivenze = data))
    await this.service
      .getCallRequest({ action: 'titoliStudio' })
      .then((data) => (this.listaTitoliStudio = data))

    const retrievedObject = sessionStorage.getItem('ricercaParamPaziente')
    this.ricercaParam = JSON.parse(retrievedObject)

    if (!this.appGen.isNullOrUndefined(this.ricercaParam)) {
      this.isRiepilogo = true

      this.riepilogoForm(this.idPaziente)
    } else {
      const retrievedObject = sessionStorage.getItem('dettaglioStoricoPaziente')
      this.ricercaParam = JSON.parse(retrievedObject)
      if (!(this.ricercaParam === null || this.ricercaParam === undefined)) {
        if (!this.ricercaParam.isDettaglioVisita) {
          this.isNuovaVisita = true
        }
        this.idPaziente = this.ricercaParam.idPaziente
        this.riepilogoForm(this.idPaziente)
      }
    }

    this.activateRoute.queryParams.subscribe((params) => {
      if (!this.appGen.isNullOrUndefined(params.visit)) {
        this.idVisita = params.visit
        this.isNuovaVisita = true
      }
    })

    //Se non ci sono parametri in sessione
    if (this.appGen.isNullOrUndefined(this.ricercaParam)) {
      //Sono nel dettaglio durante la creazione
      if (!this.appGen.isNullOrUndefined(this.idPaziente)) {
        this.isRiepilogo = true
        this.riepilogoForm(this.idPaziente)
      } else {
        //Mi arrivano i parametri dall'url (integrazione con sapio)
        this.activateRoute.queryParams.subscribe((params) => {
          this.params = params
        })
        if (!(this.params.cf === null || this.params.cf === undefined)) {
          const objRequest = {
            action: 'checkPaziente',
            param: this.params,
          }
          const objPaziente = await this.service.postCallRequest(objRequest)
          if (objPaziente.exist) {
            this.isRiepilogo = true
            await this.setValueForm(objPaziente.paziente);
            await this.checkEmail(objPaziente.paziente)

            this.appGen.loadingPanel.hide()
          } else {
            this.formAnagrafica.controls.Cognome.setValue(this.params.cognome)
            this.formAnagrafica.controls.CF.setValue(this.params.cf)
            this.formAnagrafica.controls.Nome.setValue(this.params.nome)
            this.formAnagrafica.controls.Sesso.setValue(this.params.sesso)
            this.formAnagrafica.controls.DataNascita.setValue(this.params.datanascita)
            this.notificate.error('Paziente non esistente, si prega di crearlo')
          }
        }
      }
    }

    if (this.isRiepilogo || this.isRiepilogoVisita) {
      this.formAnagrafica.controls.CF.disable()
    }

    this.buildArrayNNucleoFamiliare();

    this.appGen.loadingPanel.hide()
  }

  buildArrayNNucleoFamiliare(){
    for (let i = 1; i <= 20; i++) {
      this.listaNucleoFamiliare.push(i);
    }
  }

  estero = false

  async natoEstero(evt) {
    if (evt.checked) {
      this.ricercaTramiteComuneXNascita = false;
      const estero = this.listaRegioni.filter((r) => r.cod === '999')[0]
      if (!this.appGen.isNullOrUndefined(estero)) {
        this.estero = true
        await this.getProvincia(estero.idRegione, TipoIndirizzo.Nascita)

        this.formAnagrafica.controls.RegioneNascita.setValue(estero.idRegione)
        const provinciaEstero = this.listaProvinceNascita[0]

        this.formAnagrafica.controls.ProvinciaNascita.setValue(
          provinciaEstero.idProvincia
        )

        await this.getComuni(provinciaEstero.idProvincia, TipoIndirizzo.Nascita)

        this.formAnagrafica.controls.ComuneNascita.reset()
      }
    } else {
      this.estero = false
      this.formAnagrafica.controls.RegioneNascita.reset()
      this.formAnagrafica.controls.ProvinciaNascita.reset()
      this.formAnagrafica.controls.ComuneNascita.reset()
    }
  }

/**
 * FUNZIONE SUL CHECK CHE ATTIVA E DISATTIVA LA POSSIBILITA DI CERCARE TRAMITE IL COMUNE
 * @param tipoIndirizzo tIPO DI INDIRIZZO PASSATO
 */
  statusRicercaComune(tipoIndirizzo){   

    switch (tipoIndirizzo) {
      case TipoIndirizzo.Residenza:
        this.ricercaTramiteComuneXResidenza = !this.ricercaTramiteComuneXResidenza;
        this.formAnagrafica.controls.RegioneResidenza.reset();
        this.formAnagrafica.controls.ProvinciaResidenza.reset();
        this.formAnagrafica.controls.ComuneResidenza.reset();
        this.listaComuniResidenza = [];
        this.comuniResidenzaFiltrate.next(this.listaComuniResidenza.slice())
        break;

      case TipoIndirizzo.Domicilio :
        this.ricercaTramiteComuneXDomicilio = !this.ricercaTramiteComuneXDomicilio;
        this.formAnagrafica.controls.RegioneDomicilio.reset();
        this.formAnagrafica.controls.ProvinciaDomicilio.reset();
        this.formAnagrafica.controls.ComuneDomicilio.reset();
        this.listaComuniDomicilio = [];
        this.comuniDomicilioFiltrate.next(this.listaComuniDomicilio.slice())
        break;

        case TipoIndirizzo.Nascita :
          this.ricercaTramiteComuneXNascita= !this.ricercaTramiteComuneXNascita;
          this.formAnagrafica.controls.RegioneNascita.reset();
          this.formAnagrafica.controls.ProvinciaNascita.reset();
          this.formAnagrafica.controls.ComuneNascita.reset();
          this.listaComuniNascita= [];
          this.comuniNascitaFiltrate.next(this.listaComuniNascita.slice())
          break;
    
      default:
        break;
    }
  }

  setFiltriSelect() {
    // listen for search field value changes
    this.filtroRegioniResidenza.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraRegioni(this.filtroRegioniResidenza, TipoIndirizzo.Residenza)
      })
    this.filtroRegioniNascita.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraRegioni(this.filtroRegioniNascita, TipoIndirizzo.Nascita)
      })
    this.filtroRegioniDomicilio.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraRegioni(this.filtroRegioniDomicilio, TipoIndirizzo.Domicilio)
      })

    this.filtroProvinciaResidenza.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraProvince(this.filtroProvinciaResidenza, TipoIndirizzo.Residenza)
      })
    this.filtroProvinciaDomicilio.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraProvince(this.filtroProvinciaDomicilio, TipoIndirizzo.Domicilio)
      })
    this.filtroProvinciaNascita.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraProvince(this.filtroProvinciaNascita, TipoIndirizzo.Nascita)
      })

    this.filtroComuneResidenza.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraComuni(this.filtroComuneResidenza, TipoIndirizzo.Residenza)
      })
    this.filtroComuneDomicilio.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraComuni(this.filtroComuneDomicilio, TipoIndirizzo.Domicilio)
      })
    this.filtroComuneNascita.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraComuni(this.filtroComuneNascita, TipoIndirizzo.Nascita)
      })
  }

  protected filtraRegioni(regione, tipo: TipoIndirizzo) {
    if (!this.listaRegioni) {
      return
    }
    // get the search keyword
    let search = regione.value

    switch (tipo) {
      case TipoIndirizzo.Residenza:
        if (!search) {
          this.regioniResidenzaFiltrate.next(this.listaRegioni.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.regioniResidenzaFiltrate.next(
          this.listaRegioni.filter(
            (bank) => bank.regione.toLowerCase().indexOf(search) > -1
          )
        )
        break
      case TipoIndirizzo.Nascita:
        if (!search) {
          this.regioniNascitaFiltrate.next(this.listaRegioni.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.regioniNascitaFiltrate.next(
          this.listaRegioni.filter(
            (bank) => bank.regione.toLowerCase().indexOf(search) > -1
          )
        )

        break
      case TipoIndirizzo.Domicilio:
        if (!search) {
          this.regioniDomicilioFiltrate.next(this.listaRegioni.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.regioniDomicilioFiltrate.next(
          this.listaRegioni.filter(
            (bank) => bank.regione.toLowerCase().indexOf(search) > -1
          )
        )

        break

      default:
        break
    }
  }

  protected filtraComuni(regione, tipo: TipoIndirizzo) {
    // get the search keyword
    let search = regione.value

    switch (tipo) {
      case TipoIndirizzo.Residenza:
        if (!this.listaComuniResidenza) {
          return
        }
        if (!search) {
          this.comuniResidenzaFiltrate.next(this.listaComuniResidenza.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.comuniResidenzaFiltrate.next(
          this.listaComuniResidenza.filter(
            (bank) => bank.comune.toLowerCase().indexOf(search) > -1
          )
        )
        break
      case TipoIndirizzo.Nascita:
        if (!this.listaComuniNascita) {
          return
        }
        if (!search) {
          this.comuniNascitaFiltrate.next(this.listaComuniNascita.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.comuniNascitaFiltrate.next(
          this.listaComuniNascita.filter(
            (bank) => bank.comune.toLowerCase().indexOf(search) > -1
          )
        )

        break
      case TipoIndirizzo.Domicilio:
        if (!this.listaComuniDomicilio) {
          return
        }
        if (!search) {
          this.comuniDomicilioFiltrate.next(this.listaComuniDomicilio.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.comuniDomicilioFiltrate.next(
          this.listaComuniDomicilio.filter(
            (bank) => bank.comune.toLowerCase().indexOf(search) > -1
          )
        )

        break

      default:
        break
    }
  }

  protected filtraProvince(regione, tipo: TipoIndirizzo) {
    // get the search keyword
    let search = regione.value

    switch (tipo) {
      case TipoIndirizzo.Residenza:
        if (!this.listaProvinceResidenza) {
          return
        }
        if (!search) {
          this.provinceResidenzaFiltrate.next(this.listaProvinceResidenza.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.provinceResidenzaFiltrate.next(
          this.listaProvinceResidenza.filter(
            (bank) => bank.provincia.toLowerCase().indexOf(search) > -1
          )
        )
        break
      case TipoIndirizzo.Nascita:
        if (!this.listaProvinceNascita) {
          return
        }
        if (!search) {
          this.provinceNascitaFiltrate.next(this.listaProvinceNascita.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.provinceNascitaFiltrate.next(
          this.listaProvinceNascita.filter(
            (bank) => bank.provincia.toLowerCase().indexOf(search) > -1
          )
        )

        break
      case TipoIndirizzo.Domicilio:
        if (!this.listaProvinceDomicilio) {
          return
        }
        if (!search) {
          this.provinceDomicilioFiltrate.next(this.listaProvinceDomicilio.slice())
          return
        } else {
          search = search.toLowerCase()
        }
        // filter the banks
        this.provinceDomicilioFiltrate.next(
          this.listaProvinceDomicilio.filter(
            (bank) => bank.provincia.toLowerCase().indexOf(search) > -1
          )
        )

        break

      default:
        break
    }
  }

  generateForm(): void {
    this.formAnagrafica = this.formBuilder.group({
      Nome: new FormControl(''),
      Cognome: new FormControl(''),
      CF: new FormControl(''),
      Sesso: new FormControl(''),
      DataNascita: new FormControl(null),
      DataDecesso: new FormControl(null, [
        Validators.pattern('([0-9]{2})/([0-9]{2})/([0-9]{4})'),
      ]),
      RegioneNascita: new FormControl(''),
      ProvinciaNascita: new FormControl(''),
      ComuneNascita: new FormControl(''),
      RegioneResidenza: new FormControl(''),
      ProvinciaResidenza: new FormControl(''),
      ComuneResidenza: new FormControl(''),
      IndirizzoResidenza: new FormControl(''),
      CapResidenza: new FormControl(''),
      RegioneDomicilio: new FormControl(''),
      ProvinciaDomicilio: new FormControl(''),
      ComuneDomicilio: new FormControl(''),
      CapDomicilio: new FormControl(''),
      IndirizzoDomicilio: new FormControl(''),
      Telefono1: new FormControl(''),
      Telefono2: new FormControl(''),
      Email: new FormControl({ value: '', disabled: this.isRiepilogoVisita }, [
        Validators.email,
      ]),
      StatoCivile: new FormControl(''),
      Convivenza: new FormControl(''),
      AltraConvivenza: new FormControl(''),
      nNucleoFamiliare : new FormControl(''),
      TitoloStudio: new FormControl(''),
      MMG: new FormControl(''),
      CodiceEsenzione: new FormControl('',[Validators.maxLength(10)]),
      OccupazioneAttuale: new FormControl(''),
      Privacy: new FormControl(''),
      DataFirmaPrivacy: new FormControl(''),
    })
  }

  get formAnagraficaControls() {
    return this.formAnagrafica.controls
  }

  async selectedPrivacy(val: number): Promise<void> {
    const param = {
      Privacy: val,
      IdPaziente: this.idPaziente,
    }

    const objRequest = {
      action: 'updatePrivacyPaziente',
      param: param,
    }
    await this.service.postCallRequest(objRequest).then((): void => {
      this.checkPrivacyExist()
    })
  }

  async getLivelliPrivacy(): Promise<void> {
    const objRequest = {
      action: 'getLivelliPrivacy',
    }
    await this.service.getCallRequest(objRequest).then((data) => {
      this.livelliPrivacy = data
    })
  }

  setOrDisableValidators(set: boolean): void {
    if (set) {
      this.formAnagrafica.controls.Nome.setValidators([Validators.required])
      this.formAnagrafica.controls.Cognome.setValidators([Validators.required])
      this.formAnagrafica.controls.CF.setValidators([
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$'
        ),
      ])
      this.formAnagrafica.controls.Sesso.setValidators([Validators.required])
      this.formAnagrafica.controls.DataNascita.setValidators([Validators.required])
      // this.formAnagrafica.controls.RegioneNascita.setValidators([Validators.required])
      // this.formAnagrafica.controls.ProvinciaNascita.setValidators([Validators.required])
      // this.formAnagrafica.controls.ComuneNascita.setValidators([Validators.required])
      this.formAnagrafica.controls.RegioneResidenza.setValidators([Validators.required])
      this.formAnagrafica.controls.ProvinciaResidenza.setValidators([Validators.required])
      this.formAnagrafica.controls.ComuneResidenza.setValidators([Validators.required])
      this.formAnagrafica.controls.IndirizzoResidenza.setValidators([Validators.required])
      // this.formAnagrafica.controls.Telefono1.setValidators([Validators.required])
      // this.formAnagrafica.controls.Email.setValidators([Validators.email])
    } else {
      this.formAnagrafica.controls.Nome.clearValidators()
      this.formAnagrafica.controls.Cognome.clearValidators()
      this.formAnagrafica.controls.CF.clearValidators()
      this.formAnagrafica.controls.Sesso.clearValidators()
      this.formAnagrafica.controls.DataNascita.clearValidators()
      this.formAnagrafica.controls.RegioneNascita.clearValidators()
      this.formAnagrafica.controls.ProvinciaNascita.clearValidators()
      this.formAnagrafica.controls.ComuneNascita.clearValidators()
      this.formAnagrafica.controls.RegioneResidenza.clearValidators()
      this.formAnagrafica.controls.ProvinciaResidenza.clearValidators()
      this.formAnagrafica.controls.ComuneResidenza.clearValidators()
      this.formAnagrafica.controls.IndirizzoResidenza.clearValidators()
      this.formAnagrafica.controls.Telefono1.clearValidators()
    }

    //aggiorno il form
    this.formAnagrafica.updateValueAndValidity()
  }

  async checkPrivacyExist(): Promise<void> {
    const objRequest = {
      action: 'checkPrivacyExist',
      param: this.idPaziente,
    }
    await this.service.getCallRequest(objRequest).then((res) => {
      if (!res.scaduta) {
        const data = new Date(res.dataPrivacy)
        this.formAnagrafica.get('Privacy').setValue(res.privacySelezionata)
        this.formAnagrafica.get('DataFirmaPrivacy').setValue(data)
        if (!this.appGen.isNullOrUndefined(res.validitaPrivacy)) {
          this.validitaPrivacy = res.validitaPrivacy
        }
        this.privacyFirmata = true
      } else {
        this.formAnagrafica.get('DataFirmaPrivacy').disable()
        this.formAnagrafica.updateValueAndValidity()
      }
    })
  }

  async goToVisita() {
    sessionStorage.removeItem('caregiverParam')
    sessionStorage.removeItem('dettaglioStoricoPaziente')

    const params = {
      IdVisita: this.idVisita,
      IdPaziente: this.idPaziente,
    }

    const objRequest = {
      action: 'updateVisitaIniziata',
      param: params,
    }
    await this.service.postCallRequest(objRequest).then((): void => {
      this.router.navigate(['/app/visite/step/anamnesi', this.idPaziente], {
        queryParams: { visit: this.idVisita },
      })
    })
  }

  async onSubmit(goFoward?: boolean): Promise<void> {
    if (!this.formAnagrafica.valid) {
      this.appGen.validateAllFormFields(this.formAnagrafica);
      this.notificate.error('È stato impossibile salvare in quanto alcuni campi obbligatori risultano non compilati')
      return
    }

    // if (this.formAnagrafica.get('ComuneNascita').value <= 0) {
    //   this.appGen.validateAllFormFields(this.formAnagrafica);
    //   return;
    // }

    const obj = new AnagraficaPaziente()

    obj.Persona = new Persona()
    obj.Domicilio = new Domicilio()
    obj.Residenza = new Residenza()
    obj.Paziente = new Paziente()

    //PERSONA
    obj.Persona.Nome = this.formAnagrafica.get('Nome').value
    obj.Persona.Cognome = this.formAnagrafica.get('Cognome').value
    obj.Persona.CF = this.formAnagrafica.get('CF').value
    obj.Persona.Sesso = this.formAnagrafica.get('Sesso').value

    //**!Importante usare per tutte le date formatazione come questa da DD/MM/YYYY -> datetime  */
    obj.Persona.DataNascita = this.formAnagrafica.get('DataNascita').value
      ? moment(this.formAnagrafica.get('DataNascita').value, 'DD/MM/YYYY').format()
      : null
    obj.Persona.DataDecesso = this.formAnagrafica.get('DataDecesso').value
      ? moment(this.formAnagrafica.get('DataDecesso').value, 'DD/MM/YYYY').format()
      : null

    this.appGen.convertToOnlyDate(this.formAnagrafica.get('DataNascita').value)

    obj.Persona.Telefono1 = this.formAnagrafica.get('Telefono1').value
    obj.Persona.Telefono2 = this.formAnagrafica.get('Telefono2').value
    obj.Persona.Email = this.formAnagrafica.get('Email').value
    obj.Persona.IdComuneNascita = this.formAnagrafica.get('ComuneNascita').value
    obj.Persona.IdPrivacy = this.formAnagrafica.get('Privacy').value
    obj.Persona.DataFirmaPrivacy = this.formAnagrafica.get('DataFirmaPrivacy').value

    //PAZIENTE
    // obj.paziente.codiceNosologico = ""; //TODO
    obj.Paziente.IdASL = 1 //TODO
    obj.Paziente.IdStatoCivile = this.formAnagrafica.get('StatoCivile').value
    obj.Paziente.IdTitoloStudio = this.formAnagrafica.get('TitoloStudio').value
    obj.Paziente.OccupazioneAttuale = this.formAnagrafica.get('OccupazioneAttuale').value
    obj.Paziente.IdConvivenza = this.formAnagrafica.get('Convivenza').value
    obj.Paziente.Mmg = this.formAnagrafica.get('MMG').value
    obj.Paziente.AltroConvivenza = this.formAnagrafica.get('AltraConvivenza').value
    obj.Paziente.nNucleoFamiliare = this.formAnagrafica.get('nNucleoFamiliare').value
    obj.Paziente.CodiceEsenzione = this.formAnagrafica.get('CodiceEsenzione').value

    //RESIDENZA
    obj.Residenza.IdComune = this.formAnagrafica.get('ComuneResidenza').value
    obj.Residenza.Indirizzo = this.formAnagrafica.get('IndirizzoResidenza').value
    obj.Residenza.CAP = this.formAnagrafica.get('CapResidenza').value
    obj.Residenza.IdTipoIndirizzo = this.tipoIndirizzo.Residenza

    //DOMICILIO
    if (this.isSameAdress) {
      obj.Residenza.IsUgualeDomicilio = true
    } else {
      obj.Residenza.IsUgualeDomicilio = false
      obj.Domicilio.IdComune = this.formAnagrafica.get('ComuneDomicilio').value
      obj.Domicilio.Indirizzo = this.formAnagrafica.get('IndirizzoDomicilio').value
      obj.Domicilio.CAP = this.formAnagrafica.get('CapDomicilio').value
      obj.Domicilio.IdTipoIndirizzo = this.tipoIndirizzo.Domicilio
    }

    obj.IdPaziente = this.appGen.isNullOrUndefined(this.idPaziente)
      ? null
      : this.idPaziente

    const objRequest = {
      action: 'InsertUpdatePaziente',
      param: obj,
    }

    await this.service.postCallRequest(objRequest).then((data): void => {
      if (this.isNuovaVisita) {
        if (goFoward) {
          if (this.appGen.configLinfa.PrivacyAbilitata) {
            this.router.navigate(['app/pazienti/step/privacy', this.idPaziente], {
              queryParams: { visit: this.idVisita },
            })
          } else {
            //  this.router.navigate(['app/pazienti/step/riepilogo', this.idPaziente], { queryParams: { visit: this.idVisita } });
            this.goToVisita()
          }
        }
      } else {
        this.idPaziente = data
        this.router.navigate(['app/pazienti'])
      }
    })
  }

  goFoward(): void {
    if (!this.appGen.isNullOrUndefined(this.idVisita)) {
      //sono nella compilazione della visita
      if (this.appGen.configLinfa.PrivacyAbilitata) {
        this.router.navigate(['app/pazienti/step/privacy', this.idPaziente], {
          queryParams: { visit: this.idVisita },
        })
      } else {
        // this.router.navigate(['app/pazienti/step/riepilogo', this.idPaziente], { queryParams: { visit: this.idVisita } });
        this.goToVisita()
      }
    } else {
      //inserimento del paziente
      this.router.navigate(['app/pazienti/step/caregivers', this.idPaziente])
    }
  }

  createAndSetSession(idPaziente: string): void {
    if (!(idPaziente === null || idPaziente === undefined)) {
      this.queryParams.idPaziente = idPaziente
    }
    sessionStorage.setItem('idPazienteParam', JSON.stringify(this.queryParams))
  }

  backToPrevious(): void {
    this.backPreviousPage.back()
  }

  sameAddressCheck(event: { checked: any }): void {
    if (event.checked) {
      this.isSameAdress = true;
      this.ricercaTramiteComuneXDomicilio = false;

      this.formAnagrafica.controls.RegioneDomicilio.clearValidators();
      this.formAnagrafica.controls.RegioneDomicilio.setErrors(null);
      this.formAnagrafica.controls.ProvinciaDomicilio.clearValidators();   
      this.formAnagrafica.controls.ProvinciaDomicilio.setErrors(null);
      this.formAnagrafica.controls.ComuneDomicilio.clearValidators(); 
      this.formAnagrafica.controls.ComuneDomicilio.setErrors(null);
      this.formAnagrafica.controls.IndirizzoDomicilio.clearValidators(); 
      this.formAnagrafica.controls.IndirizzoDomicilio.setErrors(null);
      this.formAnagrafica.updateValueAndValidity();
    } else {
      this.isSameAdress = false;
      
      this.formAnagrafica.controls.RegioneDomicilio.setValidators([Validators.required]);
      this.formAnagrafica.controls.ProvinciaDomicilio.setValidators([Validators.required]);   
      this.formAnagrafica.controls.ComuneDomicilio.setValidators([Validators.required]);  
      this.formAnagrafica.controls.IndirizzoDomicilio.setValidators([Validators.required]);  
      this.formAnagrafica.updateValueAndValidity();
    }
  }
/**
 *  funzione che imposta il Cap predefinito per il comune selezionato
 * @param comuneId  - id comune
 * @param tipo - tipo
 */
  setCap(comuneId: number, tipo: TipoIndirizzo) {  
    try {
      let comune
      switch (tipo) {
        case TipoIndirizzo.Domicilio:
          // cerco il comune con id passato nel comuneId
          comune = _.findWhere(this.listaComuniDomicilio, { idComune: comuneId })
          if (comune && comune.cap) {
            this.formAnagrafica.controls.CapDomicilio.setValue(comune.cap)
          }

          break
        case TipoIndirizzo.Residenza:
          comune = _.findWhere(this.listaComuniResidenza, { idComune: comuneId })
          if (comune && comune.cap) {
            this.formAnagrafica.controls.CapResidenza.setValue(comune.cap)
          }
          break
      }
    } catch (error) {
      console.error(error)
    }

  }


  setComuni(provinciaSelezionata: number, tipo: TipoIndirizzo, setComune = null): void {
    if (!this.appGen.isNullOrUndefined(provinciaSelezionata)) {
      const objRequest = {
        action: 'comuni',
        param: provinciaSelezionata,
      }
      this.service.getCallRequest(objRequest).then((data) => {
        switch (tipo) {
          case TipoIndirizzo.Domicilio:
            this.listaComuniDomicilio = data;
            this.formAnagrafica.get('ComuneDomicilio').reset()
            this.comuniDomicilioFiltrate.next(this.listaComuniDomicilio.slice())

            if(setComune){         
              this.formAnagrafica.controls.ComuneDomicilio.setValue(setComune.idComune);
              this.setCap(setComune.idComune, this.tipoIndirizzo.Domicilio);
              this.ricercaTramiteComuneXDomicilio = false;           
          }

            break
          case TipoIndirizzo.Residenza:
            this.listaComuniResidenza = data
            this.formAnagrafica.get('ComuneResidenza').reset()
            this.comuniResidenzaFiltrate.next(this.listaComuniResidenza.slice())

            if(setComune){         
              this.formAnagrafica.controls.ComuneResidenza.setValue(setComune.idComune);
              this.setCap(setComune.idComune, this.tipoIndirizzo.Residenza);
              this.ricercaTramiteComuneXResidenza = false;           
          }

            break
          case TipoIndirizzo.Nascita:
            this.listaComuniNascita = data
            this.formAnagrafica.get('ComuneNascita').reset()
            this.comuniNascitaFiltrate.next(this.listaComuniNascita.slice())

            if(setComune){         
              this.formAnagrafica.controls.ComuneNascita.setValue(setComune.idComune);
              this.ricercaTramiteComuneXNascita = false;           
          }

            break
          default:
            break
        }
      })
    } else {
      switch (tipo) {
        case TipoIndirizzo.Domicilio:
          this.listaComuniDomicilio = []
          this.formAnagrafica.get('ComuneDomicilio').reset()

          break
        case TipoIndirizzo.Residenza:
          this.listaComuniResidenza = []
          this.formAnagrafica.get('ComuneResidenza').reset()

          break
        case TipoIndirizzo.Nascita:
          this.listaComuniNascita = []
          this.formAnagrafica.get('ComuneNascita').reset()

          break
        default:
          break
      }
    }
  }

  async getComuni(provinciaSelezionata: number, tipo: TipoIndirizzo) {
    if (!this.appGen.isNullOrUndefined(provinciaSelezionata)) {
      await this.service
        .getCallRequest({ action: 'comuni', param: provinciaSelezionata })
        .then((data) => {
          switch (tipo) {
            case TipoIndirizzo.Domicilio:
              this.listaComuniDomicilio = data

              break
            case TipoIndirizzo.Residenza:
              this.listaComuniResidenza = data

              break
            case TipoIndirizzo.Nascita:
              this.listaComuniNascita = data
              break
            default:
              break
          }
        })
    }
  }

  async getProvincia(regioneSelezionata: number, tipo: TipoIndirizzo) {
    if (!this.appGen.isNullOrUndefined(regioneSelezionata)) {
      await this.service
        .getCallRequest({ action: 'provincia', param: regioneSelezionata })
        .then((data) => {
          switch (tipo) {
            case TipoIndirizzo.Domicilio:
              this.listaProvinceDomicilio = data
              this.provinceDomicilioFiltrate.next(this.listaProvinceDomicilio.slice())

              break
            case TipoIndirizzo.Residenza:
              this.listaProvinceResidenza = data
              this.provinceResidenzaFiltrate.next(this.listaProvinceResidenza.slice())
              break
            case TipoIndirizzo.Nascita:
              this.listaProvinceNascita = data
              this.provinceNascitaFiltrate.next(this.listaProvinceNascita.slice())

              break
            default:
              break
          }
        })
    }
  }

  setProvincia(regioneSelezionata: number, tipo: TipoIndirizzo, setProvincia = null): void {
    if (!this.appGen.isNullOrUndefined(regioneSelezionata)) { 
      this.service
        .getCallRequest({ action: 'provincia', param: regioneSelezionata })
        .then((data) => {
          switch (tipo) {
            case TipoIndirizzo.Domicilio:
              this.listaProvinceDomicilio = data
              this.listaComuniDomicilio = []
              this.formAnagrafica.get('ComuneDomicilio').reset()
              this.formAnagrafica.get('ProvinciaDomicilio').reset()

              this.provinceDomicilioFiltrate.next(this.listaProvinceDomicilio.slice())

              if(setProvincia){
                this.formAnagrafica.controls.ProvinciaDomicilio.enable();
                this.formAnagrafica.controls.ProvinciaDomicilio.setValue(setProvincia.idProvincia);
                this.setComuni(setProvincia.idProvincia, this.tipoIndirizzo.Domicilio, setProvincia);
              }

              break
            case TipoIndirizzo.Residenza:
              this.listaProvinceResidenza = data
              this.listaComuniResidenza = []
              this.formAnagrafica.get('ComuneResidenza').reset()
              this.formAnagrafica.get('ProvinciaResidenza').reset()
              this.provinceResidenzaFiltrate.next(this.listaProvinceResidenza.slice())

              if(setProvincia){
                this.formAnagrafica.controls.ProvinciaResidenza.enable();
                this.formAnagrafica.controls.ProvinciaResidenza.setValue(setProvincia.idProvincia);
                this.setComuni(setProvincia.idProvincia, this.tipoIndirizzo.Residenza, setProvincia);
              }

              break
            case TipoIndirizzo.Nascita:
              this.listaProvinceNascita = data
              this.listaComuniNascita = []
              this.formAnagrafica.get('ComuneNascita').reset()
              this.formAnagrafica.get('ProvinciaNascita').reset()
              this.provinceNascitaFiltrate.next(this.listaProvinceNascita.slice())

              if(setProvincia){
                this.formAnagrafica.controls.ProvinciaNascita.enable();
                this.formAnagrafica.controls.ProvinciaNascita.setValue(setProvincia.idProvincia);
                this.setComuni(setProvincia.idProvincia, this.tipoIndirizzo.Nascita, setProvincia);
              }
              break
            default:
              break
          }
        })
    } else {
      switch (tipo) {
        case TipoIndirizzo.Domicilio:
          this.listaProvinceDomicilio = []
          this.listaProvinceResidenza = []
          this.formAnagrafica.get('ProvinciaDomicilio').reset()
          this.formAnagrafica.get('ComuneDomicilio').reset()

          break
        case TipoIndirizzo.Residenza:
          this.listaProvinceResidenza = []
          this.listaComuniResidenza = []
          this.formAnagrafica.get('ProvinciaResidenza').reset()
          this.formAnagrafica.get('ComuneResidenza').reset()

          break
        case TipoIndirizzo.Nascita:
          this.listaProvinceNascita = []
          this.listaProvinceNascita = []

          this.formAnagrafica.get('ProvinciaNascita').reset()
          this.formAnagrafica.get('ComuneNascita').reset()

          break
        default:
          break
      }
    }


  }

  riepilogoForm(idPaziente: string): void {
    if (this.appGen.configLinfa.PrivacyAbilitata) {
      this.checkPrivacyExist()
    }
    const objRequest = {
      action: 'paziente',
      param: idPaziente,
    }
    this.service.getCallRequest(objRequest).then((data) => {
      this.setValueForm(data).then(async () => {
        this.getProvincia(
          this.formAnagrafica.get('RegioneNascita').value,
          TipoIndirizzo.Nascita
        )
        this.getComuni(
          this.formAnagrafica.get('ProvinciaNascita').value,
          TipoIndirizzo.Nascita
        )

        this.getProvincia(
          this.formAnagrafica.get('RegioneResidenza').value,
          TipoIndirizzo.Residenza
        )
        this.getComuni(
          this.formAnagrafica.get('ProvinciaResidenza').value,
          TipoIndirizzo.Residenza
        )

        this.getProvincia(
          this.formAnagrafica.get('RegioneDomicilio').value,
          TipoIndirizzo.Domicilio
        )
        this.getComuni(
          this.formAnagrafica.get('ProvinciaDomicilio').value,
          TipoIndirizzo.Domicilio
        )
        this.checkEmail(data);
      })
    })
  }

  async setValueForm(data: any): Promise<void> {
    //
    this.idPaziente = data.idPaziente
    this.formAnagrafica.controls.Nome.setValue(data.nome)
    this.formAnagrafica.controls.Cognome.setValue(data.cognome)
    this.formAnagrafica.controls.CF.setValue(data.cf)
    this.formAnagrafica.controls.Sesso.setValue(data.sesso)
    this.formAnagrafica.controls.DataNascita.setValue(
      data.dataNascita ? moment(data.dataNascita).format('DD/MM/YYYY') : null
    )
    this.formAnagrafica.controls.DataDecesso.setValue(
      data.dataDecesso ? moment(data.dataDecesso).format('DD/MM/YYYY') : null
    )
    // this.formAnagrafica.controls.codiceNosologico.setValue(data.codiceNosologico)
    // this.formAnagrafica.controls.idAsl.setValue(data.idAsl)
    this.formAnagrafica.controls.StatoCivile.setValue(data.idStatoCivile)
    this.formAnagrafica.controls.TitoloStudio.setValue(data.idTitoloStudio)
    this.formAnagrafica.controls.OccupazioneAttuale.setValue(data.occupazioneAttuale)
    this.formAnagrafica.controls.Convivenza.setValue(data.idConvivenza)
    this.formAnagrafica.controls.MMG.setValue(data.mmg)
    this.formAnagrafica.controls.AltraConvivenza.setValue(data.altroConvivenza)
    this.formAnagrafica.controls.nNucleoFamiliare.setValue(data.nNucleoFamiliare)
    this.formAnagrafica.controls.CodiceEsenzione.setValue(data.codiceEsenzione)
    //NASCITA
    this.formAnagrafica.controls.RegioneNascita.setValue(data.regioneNascita)

    if (!this.appGen.isNullOrUndefined(data.regioneNascita)) {
      const regione = this.listaRegioni.filter(
        (r) => r.idRegione == data.regioneNascita
      )[0]
      if (regione.cod == '999') {
        this.estero = true
      }
    }

    this.formAnagrafica.controls.ProvinciaNascita.setValue(data.provinciaNascita)
    this.formAnagrafica.controls.ComuneNascita.setValue(data.comuneNascita)
    //residenza
    this.formAnagrafica.controls.RegioneResidenza.setValue(data.regioneResidenza)
    this.formAnagrafica.controls.ProvinciaResidenza.setValue(data.provinciaResidenza)
    this.formAnagrafica.controls.ComuneResidenza.setValue(data.comuneResidenza)
    this.formAnagrafica.controls.IndirizzoResidenza.setValue(data.indirizzoResidenza)
    this.formAnagrafica.controls.CapResidenza.setValue(data.capResidenza)

    //domicilio
    this.isSameAdress = data.isUgualeDomicilio
    this.formAnagrafica.controls.RegioneDomicilio.setValue(data.regioneDomicilio)
    this.formAnagrafica.controls.ProvinciaDomicilio.setValue(data.provinciaDomicilio)
    this.formAnagrafica.controls.ComuneDomicilio.setValue(data.comuneDomicilio)
    this.formAnagrafica.controls.IndirizzoDomicilio.setValue(data.indirizzoDomicilio)
    this.formAnagrafica.controls.CapDomicilio.setValue(data.capDomicilio)
    //CONTATTI
    this.formAnagrafica.controls.Telefono1.setValue(data.telefono1)
    this.formAnagrafica.controls.Telefono2.setValue(data.telefono2)
    this.formAnagrafica.controls.Email.setValue(data.email)

    this.formAnagrafica.controls.DataFirmaPrivacy.setValue(data.dataFirmaPrivacy)
    this.formAnagrafica.controls.Privacy.setValue(data.idPrivacy)

    /**
     * !TODO !BUG !IMPORTANT un hot fix che deve essere aggiustato
     */
    const hotfix = {
      value: '',
    }
    await this.getComuni(
      this.formAnagrafica.get('ProvinciaResidenza').value,
      TipoIndirizzo.Residenza
    )

    await this.getComuni(
      this.formAnagrafica.get('ProvinciaNascita').value,
      TipoIndirizzo.Nascita
    )

    await this.getComuni(
      this.formAnagrafica.get('ProvinciaDomicilio').value,
      TipoIndirizzo.Domicilio
    )
    this.filtraComuni(hotfix, TipoIndirizzo.Residenza)
    this.filtraComuni(hotfix, TipoIndirizzo.Nascita)
    this.filtraComuni(hotfix, TipoIndirizzo.Domicilio)
    /*
 !TODO Fine hotfix
 */

    if (!this.appGen.isNullOrUndefined(data.validitaPrivacy)) {
      this.validitaPrivacy = data.validitaPrivacy
    }
  }

  checkedPrivacy(checked: boolean): void {
    if (
      checked &&
      this.appGen.isNullOrUndefined(this.formAnagrafica.controls.DataFirmaPrivacy.value)
    ) {
      this.formAnagrafica.controls.DataFirmaPrivacy.setValue(new Date())
    }
  }

  async moduloPrivacy(): Promise<void> {
    //già filtrato in base al tipo alimentazione, lato server

    const param = {
      IdPaziente: this.idPaziente,
    }

    const objRequest = {
      action: 'getModuloPrivacy',
      param: param,
    }
    await this.service.postCallRequest(objRequest).then((res): void => {
      if (this.appGen.isNullOrUndefined(res)) {
        return
      }
      const pdfFile = this.report.createDocumentoPrivacy(res)

      this.dialog.open(ModalDocumentoPrivacyComponent, {
        data: pdfFile,
        panelClass: 'modal-anteprima-pdf',
      })
    })
  }

  /**
   *
   * @param
   * @param ricellField
   */
  changeDate($event, ricellField: string) {
    const data = moment($event).format('DD/MM/YYYY')

    switch (ricellField) {
      // aggiorno la data del decesso
      case 'dataDecesso':
        this.formAnagrafica.controls.DataDecesso.reset()
        this.formAnagrafica.controls.DataDecesso.setValue(data)
        break

      case 'dataNascita':
        // aggiorno la data di nascita
        this.formAnagrafica.controls.DataNascita.reset()
        this.formAnagrafica.controls.DataNascita.setValue(data)

        break
    }
  }


  /**
   * FUNZIONE CHE FA PARTIRE LA RICERCA
   */
  setFiltriRicercaTramiteComune(){
    this.filtroComuneResidenzaXDescr.valueChanges
     .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
     .subscribe((item) => {
     this.setComuniTramiteRicerca(item ,this.tipoIndirizzo.Residenza);
     })
 
     this.filtroComuneDomicilioXDescr.valueChanges
     .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
     .subscribe((item) => {
     this.setComuniTramiteRicerca(item, this.tipoIndirizzo.Domicilio);
     })
 
     this.filtroComuneNascitaXDescr.valueChanges
     .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
     .subscribe((item) => {
     this.setComuniTramiteRicerca(item, this.tipoIndirizzo.Nascita);
     })
 
   }
 
   /**
    * RICERCA DEI COMUNI ATTRAVERSO IL PARAMETRO CERCATO E RIORDINO SECONDO LEV.DISTANCE
    * @param comuneCercato STRINGA DI RICERCA
    * @param tipoIndirizzo TIPO INDIRIZZO
    */
   async setComuniTramiteRicerca(comuneCercato: string, tipoIndirizzo: number){

    try {
      
      switch (tipoIndirizzo) {
       case TipoIndirizzo.Residenza:
      
       if (comuneCercato.length >= 2) {
          this.listaComuniResidenza = [];
          this.listaComuniResidenza = await firstValueFrom(this.pazienteServ.ricercaComuneByDescrizione(comuneCercato)); 
            let listaFiltrataOrdinata : any = [];
            listaFiltrataOrdinata = this.prodServ.filtroComuni(comuneCercato, this.listaComuniResidenza);
            this.comuniResidenzaFiltrate.next(listaFiltrataOrdinata.slice());
       }
         break;
 
       case TipoIndirizzo.Domicilio:

       if (comuneCercato.length >= 2) {
          this.listaComuniDomicilio = [];
          this.listaComuniDomicilio = await firstValueFrom(this.pazienteServ.ricercaComuneByDescrizione(comuneCercato)); 

            let listaFiltrataOrdinata : any = [];
            listaFiltrataOrdinata = this.prodServ.filtroComuni(comuneCercato, this.listaComuniDomicilio);
            this.comuniDomicilioFiltrate.next(listaFiltrataOrdinata.slice())
       }
         break;
 
         case TipoIndirizzo.Nascita:
         if (comuneCercato.length >= 2) {
          this.listaComuniNascita = [];
            this.listaComuniNascita = await firstValueFrom(this.pazienteServ.ricercaComuneByDescrizione(comuneCercato)); 
              let listaFiltrataOrdinata : any = [];
              listaFiltrataOrdinata = this.prodServ.filtroComuni(comuneCercato, this.listaComuniNascita);
              this.comuniNascitaFiltrate.next(listaFiltrataOrdinata.slice())
         }
           break;
     
       default:
         break;
     }
    } catch (error) {
      console.error(error);

      switch (tipoIndirizzo) {
        case TipoIndirizzo.Residenza:
            this.comuniResidenzaFiltrate.next([]);
          break;

        case TipoIndirizzo.Domicilio:
          this.comuniDomicilioFiltrate.next([]);
          break;

        case TipoIndirizzo.Nascita:
          this.comuniNascitaFiltrate.next([]);
          break;
        default:
          break;
      }
    }
 
     
 
   }
 
   /**
    * UNA VOLTA SELEZIONATO IL COMUNE PARTE LA CHIAMATA CHE RIEMPIRÀ I CAMPI DI REGIONE, PROVINCIA E IL CAP
    * @param comuneSelezionato 
    */
   setDatiResidenzaDaComune(comuneSelezionato: Comune){
     this.formAnagrafica.controls.RegioneResidenza.setValue(comuneSelezionato.idRegione);  
     this.setProvincia(comuneSelezionato.idRegione, this.tipoIndirizzo.Residenza, comuneSelezionato);
   }
 
   /**
    * UNA VOLTA SELEZIONATO IL COMUNE PARTE LA CHIAMATA CHE RIEMPIRÀ I CAMPI DI REGIONE, PROVINCIA E IL CAP
    * @param comuneSelezionato 
    */
   setDatiDomicilioDaComune(comuneSelezionato: Comune){
     this.formAnagrafica.controls.RegioneDomicilio.setValue(comuneSelezionato.idRegione);
     this.setProvincia(comuneSelezionato.idRegione, this.tipoIndirizzo.Domicilio, comuneSelezionato);
   }
  
   /**
    * UNA VOLTA SELEZIONATO IL COMUNE PARTE LA CHIAMATA CHE RIEMPIRÀ I CAMPI DI REGIONE, PROVINCIA E IL CAP
    * @param comuneSelezionato 
    */
   setDatiNascitaDaComune(comuneSelezionato: Comune){
     this.formAnagrafica.controls.RegioneNascita.setValue(comuneSelezionato.idRegione);
     this.setProvincia(comuneSelezionato.idRegione, this.tipoIndirizzo.Nascita, comuneSelezionato);
   }


   statusMail(fromCheckEmail : boolean){  
    if (fromCheckEmail == false) {
      this.mailAssente = !this.mailAssente;
    } 
      if (this.mailAssente) {
        this.formAnagrafica.controls.Email.setValue(mail.mailAssente);
        this.formAnagrafica.controls.Email.clearValidators();
        this.formAnagrafica.controls.Email.updateValueAndValidity();
        this.formAnagrafica.controls.Email.disable();
      }else if(!this.mailAssente){
        this.formAnagrafica.controls.Email.setValue('');
        this.formAnagrafica.controls.Email.setValidators([Validators.email]);
        this.formAnagrafica.controls.Email.updateValueAndValidity();
        this.formAnagrafica.controls.Email.enable();
      }
   }

   async checkEmail(objPaziente:any){
    const email = objPaziente.email;
    if (email === mail.mailAssente) {
      this.mailAssente = true;
      await this.statusMail(true);
    }
   }
}
