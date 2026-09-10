import { Injectable } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { AngularEditorConfig } from '@kolkov/angular-editor'
import $ from 'jquery'
import moment from 'moment'
import printJS from 'print-js'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import { AuthService } from 'src/app/_core/app-auth/service/auth.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { ModalDettaglioVisitaComponent } from 'src/app/_module/visite/component/modal-dettaglio-visita/modal-dettaglio-visita.component'
import {
  ConfirmDialogModel,
  ModalConfirmComponent,
} from 'src/app/shared/modal/modal-confirm/modal-confirm.component'
import {
  DialogModel,
  ModalDialogComponent,
} from 'src/app/shared/modal/modal-dialog/modal-dialog.component'
import * as env from 'src/environments/environment'

import { Permessi, ProprietaConfig, Ruoli, TipiAmminoacidi } from '../helpers/enums'
import { ScrollService } from './scroll.service'

@Injectable({
  providedIn: 'root',
})
export class AppGeneralService {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private authGuard: AuthGuard,
    public scrollService: ScrollService,
    public notificate: SnackBarService
  ) {}

  urlBackend = env.environment.apiUrl + env.environment.requestPath
  permesso = Permessi
  ruolo = Ruoli
  proprietaConfig = ProprietaConfig
  configLinfa = new ConfigLinfa()

  user: any = this.authGuard.getUser()
  configurazioniObj: any[]

  username: string
  today = new Date()
  public stepMinute = 15
  public isMobile = false
  loader = false
