import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'

import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { MatCheckbox } from '@angular/material/checkbox'
import { ValutazioneNutrizionale } from 'src/app/_module/visite/_dto-visite/dto-visite'

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MatDatepicker } from '@angular/material/datepicker'

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter'
import { MatDialog } from '@angular/material/dialog'
import { ModalBristolChartComponent } from 'src/app/shared/modal/modal-bristol-chart/modal-bristol-chart.component'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import moment from 'moment'
import { TipoPrestazione } from 'src/app/_core/helpers/enums'
import Swal from 'sweetalert2'
import { SnackBarService } from 'src/app/_core/services/loader.service'

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}
@Component({
  selector: 'app-form-valutazione',
  templateUrl: './form-valutazione.component.html',
  styleUrls: ['./form-valutazione.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FormValutazioneComponent implements OnInit {
  //Liste
  listaConsistenzaPasto: any
  listaPatologie: any
  listaRitmoSonnoVeglia: any
  listaAttivita: any
  listaAlvo: any
  listaDiuresi: any
  listaDisfagia: any
  listaGradiDisfagia: any
  listaValutazioneNutrizionale: any
  listaLivelloValutazioneNutrizionale: any
  listaTipoAlimentazioneAttuale: any
  ListaBristolChart: any

  //Bool
  showResult = false
  showEta = false
  valutazioneExist = false
  nutrizioneExist = false
  valoreMaxModificato = false
  valoreMinModificato = false

  //OBJ
  formValutazioneNutrizionale: FormGroup
  valutazione
  dataInizioPatologiaFormControl = new FormControl()
  tipoAlimentazioneScelta: any
  caloPonderale3MesiVal: number
  caloPonderale6MesiVal: number
  caloPonderaleVal: number

  //ID
  idPaziente: string
  idVisita: string

  @Input() isRiepilogoVisita: boolean
  @Output() showBtnNutrizioneEmit = new EventEmitter<any>()
  @Output() updateCruscottoEmit = new EventEmitter<any>()
  @Output() idvalutazioneNutrizionaleEmit = new EventEmitter<any>()
  @ViewChild(MatCheckbox, { static: true }) allettato: MatCheckbox

  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    private notificate: SnackBarService
  ) {
    this.appGen.loadingPanel.show()
  }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')
    this.activateRoute.queryParams.subscribe((params) => {
      if (!this.appGen.isNullOrUndefined(params)) {
        this.idVisita = params.visit

        //ho controllato che siano già state compilate valutazione nutrizione e/o la nutrizione
        if (!this.appGen.isNullOrUndefined(params.nutrexist)) {
          this.nutrizioneExist = JSON.parse(params.nutrexist)
        }
        if (!this.appGen.isNullOrUndefined(params.vnexist)) {
          this.valutazioneExist = JSON.parse(params.vnexist)
        }
      }
    })

    if (this.isRiepilogoVisita) {
      this.dataInizioPatologiaFormControl.disable()
    }

    this.formValutazioneNutrizionale = this.formBuilder.group({
      prestazione: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      eta: new FormControl({ value: '', disabled: true }),
      altezza: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      patologia: new FormControl({ value: '', disabled: true }),
      pesoRilevato: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      pesoDaRaggiungere: new FormControl(
        { value: '', disabled: this.isRiepilogoVisita },
        Validators.required
      ),
      pesoultimi3mesi: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      pesoultimi6mesi: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      dataInizioPatologia: new FormControl({
        value: '',
        disabled: this.isRiepilogoVisita,
      }),
      pesoAbituale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      pesoMinRaggiunto: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      pesoMaxRaggiunto: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      bmiattuale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      bmiottimale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      pesoOttimale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      piagheDecubito: new FormControl({ value: false, disabled: this.isRiepilogoVisita }),
      allettato: new FormControl({ value: false, disabled: this.isRiepilogoVisita }),
      // caloPonderale: new FormControl(false),
      malnutrizione: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      ritmoSonnoVeglia: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      attivita: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      alvo: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      tipoFeci: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      diuresi: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      note: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      consistenzaPasto: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      tipoAlimentazioneAttuale: new FormControl({
        value: '',
        disabled: this.isRiepilogoVisita,
      }),
      latoMisurazione: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      bicipitale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      tricipitale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      sottoscapolare: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      sovrailiaca: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      braccio: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      polpaccio: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      lunghezzaUlna: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      rz: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      xc: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      impedenza: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      circAddominale: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      circPolso: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      wh: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      disfagia: new FormControl({ value: '', disabled: this.isRiepilogoVisita }),
      gradoDisfagia: new FormControl({
        value: '',
        disabled: this.isRiepilogoVisita ? this.isRiepilogoVisita : true,
      }),
    })
   
    // if (this.valutazioneExist || this.isRiepilogoVisita) {
    this.existValutazione()
    // }

    this.getTipoAlimentazione()
    this.getConsistenzaPasto()
    this.getListaPatologie()
    this.getListaAttivita()
    this.getListaRitmoSonnoVeglia()
    this.getListaAlvo()
    this.getListaBristolChart()
    this.getListaDiuresi()
    this.getlistaDisfagia()
    this.getlistaGradiDisfagia()

    this.appGen.loadingPanel.hide()
  }

  chosenYearHandler(normalizedYear: moment.Moment) {
    this.dataInizioPatologiaFormControl = new FormControl(moment())
    const ctrlValue = this.dataInizioPatologiaFormControl.value
    ctrlValue.year(normalizedYear.year())
    this.dataInizioPatologiaFormControl.setValue(ctrlValue)
  }

  chosenMonthHandler(
    normalizedMonth: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ) {
    const ctrlValue = this.dataInizioPatologiaFormControl.value
    ctrlValue.month(normalizedMonth.month())
    this.dataInizioPatologiaFormControl.setValue(ctrlValue)
    datepicker.close()
  }

  async getConsistenzaPasto() {
    await this.service.getCallRequest({ action: 'consistenzapasto' }).then((data) => {
      this.listaConsistenzaPasto = data
    })
  }
  async getTipoAlimentazione() {
    await this.service.getCallRequest({ action: 'alimentazionevisite' }).then((data) => {
      this.listaTipoAlimentazioneAttuale = data
    })
  }

  async existValutazione() {
    await this.service
      .getCallRequest({ action: 'valutazioneNutrizionaleExist', param: this.idVisita })
      .then(async (data) => {
        if (data) {
          this.riepilogoForm()
        } else {
          //se non esiste la valutazione ed esiste già una visita per il paziente mi recupero già altezza e peso benessere
          await this.service
            .getCallRequest({ action: 'CheckDatiAltreValutazioni', param: this.idVisita })
            .then((data) => {
              if (data) {
                this.formValutazioneNutrizionale.controls.altezza.setValue(data.altezza)

                this.formValutazioneNutrizionale.controls.pesoDaRaggiungere.setValue(
                  data.pesoDaRaggiungere
                )
                this.formValutazioneNutrizionale.controls.pesoultimi3mesi.setValue(
                  data.pesoultimi3mesi
                )
                this.formValutazioneNutrizionale.controls.pesoultimi6mesi.setValue(
                  data.pesoultimi6mesi
                )

                this.formValutazioneNutrizionale.controls.pesoAbituale.setValue(
                  data.pesoAbituale
                )

                this.formValutazioneNutrizionale.controls.pesoMaxRaggiunto.setValue(
                  data.pesoMassimo
                )

                this.formValutazioneNutrizionale.controls.pesoMinRaggiunto.setValue(
                  data.pesoMinimo
                )

                // disabilito eta che nella valutazione nutrizionale non ha senso
                /* if (!this.appGen.isNullOrUndefined(data.eta)) {
              this.formValutazioneNutrizionale.controls.eta.setValue(data.eta)
              this.showEta = true;
            }*/
              }
            })
        }
      })
  }

  async getListaAttivita() {
    await this.service.getCallRequest({ action: 'attivita' }).then((data) => {
      this.listaAttivita = data
    })
  }

  async getListaPatologie() {
    await this.service.getCallRequest({ action: 'patologie' }).then((data) => {
      this.listaPatologie = data
    })
  }
  async getListaRitmoSonnoVeglia() {
    await this.service.getCallRequest({ action: 'ritmisonnoveglia' }).then((data) => {
      this.listaRitmoSonnoVeglia = data
    })
  }
  async getListaDiuresi() {
    await this.service.getCallRequest({ action: 'diuresi' }).then((data) => {
      this.listaDiuresi = data
    })
  }
  async getlistaDisfagia() {
    await this.service.getCallRequest({ action: 'disfagie' }).then((data) => {
      this.listaDisfagia = data
    })
  }
  async getlistaGradiDisfagia() {
    await this.service.getCallRequest({ action: 'gradidisfagia' }).then((data) => {
      this.listaGradiDisfagia = data
    })
  }

  async getListaAlvo() {
    await this.service.getCallRequest({ action: 'alvo' }).then((data) => {
      this.listaAlvo = data
    })
  }
  async getListaBristolChart() {
    await this.service.getCallRequest({ action: 'getListBristolChart' }).then((data) => {
      this.ListaBristolChart = data
    })
  }

  openBristolChart() {
    const obj = {
      lista: this.ListaBristolChart,
      idBristolChart: this.formValutazioneNutrizionale.get('tipoFeci').value,
      isRiepilogoVisita: this.isRiepilogoVisita,
    }
    const dialogRef = this.dialog.open(ModalBristolChartComponent, {
      data: obj,
      panelClass: 'modal-custom',
      //width: '80vw'
    })

    dialogRef.componentInstance.emitService.subscribe((emmitedValue) => {
      this.formValutazioneNutrizionale.get('tipoFeci').setValue(emmitedValue)
      // do sth with emmitedValue
    })
  }

  clearDate(event: { stopPropagation: () => void }) {
    event.stopPropagation()
    this.dataInizioPatologiaFormControl.reset()
  }

  async onSubmit() {
    if (this.formValutazioneNutrizionale.invalid) {
      this.appGen.validateAllFormFields(this.formValutazioneNutrizionale)
      return
    }

    const obj = new ValutazioneNutrizionale()
    obj.IdVisita = this.idVisita
    obj.Pesoultimi3mesi = this.formValutazioneNutrizionale.get('pesoultimi3mesi').value
    obj.Pesoultimi6mesi = this.formValutazioneNutrizionale.get('pesoultimi6mesi').value
    obj.PesoAbituale = this.formValutazioneNutrizionale.get('pesoAbituale').value
    obj.PesoMassimo = this.formValutazioneNutrizionale.get('pesoMaxRaggiunto').value
    obj.PesoMinimo = this.formValutazioneNutrizionale.get('pesoMinRaggiunto').value
    obj.PesoDaRaggiungere =
      this.formValutazioneNutrizionale.get('pesoDaRaggiungere').value
    obj.DataInizioPatologia = this.dataInizioPatologiaFormControl.value // this.appGen.convertToLocaleDate(this.dataInizioPatologiaFormControl.value);
    obj.PiagheDecubito = this.formValutazioneNutrizionale.get('piagheDecubito').value
    obj.IdRitmoSonnoVeglia =
      this.formValutazioneNutrizionale.get('ritmoSonnoVeglia').value
    obj.IdAttivita = this.formValutazioneNutrizionale.get('attivita').value
    obj.IdAlvo = this.formValutazioneNutrizionale.get('alvo').value
    obj.IdBristolChart = this.formValutazioneNutrizionale.get('tipoFeci').value
    obj.IdDiuresi = this.formValutazioneNutrizionale.get('diuresi').value
    obj.Note = this.formValutazioneNutrizionale.get('note').value
    obj.IdTipoAlimentazioneAttuale = this.formValutazioneNutrizionale.get(
      'tipoAlimentazioneAttuale'
    ).value
    obj.IdConsistenzaPasto =
      this.formValutazioneNutrizionale.get('consistenzaPasto').value

    // obj.Eta = this.formValutazioneNutrizionale.get("eta").value;
    // obj.IdPatologia = this.formValutazioneNutrizionale.get("patologia").value;

    obj.Allettato = this.formValutazioneNutrizionale.get('allettato').value

    obj.LatoMisurazione = this.formValutazioneNutrizionale.get('latoMisurazione').value
    obj.Bicipitale = this.formValutazioneNutrizionale.get('bicipitale').value
    obj.Tricipitale = this.formValutazioneNutrizionale.get('tricipitale').value
    obj.Sottoscapolare = this.formValutazioneNutrizionale.get('sottoscapolare').value
    obj.Sovrailiaca = this.formValutazioneNutrizionale.get('sovrailiaca').value
    obj.Braccio = this.formValutazioneNutrizionale.get('braccio').value
    obj.Polpaccio = this.formValutazioneNutrizionale.get('polpaccio').value
    obj.LunghezzaUlna = this.formValutazioneNutrizionale.get('lunghezzaUlna').value

    obj.Altezza = this.formValutazioneNutrizionale.get('altezza').value
    obj.PesoRilevato = this.formValutazioneNutrizionale.get('pesoRilevato').value

    obj.Rz = this.formValutazioneNutrizionale.get('rz').value
    obj.Xc = this.formValutazioneNutrizionale.get('xc').value
    obj.Impedenza = this.formValutazioneNutrizionale.get('impedenza').value
    obj.CircAddominale = this.formValutazioneNutrizionale.get('circAddominale').value
    obj.CircPolso = this.formValutazioneNutrizionale.get('circPolso').value
    obj.Wh = this.formValutazioneNutrizionale.get('wh').value
    obj.IdDisfagia = this.formValutazioneNutrizionale.get('disfagia').value
    obj.IdGradoDisfagia = this.formValutazioneNutrizionale.get('gradoDisfagia').value

    await this.service
      .postCallRequest({ action: 'insertUpdateValutazioneNutrizionale', param: obj })
      .then(() => {
        this.existValutazione()
        this.updateCruscottoEmit.next(null)
      })
  }

  async riepilogoForm() {
    const obj = {
      idPaziente: this.idPaziente,
      idVisita: this.idVisita,
    }
    await this.service
      .postCallRequest({ action: 'getValutazioneNutrizionale', param: obj })
      .then((data) => {
        this.setValueForm(data)
      })
  }

  async setValueForm(data) {
    //converto i numeri che sono negativi e li mostro in positivo, indicando se è un calo o aumento
    this.valutazione = data

    this.caloPonderale3MesiVal = Math.abs(data.caloPonderale3Mesi)
    this.caloPonderale6MesiVal = Math.abs(data.caloPonderale6Mesi)
    this.caloPonderaleVal = Math.abs(data.caloPonderale)
    // data.caloPonderale3Mesi = Math.abs(data.caloPonderale3Mesi);
    // data.caloPonderale6Mesi = Math.abs(data.caloPonderale6Mesi);
    this.showResult = true

    this.idvalutazioneNutrizionaleEmit.next(data.idValutazione)
    this.idVisita = data.idVisita

    if (!this.appGen.isNullOrUndefined(data.alimentazioneScelta)) {
      this.tipoAlimentazioneScelta = data.alimentazioneScelta
    }

    this.showBtnNutrizioneEmit.next(null)

    this.formValutazioneNutrizionale.controls.eta.setValue(data.eta)
    this.formValutazioneNutrizionale.controls.altezza.setValue(data.altezza)
    this.formValutazioneNutrizionale.controls.patologia.setValue(data.patologia)
    this.formValutazioneNutrizionale.controls.dataInizioPatologia.setValue(
      data.dataInizioPatologia
    )

    if (!this.appGen.isNullOrUndefined(data.dataInizioPatologia)) {
      this.dataInizioPatologiaFormControl.setValue(data.dataInizioPatologia)
    }
    this.formValutazioneNutrizionale.controls.pesoDaRaggiungere.setValue(
      data.pesoDaRaggiungere
    )

    this.formValutazioneNutrizionale.controls.pesoRilevato.setValue(data.pesoRilevato)
    this.formValutazioneNutrizionale.controls.pesoultimi3mesi.setValue(
      data.pesoultimi3mesi
    )
    this.formValutazioneNutrizionale.controls.pesoultimi6mesi.setValue(
      data.pesoultimi6mesi
    )
    this.formValutazioneNutrizionale.controls.pesoAbituale.setValue(data.pesoAbituale)
    this.formValutazioneNutrizionale.controls.pesoMaxRaggiunto.setValue(data.pesoMassimo)
    this.formValutazioneNutrizionale.controls.pesoMinRaggiunto.setValue(data.pesoMinimo)
    this.formValutazioneNutrizionale.controls.piagheDecubito.setValue(data.piagheDecubito)
    this.formValutazioneNutrizionale.controls.allettato.setValue(data.allettato)
    // this.formValutazioneNutrizionale.controls.caloPonderale.setValue(data.caloPonderale)
    this.formValutazioneNutrizionale.controls.malnutrizione.setValue(data.malnutrizione)
    this.formValutazioneNutrizionale.controls.ritmoSonnoVeglia.setValue(
      data.idRitmoSonnoVeglia
    )
    this.formValutazioneNutrizionale.controls.attivita.setValue(data.idAttivita)
    this.formValutazioneNutrizionale.controls.alvo.setValue(data.idAlvo)
    this.formValutazioneNutrizionale.controls.tipoFeci.setValue(data.idBristolChart)
    this.formValutazioneNutrizionale.controls.diuresi.setValue(data.idDiuresi)

    this.formValutazioneNutrizionale.controls.disfagia.setValue(data.idDisfagia)
    this.formValutazioneNutrizionale.controls.gradoDisfagia.setValue(data.idGradoDisfagia)
    // se idDisfagia != null && 1 abilito gradoDisfagia
    if (data.idDisfagia && data.idDisfagia != 1 && !this.isRiepilogoVisita) {
      this.formValutazioneNutrizionale.get('gradoDisfagia').enable()
    }

    this.formValutazioneNutrizionale.controls.consistenzaPasto.setValue(
      data.idConsistenzaPasto
    )
    this.formValutazioneNutrizionale.controls.tipoAlimentazioneAttuale.setValue(
      data.idTipoAlimentazioneAttuale
    )

    this.formValutazioneNutrizionale.controls.pesoOttimale.setValue(data.pesoOttimale)
    this.formValutazioneNutrizionale.controls.bmiattuale.setValue(
      this.appGen.isNullOrUndefined(data.bmiattuale) ? '' : data.bmiattuale
    )
    this.formValutazioneNutrizionale.controls.bmiottimale.setValue(data.bmiottimale)
    this.formValutazioneNutrizionale.controls.note.setValue(data.note)

    //misure

    this.formValutazioneNutrizionale.controls.latoMisurazione.setValue(
      data.latoMisurazione
    )
    this.formValutazioneNutrizionale.controls.bicipitale.setValue(data.bicipitale)
    this.formValutazioneNutrizionale.controls.tricipitale.setValue(data.tricipitale)
    this.formValutazioneNutrizionale.controls.sottoscapolare.setValue(data.sottoscapolare)
    this.formValutazioneNutrizionale.controls.sovrailiaca.setValue(data.sovrailiaca)

    this.formValutazioneNutrizionale.controls.braccio.setValue(data.braccio)
    this.formValutazioneNutrizionale.controls.polpaccio.setValue(data.polpaccio)
    this.formValutazioneNutrizionale.controls.lunghezzaUlna.setValue(data.lunghezzaUlna)
    this.formValutazioneNutrizionale.controls.circPolso.setValue(data.circPolso)
    this.formValutazioneNutrizionale.controls.rz.setValue(data.rz)
    this.formValutazioneNutrizionale.controls.xc.setValue(data.xc)
    this.formValutazioneNutrizionale.controls.impedenza.setValue(data.impedenza)
    this.formValutazioneNutrizionale.controls.circAddominale.setValue(data.circAddominale)
    this.formValutazioneNutrizionale.controls.wh.setValue(data.wh)
  }

  cambioDisfagia($event) {
    if (!this.isRiepilogoVisita) {
      if (($event && $event.value == null) || $event.value == 1) {
        this.formValutazioneNutrizionale.get('gradoDisfagia').setValue(null)
        this.formValutazioneNutrizionale.get('gradoDisfagia').disable()
      } else {
        this.formValutazioneNutrizionale.get('gradoDisfagia').enable()
      }
    }
    //
  }

  /**
   * Funzione su focusOut, dove se il peso rilevato è maggiore del peso massimo raggiunto allora quest'ultimo viene aggiornato col peso rilevato;
   * Se invece è minore del peso minimo viene aggiornato il peso minimo raggiunto sostituendolo col peso rilevato;
   */

  rilevazionePeso(tipo?: string) {
    const pesoRilevato = Number(
      this.formValutazioneNutrizionale.get('pesoRilevato').value
    )
    const pesoMax = this.appGen.isNullOrUndefined(
      this.formValutazioneNutrizionale.get('pesoMaxRaggiunto').value
    )
      ? null
      : Number(this.formValutazioneNutrizionale.get('pesoMaxRaggiunto').value)
    const pesoMin = this.appGen.isNullOrUndefined(
      this.formValutazioneNutrizionale.get('pesoMinRaggiunto').value
    )
      ? null
      : Number(this.formValutazioneNutrizionale.get('pesoMinRaggiunto').value)

    switch (tipo) {
              ///In questo caso viene triggerato quando faccio focus out sul campo peso rilevato
      case null || undefined:
        if (
          !this.appGen.isNullOrUndefined(pesoMax) &&
          !this.appGen.isNullOrUndefined(pesoRilevato) &&
          pesoRilevato > pesoMax
        ) {
          Swal.fire({
            title: 'Attenzione!',
            html:
              'Il peso rilevato è maggiore del peso massimo raggiunto.' +
              '<br>' +
              'Si vuole sostituire con il peso rilevato?',
            icon: 'warning',
            iconColor: '#d33',
            showCancelButton: true,
            confirmButtonColor: '#00afa6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sì, confermo',
            cancelButtonText: 'No, annulla',
          }).then((result) => {
            if (result.isConfirmed) {
              this.formValutazioneNutrizionale
                .get('pesoMaxRaggiunto')
                .setValue(pesoRilevato)
              this.notificate.warning('Peso massimo raggiunto aggiornato con successo!')
              this.valoreMaxModificato = true
            }
          })
        } else if (
          !this.appGen.isNullOrUndefined(pesoMin) &&
          !this.appGen.isNullOrUndefined(pesoRilevato) &&
          pesoRilevato < pesoMin
        ) {
          Swal.fire({
            title: 'Attenzione!',
            html:
              'Il peso rilevato è minore del peso minimo raggiunto.' +
              '<br>' +
              'Si vuole sostituire con il peso rilevato?',
            icon: 'warning',
            iconColor: '#d33',
            showCancelButton: true,
            confirmButtonColor: '#00afa6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sì, confermo',
            cancelButtonText: 'No, annulla',
          }).then((result) => {
            if (result.isConfirmed) {
              this.formValutazioneNutrizionale
                .get('pesoMinRaggiunto')
                .setValue(pesoRilevato)
              this.notificate.warning('Peso minimo raggiunto aggiornato con successo!')
              this.valoreMinModificato = true
            }
          })
        } else if (
          this.formValutazioneNutrizionale.get('pesoMaxRaggiunto').dirty &&
          pesoMin !== pesoRilevato
        ) {
          this.valoreMaxModificato = false
        } else if (
          this.formValutazioneNutrizionale.get('pesoMinRaggiunto').dirty &&
          pesoMin !== pesoRilevato
        ) {
          this.valoreMinModificato = false
        }

        break
        ///In questo caso viene triggerato quando faccio focus out sul campo peso massimo raggiunto
      case 'max':
        if (
          !this.appGen.isNullOrUndefined(pesoMax) &&
          !this.appGen.isNullOrUndefined(pesoRilevato) &&
          pesoRilevato > pesoMax
        ) {
          Swal.fire({
            title: 'Attenzione!',
            html:
              'Il peso rilevato è maggiore del peso massimo raggiunto.' +
              '<br>' +
              'Si vuole sostituire con il peso rilevato?',
            icon: 'warning',
            iconColor: '#d33',
            showCancelButton: true,
            confirmButtonColor: '#00afa6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sì, confermo',
            cancelButtonText: 'No, annulla',
          }).then((result) => {
            if (result.isConfirmed) {
              this.formValutazioneNutrizionale
                .get('pesoMaxRaggiunto')
                .setValue(pesoRilevato)
              this.notificate.warning('Peso massimo raggiunto aggiornato con successo!')
              this.valoreMaxModificato = true
            }
          })
        } else if (
          this.formValutazioneNutrizionale.get('pesoMaxRaggiunto').dirty &&
          pesoMin !== pesoRilevato
        ) {
          this.valoreMaxModificato = false
        } else if (
          this.formValutazioneNutrizionale.get('pesoMinRaggiunto').dirty &&
          pesoMin !== pesoRilevato
        ) {
          this.valoreMinModificato = false
        }

        break

        ///In questo caso viene triggerato quando faccio focus out sul campo peso minimo raggiunto
      case 'min':
        if (
          !this.appGen.isNullOrUndefined(pesoMin) &&
          !this.appGen.isNullOrUndefined(pesoRilevato) &&
          pesoRilevato < pesoMin
        ) {
          Swal.fire({
            title: 'Attenzione!',
            html:
              'Il peso rilevato è minore del peso minimo raggiunto.' +
              '<br>' +
              'Si vuole sostituire con il peso rilevato?',
            icon: 'warning',
            iconColor: '#d33',
            showCancelButton: true,
            confirmButtonColor: '#00afa6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sì, confermo',
            cancelButtonText: 'No, annulla',
          }).then((result) => {
            if (result.isConfirmed) {
              this.formValutazioneNutrizionale
                .get('pesoMinRaggiunto')
                .setValue(pesoRilevato)
              this.notificate.warning('Peso minimo raggiunto aggiornato con successo!')
              this.valoreMinModificato = true
            }
          })
        } else if (
          this.formValutazioneNutrizionale.get('pesoMaxRaggiunto').dirty &&
          pesoMin !== pesoRilevato
        ) {
          this.valoreMaxModificato = false
        } else if (
          this.formValutazioneNutrizionale.get('pesoMinRaggiunto').dirty &&
          pesoMin !== pesoRilevato
        ) {
          this.valoreMinModificato = false
        }

        break

      default:
        break
    }
  }
}