/**
 * Funzione che ritorna la configurazione di default per  AngularEditor
 * @returns AngularEditorConfig - la configurazione di default
 */
  editorDefaultConfig():AngularEditorConfig {
    return {
      editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '150px',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Scrivi il testo qui...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        { class: 'arial', name: 'Arial' },
        { class: 'times-new-roman', name: 'Times New Roman' },
        { class: 'calibri', name: 'Calibri' },
        { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      ],

      uploadWithCredentials: false,
      sanitize: true,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
        ['subscript', 'superscript', 'heading'],
        [
          'removeFormat',
          'link',
          'insertImage',
          'insertVideo',
          'insertHorizontalRule',
          'removeFormat',
          'unlink',
          'customClasses',
          'justifyLeft',
          'justifyCenter',
          'justifyRight',
          'justifyFull',
          'indent',
          'outdent',
          'insertUnorderedList',
          'insertOrderedList',
          'fontSize',
          'backgroundColor',
          'fontName',
          'upload',
        ],
      ],
    }

  }

  refertoTest = {
    paziente: {
      nome: 'Mario Rossi',
      cf: 'cf',
      dataNascita: 'Mario',
    },
    visita: {
      dataVisita: new Date().getDate(),
      medico: 'Matteo Rossi',
      medicoSecondario: '-',
      infermiere: '-',
      ambulatorio: 'Ambulatorio Sanremo',
      idTipoAlimentazione: 2,
    },
    nutrizione: {
      tipoalimentazione: 'artificiale',
    },
    vn: {
      pesoattuale: 0,
      bmiattuale: 0,
      caloponderale: 0,
      caloPonderale3Mesi: 0,
      caloPonderale6Mesi: 0,
      malnutrizione: '-',
    },
  }

  readonly strStepSorveglianza = 'step'
  readonly strSchedaID = 'schedaID'

  readonly DurataPianoNutrizionale = [15, 30, 60, 90]
  readonly TipoContatto = [
    { name: 'Mail', value: 1 },
    { name: 'Telefono', value: 2 },
  ]
  readonly GenderType = [
    { name: 'Maschio', abbrev: 'M' },
    { name: 'Femmina', abbrev: 'F' },
    { name: 'Altro', abbrev: 'A' },
  ]
  readonly LatoMisurazione = [
    { name: 'Sinistro', abbrev: 'sx' },
    { name: 'Destro', abbrev: 'dx' },
  ]
  readonly TipiAmminoacidi = [
    { name: 'Completi', id: 1 },
    { name: 'Essenziali', id: 2 },
    { name: 'Selettivi', id: 3 },
    { name: 'Nefrologici', id: 4 },
  ]
  readonly QuantitaSacca = [
    { name: '250 ml', value: 250 },
    { name: '500 ml', value: 500 },
    { name: '750 ml', value: 750 },
    { name: '1000 ml', value: 1000 },
  ]

  readonly NumeroSacche = [
    { name: '1 sacca', value: 1 },
    { name: '2 sacche', value: 2 },
    { name: '3 sacche', value: 3 },
    { name: '4 sacche', value: 4 },
    { name: '5 sacche', value: 5 },
  ]
  readonly LogLevel = [
    { name: 'Errore', id: 99 },
    { name: 'Warning', id: 50 },
    { name: 'Debug', id: 5 },
    { name: 'Information', id: 10 },
  ]

  readonly StatoRichieste = [
    { name: 'Da accettare', id: 5 },
    { name: 'Accettata', id: 10 },
    { name: 'Terminata', id: 15 },
    { name: 'Cancellata', id: 99 },
  ]

  readonly StatoVisite = [
    { name: 'Da iniziare', id: 20 },
    { name: 'Iniziata', id: 25 },
    { name: 'Da refertare', id: 30 },
    { name: 'Terminata', id: 35 },
    { name: 'Firmata', id: 40 },
    { name: 'Cancellata', id: 99 },
  ]
  readonly TipoAlimentazione = [
    { name: 'Naturale', id: 1 },
    { name: 'Artificiale', id: 2 },
  ]

  /**Prende le configurazioni e le mappa alla classe */
  setConfigLinfa() {
    this.configLinfa.PrivacyAbilitata =
      this.getProprietaConfig(this.proprietaConfig.Privacy,true) === true
    this.configLinfa.CredenzialiAbilitate =
      this.getProprietaConfig(this.proprietaConfig.CredenzialiApp) === 'true'

    this.configLinfa.FirmaDigitaleAbilitata =
      this.getProprietaConfig(this.proprietaConfig.FirmaDigitale,true) === true
      this.configLinfa.FirmaDigitaleAbilitata== true? this.configLinfa.ConfigDigitalSign =  JSON.parse(this.getProprietaConfig(this.proprietaConfig.FirmaDigitale)): null
    /**** OBSOLETA this.configLinfa.ProvaFirmaDigitale =
      this.getProprietaConfig(this.proprietaConfig.ProvaFirma) === 'true' */
    this.configLinfa.Intestazione = JSON.parse(
      this.getProprietaConfig(this.proprietaConfig.Intestazione)
    )
    this.configLinfa.IntestazioneMediciFirma = JSON.parse(
      this.getProprietaConfig(this.proprietaConfig.IntestazioneMediciFirma)
    )
    this.configLinfa.PrenotaProssimaVisita = JSON.parse(
      this.getProprietaConfig(this.proprietaConfig.PrenotaProxVisita)
    )
    this.configLinfa.Sincronizzazione = JSON.parse(
      this.getProprietaConfig(this.proprietaConfig.Sync)
    )

  this.configLinfa.InvioVersoMirth = this.getProprietaConfig(this.proprietaConfig.InvioVersoMirth,true) === true

    this.configLinfa.AbilitataRicercaEsterna= this.getProprietaConfig(this.proprietaConfig.RicercaEsterna,true) === true ? true: false;

    this.configLinfa.ModuloOrderEntry= this.getProprietaConfig(this.proprietaConfig.ModuloOrderEntry) === 'true' ? true: false;
    this.configLinfa.ModuloDistretto= this.getProprietaConfig(this.proprietaConfig.ModuloDistretto) === 'true' ? true: false;
    this.configLinfa.invioPianoNutrizionaleTramiteMail = this.getProprietaConfig(this.proprietaConfig.mailXPianoNutrizionale) === 'true'? true : false;
    this.configLinfa.TipiVisualizzazioneDieta = JSON.parse(this.getProprietaConfig(this.proprietaConfig.TipiVisualizzazioneDieta))    
    this.configLinfa.InvioRefertiSenzaFirma = this.getProprietaConfig(this.proprietaConfig.InvioRefertiSenzaFirma, true) === true? true : false;
  }

  /**
   * Date to years old
   * @param _date
   */
  getAge(_date: Date) {
    let age: number | string = moment().diff(_date, 'years', true)

    let label = 'anni'
    if (age < 1) {
      age = moment().diff(_date, 'months', true)
      if (age == 1) {
        label = 'mese'
      } else {
        label = 'mesi'
      }
    } else if (age == 1) {
      label = 'anno'
    }
    return parseInt(age.toString()) + ' ' + label
  }

  returnTipoAmminoacidi(tipo) {
    return TipiAmminoacidi[tipo]
  }

  async _base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64)
    const len = binary_string.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
  }

  onActivate(e, outlet) {
    setTimeout(
      () =>
        outlet.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }),
      0
    )
  }

  /**Quando faccio un redirect, cambio utente, impersonifico ecc, controllo i vari permessi e lo reindirizzo dove può accedere */
  goToModule() {
    if (this.authGuard.canAccess(this.permesso.ModuloDashboard)) {
      this.router.navigate(['/app/dashboard'])
      return
    }

    if (this.authGuard.canAccess(this.permesso.ModuloVisite)) {
      this.router.navigate(['/app/visite'])
      return
    }

    if (this.authGuard.canAccess(this.permesso.ModuloRichieste)) {
      this.router.navigate(['/app/richieste'])
      return
    }

    if (this.authGuard.canAccess(this.permesso.ModuloPazienti)) {
      this.router.navigate(['/app/pazienti'])
      return
    }
    if (this.authGuard.canAccess(this.permesso.ModuloSupporto)) {
      this.router.navigate(['/app/contatti'])
      return
    }
  }

  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth
    const breakpoint = 992
    if (w < breakpoint) {
      return true
    } else {
      return false
    }
  }

  hideTextMobile(): boolean {
    const w = document.documentElement.clientWidth
    const breakpoint = 1324
    if (w < breakpoint) {
      return true
    } else {
      return false
    }
  }

  ProporzioneValori(valore_base, quantita, quantita_base) {
    const valore = (valore_base * quantita) / quantita_base
    return Math.round(valore)
  }

  percentualeValoriTotali(data) {
    let azotoTot = data.azototot;
    let proteineTot = data.proteinetot;
    let lipidiTot = data.lipiditot;
    let carboidratiTot = data.carboidratitot;

    ///PARTE SILENZIATA IL 14/11/2023 IN SEGUITO ALLA SEGNALAZIONE DEL BUG 1050
    // if (data.prodotti) {
    //   data.prodotti.forEach((pasto) => {
    //     pasto.prodotti.forEach((prodotto) => {
    //       kcalProdotti += prodotto.kcal
    //       azotoTot += prodotto.azoto
    //       proteineTot += prodotto.proteine
    //       lipidiTot += prodotto.lipidiTotali
    //       carboidratiTot += prodotto.glucidiDispon
    //     })
    //   })
    // }

    const kcal = data.kcaltot;
    return {
      kcal: kcal,
      azoto: this.calcolaPercentuale(azotoTot, kcal),
      proteine: this.calcolaPercentuale(proteineTot, kcal),
      carboidrati: this.calcolaPercentuale(carboidratiTot, kcal),
      lipidi: this.calcolaPercentuale(lipidiTot, kcal),
    }
  }

  calcolaPercentuale(value, kcal) {
    if (value == 0) {
      return 0 + '%'
    }
    return Number((value / kcal) * 100).toFixed(1) + '%'
  }

  percentualePasto(data, kcal) {
    let kcalTotPasto = 0
    const prodotti = data.prodotti
    prodotti.forEach((element) => {
      kcalTotPasto += element.kcal
    })

    if (kcalTotPasto == 0) {
      return 0 + '%'
    }
    return Number((kcalTotPasto / kcal) * 100).toFixed(1) + '%'
  }

  logout() {
    const message = `Sei sicuro di voler effettuare il logout?`
    const dialogData = new ConfirmDialogModel('Attenzione!', message)
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.authService.clearSession()
        this.router.navigate(['/'])
      }
    })
  }

  /**
   * Mi prendo la proprietà nella lista di configurazioni
   * se passo checkAbilitato= true guardo valore del abilitato invece del valore, serve per DigitalSign
   */
  getProprietaConfig(proprieta, checkAbilitato= false) {    
    const prop = this.configurazioniObj.filter((x) => x.proprieta === proprieta)[0]
    if (this.isNullOrUndefined(prop) || !prop.abilitato) {
      return null
    }
    return checkAbilitato?prop.abilitato: prop.valore
  }

  /**
   * Mi prendo l'elemento di una lista attraverso il suo id
   */
  getElementByFilter(id: number, lista: any[]) {
    return lista.filter((x) => x.id === id)
  }

  public transform(input: string): string {
    if (!input) {
      return ''
    } else {
      return input.replace(/\b\w/g, (first) => first.toLocaleUpperCase())
    }
  }

  public isNullOrUndefined(value) {
    if (value === undefined || value === '' || value === null || value === '&#160;') {
      return true
    } else {
      return false
    }
  }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach((field) => {

      const control = formGroup.get(field)
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true })
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control)
      }
    })
  }

  /**
   * Funzione per capire se sono rimasti  campi con la validazione , ritorna nome del campo con sigla se ha la validazione o no
   * @param formGroup
   */
  hasValidateFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach((field) => {

      const control = formGroup.get(field)

      if(control.validator)
      {
        console.log(field+"- ha la validazione")

      }else{
        console.log(field+"------- senza la validazione ")
      }
    })
  }

  convertToLocaleDate(_date) {
    if (this.isNullOrUndefined(_date)) {
      return null
    }
    return moment(_date, 'DD/MM/YYYY HH:mm').format()
  }
  convertToOnlyDate(_date) {
    if (this.isNullOrUndefined(_date)) {
      return null
    }
    return moment(_date, 'DD/MM/YYYY').format()
  }

  scroll(id: string) {
    setTimeout(() => {
      if (!this.isNullOrUndefined(id)) {
        this.scrollService.scrollToElementById(id)
      }
    }, 0)
  }

  openDialog(title: string, message: string) {
    const dialogData = new DialogModel(title, message)
    this.dialog.open(ModalDialogComponent, {
      data: dialogData,
      panelClass: 'modal-custom',
    })
  }

  openDettaglioVisita(content: any) {
    this.dialog.open(ModalDettaglioVisitaComponent, {
      data: content,
      panelClass: 'modal-custom',
    })
  }

  async stampa(pdfFile) {
    if (pdfFile) {
      const fileURL = window.URL.createObjectURL(pdfFile)
      printJS(fileURL)
    }
    // this.pdfService.print();
  }

  loadingPanel = {
    Setup() {
      $('body').append(
        '<div class="loadingPanel"><div class="loadingSpinner"><div style="width:100%;height:100%" class="lds-interwind"><div></div><div></div></div></div>'
        )
    },
    show() {
      if (!this.loader) {
        $('.loadingPanel').show()
        this.loader = true
      }
    },
    hide() {
      if (this.loader) {
        $('.loadingPanel').fadeOut()
        $('.innerLoadingPanel').remove()
        this.loader = false
      }
    },

    HideInners: function () {
      $('.innerLoadingPanel').fadeOut(function () {
        $(this).remove()
      })
    },
    HideIn: function (jqContainer) {
      jqContainer.find('div.innerLoadingPannel').remove()
    },
  }
}

export class ConfigLinfa {
  PrivacyAbilitata: boolean
  FirmaDigitaleAbilitata: boolean
  ConfigDigitalSign: ConfigDIgitalSign
  ProvaFirmaDigitale: boolean
  PrenotaProssimaVisita: boolean
  Sincronizzazione: boolean
  InvioVersoMirth:any
  CredenzialiAbilitate: boolean
  Intestazione: any
  IntestazioneMediciFirma: any
  AbilitataRicercaEsterna: boolean
  ModuloOrderEntry: boolean
  ModuloDistretto: boolean
  invioPianoNutrizionaleTramiteMail : boolean
  TipiVisualizzazioneDieta : ITipiVisualizzazioneDieta
  InvioRefertiSenzaFirma : boolean
}

 interface ConfigDIgitalSign
{
remote:boolean // se remota si / no
multiple: boolean // posso fare le firme multiple,
maxfilenumber: number // numero massimo del file da firmare,
type: string // pades tipo della algoritmo cifratura
otpmanuale:boolean //true o false
}
 export interface ITipiVisualizzazioneDieta {
  settimanale: ISettimanale
  xPasti: IXPasti
  tabelle: ITabelle
}
 interface ISettimanale {
  default: boolean
  abilitato: boolean
}
 interface IXPasti {
  default: boolean
  abilitato: boolean
}
 interface ITabelle {
  default: boolean
  abilitato: boolean
}