import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { Ruoli, StatoRichiesta, StatoVisita, TipoPrestazione, TipoRichiesta } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ModalAnnullaRichiestaComponent } from 'src/app/shared/modal/modal-annulla-richiesta/modal-annulla-richiesta.component';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-form-richiesta',
  templateUrl: './form-richiesta.component.html',
  styleUrls: ['./form-richiesta.component.scss']
})
export class FormRichiestaComponent implements OnInit {
  @ViewChild('pazienteSelect') pazienteSelect: MatSelect;
  formRichiesta: FormGroup;
  formFiltriPaziente: FormGroup;

  tipoUtente = Ruoli;
  idStatoRichiestaRichiesta = StatoRichiesta;
statoRichiesta: StatoRichiesta ;
  utenteLoggato;
  //id
  idPaziente: string;
  idRichiesta: string;
  idPazienteSelezionato: string;
  idPrimaVisita: string;
  //liste
  listaTipiRichieste: any;
  listaUrgenze: any;
  listaTipoPrestazione: any;
  listaAmbulatori: any;
  listaMedici: any;
  listaDietisti: any;
  listaPazienti: any;

  //boolean
  isRiepilogo = false;
  isCup = false;
  isInterna = false;
  isSapio = false;
  isAccettata = false;
  isCancellataTerminata = false;
  isVisitaDomicilio = false;


  tipoPrestazione = TipoPrestazione
  tipoRichiesta = TipoRichiesta
  richiestaObj;
  orariDurata = Array.from({ length: 8 }, (_, i) => i + 1)
  editRichiesta = false;
  daCompletare = false;
  calendarioRichieste = true;

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location,
    private router: Router,
    public authGuard: AuthGuard
  ) {
    this.utenteLoggato = this.authGuard.getUser();
  }

  ngOnInit(): void {
    this.generateForm();

    this.idRichiesta = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idRichiesta)) {
      this.isRiepilogo = true;

      this.formRichiesta.disable()
      this.formRichiesta.updateValueAndValidity()
    }


    this.activateRoute.queryParams.subscribe((params): void => {

      //Provengo dalla dashboard e passo l'id query
      if (!this.appGen.isNullOrUndefined(params.change)) {
        this.editRichiesta = true;

        this.formRichiesta.get("infermiere").enable()
        this.formRichiesta.get("ambulatorio").enable()
        this.formRichiesta.get("repartoRichiedente").enable()
        this.formRichiesta.get("idMedicoPrincipale").enable()
        this.formRichiesta.get("idMedicoSecondario").enable()
        this.formRichiesta.get("motivoCambiamento").enable()
        this.formRichiesta.get("numeroImpegnativaCup").enable()
        this.formRichiesta.updateValueAndValidity()

      }

      if (!this.appGen.isNullOrUndefined(params.tocomplete)) {
        this.editRichiesta = true;
        this.daCompletare = true;

        this.formRichiesta.get("infermiere").enable()
        this.formRichiesta.get("ambulatorio").enable()
        this.formRichiesta.get("repartoRichiedente").enable()
        this.formRichiesta.get("idMedicoPrincipale").enable()
        this.formRichiesta.get("idMedicoSecondario").enable()
        this.formRichiesta.get("tipoPrestazione").enable()
        this.formRichiesta.get("motivoRichiesta").enable()
        this.formRichiesta.get("dataPrestazione").enable()
        this.formRichiesta.get("numeroImpegnativaCup").enable()
        this.formRichiesta.get("priorita").enable()
        this.formRichiesta.updateValueAndValidity()

      }

    });

    this.appGen.loadingPanel.show();

    if (!this.appGen.isNullOrUndefined(this.idRichiesta)) {
      this.riepilogoForm(this.idRichiesta);
    }

    this.formFiltriPaziente = this.formBuilder.group({
      nome: new FormControl(''),
      cognome: new FormControl(''),
      cf: new FormControl(''),
    });



    this.getListaUrgenze();
    this.getTipiRichiesta();
    this.getListaTipiPrestazione();
    this.getListaAmbulatori();
    this.getListaMedici();
    this.getListaDietisti();

    const now = new Date();
    const mins = now.getMinutes();
    const quarterHours = Math.ceil(mins / 15);
    if (quarterHours == 4) {
      now.setHours(now.getHours() + 1);
    }
    const rounded = (quarterHours * 15) % 60;
    now.setSeconds(0);
    now.setMinutes(rounded);
    this.formRichiesta.get("dataPrestazione").setValue(now);
    this.appGen.loadingPanel.hide(); 
  }


  get formRichiestaControls() { return this.formRichiesta.controls }

  generateForm() {
    this.formRichiesta = this.formBuilder.group({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      sesso: new FormControl('', Validators.required),
      dataNascita: new FormControl('', Validators.required),
      numeroImpegnativaCup : new FormControl (''),
      cf: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$')]),
      motivoRichiesta: new FormControl(''),
      dataPrestazione: new FormControl(''),
      priorita: new FormControl(''),
      tipoRichiesta: new FormControl('', !this.isVisitaDomicilio? Validators.required : null),
      paziente: new FormControl(''),
      tipoPrestazione: new FormControl(''),
      infermiere: new FormControl(''),
      ambulatorio: new FormControl('', Validators.required),
      repartoRichiedente: new FormControl(''),
      idMedicoPrincipale: new FormControl('', !this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? Validators.required : null),
      // medicoSpecialista: new FormControl({value: '', disabled: this.isRiepilogo}, !this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? Validators.required : null)
      idMedicoSecondario: new FormControl(''),
      durataPrestazione: new FormControl(''),
      motivoCambiamento: new FormControl('', this.editRichiesta ? Validators.required : null)

    });
  }

  setDataRichiesta(data) {
    this.formRichiesta.get("dataPrestazione").setValue(data);
    this.appGen.scroll('form');

  }


  tipoRichiestaSelezionato(val) {
    switch (val) {
      case TipoRichiesta.Cup:
        this.isCup = true


        break;
      case TipoRichiesta.Interna:
        this.isInterna = true
        this.formRichiesta.controls.ambulatorio.setValue(3) //PRESSO REPARTO RICHI

        break;

      default:
        break;
    }
  }

  async getListaUrgenze() {
    await this.service.getCallRequest({ action: 'priorita' }).then(data => {
      this.listaUrgenze = data;
    });
  }

  async getListaTipiPrestazione() {
    await this.service.getCallRequest({ action: 'tipiprestazione' }).then(data => {
      this.listaTipoPrestazione = data;
    });
  }
  async getTipiRichiesta() {
    await this.service.getCallRequest({ action: 'tipirichiesta' }).then(data => {
      this.listaTipiRichieste = data;      
    });
  }
  async getListaAmbulatori() {
    await this.service.getCallRequest({ action: 'ambulatori' }).then(data => {
      this.listaAmbulatori = data;
    });
  }
  async getListaMedici() {
    const params = {
      tipoUtente: this.tipoUtente.Medico
    }
    const objRequest = {
      action: 'getUtenti',
      param: params
    }

    await this.service.postCallRequest(objRequest).then(data => {
      this.listaMedici = data;
    });
  }

  async getListaDietisti() {
    const params = {
      tipoUtente: this.tipoUtente.Dietista
    }
    const objRequest = {
      action: 'getUtenti',
      param: params,
      loadingPanel: false
    }

    await this.service.postCallRequest(objRequest).then(data => {
      this.listaDietisti = data;
    });
  }


  async onSubmit(cancelled: boolean) {

    if (!cancelled) {
      if (!this.formRichiesta.valid && this.formRichiesta.status !== 'DISABLED') {
        this.appGen.validateAllFormFields(this.formRichiesta);
        return;
      }
    }


    const continua = this.checkPrimaVisitaExist()


    if (continua) {


      const message = `Sei sicuro di voler proseguire?`;
      const dialogData = new ConfirmDialogModel("Attenzione!", message);
      const dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
        data: dialogData,
        panelClass: "modal-custom"
      });

      dialogRef.afterClosed().subscribe(async (dialogResult) => {
        if (dialogResult) {

          const Richiesta = {
            Nome: this.formRichiesta.get("nome").value,
            Cognome: this.formRichiesta.get("cognome").value,
            Sesso: this.formRichiesta.get("sesso").value,
            Cf: this.formRichiesta.get("cf").value,
            NumeroImpegnativa : this.formRichiesta.get("numeroImpegnativaCup").value,
            DataNascita: this.formRichiesta.get("dataNascita").value,//this.appGen.convertUTCDateToLocalDate(dataNascitaTmp),
            IdTipoRichiesta: this.formRichiesta.get("tipoRichiesta").value,
            IdPriorita: this.isVisitaDomicilio ? null : this.formRichiesta.get("priorita").value,
            MotivoRichiesta: this.formRichiesta.get("motivoRichiesta").value,
            DataPrestazione: this.formRichiesta.get("dataPrestazione").value,// this.appGen.convertUTCDateToLocalDate(dataPrestazioneTmp),
            DurataPrestazione: this.isVisitaDomicilio ? this.formRichiesta.get("durataPrestazione").value : 0,
            IdTipoPrestazione: this.formRichiesta.get("tipoPrestazione").value,
            IdStatoRichiesta: cancelled ? StatoRichiesta.Cancellata : StatoRichiesta.Accettata,
            //se sono come utente sapio prendo user sapio loggato, altrimenti il medico selezionato
            IdMedicoPrincipale: this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? -1 : this.formRichiesta.get("idMedicoPrincipale").value,
            IdMedicoSecondario: this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? null : this.formRichiesta.get("idMedicoSecondario").value,
            IdAmbulatorio: this.formRichiesta.get("ambulatorio").value,
            RepartoRichiedente: this.formRichiesta.get("repartoRichiedente").value,
            Infermiere: this.formRichiesta.get("infermiere").value,
          };

          const params = {
            Richiesta,
            IdPrimaVisita: this.appGen.isNullOrUndefined(this.idPrimaVisita) ? null : this.idPrimaVisita,
            IdPaziente: this.idPazienteSelezionato == undefined ? null : this.idPazienteSelezionato
          }
          if (this.isRiepilogo) {

            const objRequest = {
              action: 'gestiscirichiesta',
              param: this.idRichiesta,
              json: params
            }
            await this.service.putCallRequest(objRequest).then(() => {

              // if (!cancelled) {
              //   this.isAccettata = true;
              //   setTimeout(() => {

              //     let obj = {
              //       idRichiesta: this.idRichiesta
              //     }
              //     this.verificaPazienteRichiesta(obj).then(() => {
              //       this.router.navigate(['/app/richieste'])
              //     });
              //   }, 1000);
              // } else {

              this.router.navigate(['/app/richieste'])

            });
          } else {
            const objRequest = {
              action: 'inserimentorichiesta',
              param: params
            }
            await this.service.postCallRequest(objRequest).then(() => {
              this.backPreviousPage.back();
            });

          }
        }
      });
    }
  }

  async checkPrimaVisitaExist() {

    const tipoPrestazione = this.formRichiesta.get("tipoPrestazione").value
    //se setto visita di controllo o visita domicilio controllo che esista prima una "prima visita" a cui associare
    //controllo anche se non sia già stata creata una prima visita
    if (tipoPrestazione == TipoPrestazione.VisitaControllo || tipoPrestazione == TipoPrestazione.VisitaDomicilio || tipoPrestazione == TipoPrestazione.PrimaVisita) {
      const params = {
        cf: this.formRichiesta.get("cf").value,
        tipoPrestazione: this.formRichiesta.get("tipoPrestazione").value
      }

      const objRequest = {
        action: 'CheckRichiestaPrimaVisita',
        param: params
      }
      await this.service.postCallRequest(objRequest).then(data => {

        //Se sto creando una prima visita e non ne esiste una già allora permetto di crearla
        if (!data.exist && tipoPrestazione == TipoPrestazione.PrimaVisita) {
          return true;
        }

        //se la prima visita esiste già e sto creando una nuova prima visita non lo permetto
        if (data.exist && tipoPrestazione == TipoPrestazione.PrimaVisita) {
          return false;

        }

        //se sto creando una di controllo o domicilio e non esiste la prima visita allora lo blocco
        if (!data.exist && tipoPrestazione != TipoPrestazione.PrimaVisita) {
          return false;
        } else {
          //altrimenti se esiste la prima visita, gli assegno l'id per associarlo
          this.idPrimaVisita = data.idPrimaVisita
          return true
        }
      });
    } else {
      return true
    }
  }

  async compilaVisita() {

    const objRequest = {
      action: 'getVisitaFromRichiesta',
      param: this.idRichiesta
    }
    const visita = await this.service.getCallRequest(objRequest);

    let message = "Vuoi iniziare la visita per <strong>"

    const dataCliccata = new Date(visita.dataPrestazione).setHours(0, 0, 0, 0)
    const dataCorrente = this.appGen.today.setHours(0, 0, 0, 0)
    if (dataCliccata > dataCorrente) {
      //se non ha il permesso di forzare la visita allora lo blocco, altrimenti lo avviso e chiedo conferma
      if (!this.authGuard.canAccess(this.appGen.permesso.ForzaInizioVisita)) {
        this.appGen.notificate.warning("Non è possibile iniziare una visita con data futura")
        return;
      } else {
        message = "La visita è in una data successiva a quella corrente. Vuoi comunque iniziare la visita per "
      }
    }

    //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione

    let dialogData;
    let dialogRef;



    switch (visita.idStatoVisita) {
      case StatoVisita.Cancellata:
        return;

      case StatoVisita.DaIniziare:
        dialogData = new ConfirmDialogModel("Attenzione!", message + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong>?");
        dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            //Nuova visita
            if (visita.idTipoPrestazione == TipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
            } else {
              this.router.navigate(['/app/pazienti/step/paziente', visita.idPaziente], { queryParams: { visit: visita.id } })
            }
          }
        }));
        break;
      case StatoVisita.Iniziata:

        //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione
        // obj = {
        //   idPaziente: visita.idPaziente,
        //   idVisita: visita.idVisita
        // }
        dialogData = new ConfirmDialogModel("Attenzione!", "La visita è già stata iniziata, vuoi continuare la compilazione per " + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong> ");
        dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });

        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            if (visita.idTipoPrestazione == TipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', visita.idPaziente], { queryParams: { visit: visita.idVisitaPrecedente, currentvisit: visita.id, domiciliare: true } })
            } else {
              this.router.navigate(['/app/visite/step/anamnesi', visita.idPaziente], { queryParams: { visit: visita.id } })

            }
          }
        }));
        break;

      case StatoVisita.DaRefertare:
        dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi refertare la visita di " + '<strong class="patientViewCapitalize">' + visita.paziente + "</strong> ");
        dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {

            this.router.navigate(['/app/visite/riepilogo', visita.idPaziente], { queryParams: { visit: visita.id } })
          }
        }));
        break;

      default:
        break;
    }


  }

  updateRichiesta() {

    if (!this.formRichiesta.valid) {
      this.appGen.validateAllFormFields(this.formRichiesta);
      return;
    }

    const continua = this.checkPrimaVisitaExist();


    if (continua) {


      const message = `Sei sicuro di voler proseguire?`;
      const dialogData = new ConfirmDialogModel("Attenzione!", message);
      const dialogRef = this.appGen.dialog.open(ModalConfirmComponent, {
        data: dialogData,
        panelClass: "modal-custom"
      });

      dialogRef.afterClosed().subscribe(async (dialogResult) => {
        if (dialogResult) {

          let params = {}
          if (this.daCompletare) {

            params = {
              IdRichiesta: this.idRichiesta,
              IdMedicoPrincipale: this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? -1 : this.formRichiesta.get("idMedicoPrincipale").value,
              IdMedicoSecondario: this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? null : this.formRichiesta.get("idMedicoSecondario").value,
              NumeroImpegnativa : this.isCup? this.formRichiesta.get("numeroImpegnativaCup").value : null,
              IdPriorita: this.isVisitaDomicilio ? null : this.formRichiesta.get("priorita").value,
              MotivoRichiesta: this.formRichiesta.get("motivoRichiesta").value,
              DataPrestazione: this.formRichiesta.get("dataPrestazione").value,// this.appGen.convertUTCDateToLocalDate(dataPrestazioneTmp),
              IdTipoPrestazione: this.formRichiesta.get("tipoPrestazione").value,
              IdAmbulatorio: this.formRichiesta.get("ambulatorio").value,
              RepartoRichiedente: this.formRichiesta.get("repartoRichiedente").value,
              Infermiere: this.formRichiesta.get("infermiere").value,
              DaCompletare: true
            }
          } else {

            params = {
              IdRichiesta: this.idRichiesta,
              IdMedicoPrincipale: this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? -1 : this.formRichiesta.get("idMedicoPrincipale").value,
              IdMedicoSecondario: this.authGuard.canRole(this.appGen.ruolo.SAPIOext) ? null : this.formRichiesta.get("idMedicoSecondario").value,
              NumeroImpegnativa : this.isCup? this.formRichiesta.get("numeroImpegnativaCup").value : null,
              IdAmbulatorio: this.formRichiesta.get("ambulatorio").value,
              RepartoRichiedente: this.formRichiesta.get("repartoRichiedente").value,
              Infermiere: this.formRichiesta.get("infermiere").value,
              DataPrestazione: this.formRichiesta.get("dataPrestazione").value,// this.appGen.convertUTCDateToLocalDate(dataPrestazioneTmp),
              MotivoCambiamento: this.formRichiesta.get("motivoCambiamento").value,
              DaCompletare: false
            }
          }




          const objRequest = {
            action: 'updateRichiesta',
            json: params
          }
          await this.service.putCallRequest(objRequest).then(() => {


            this.backPreviousPage.back();

          });

        }
      })
    }
  }

  async verificaPazienteRichiesta(params) {
    const objRequest = {
      action: 'verificaPazienteRichiesta',
      param: params
    }
    await this.service.postCallRequest(objRequest)
  }

  async searchPaziente() {
    const params = {
      Nome: this.formFiltriPaziente.get("nome").value,
      Cognome: this.formFiltriPaziente.get("cognome").value,
      Cf: this.formFiltriPaziente.get("cf").value,
      page: 0,
      elementForPage: 20,
    }

    const objRequest = {
      action: 'listapazienti',
      param: params
    }
    await this.service.postCallRequest(objRequest).then((data) => {
      this.listaPazienti = data['listaPazienti'];
      setTimeout(() => {

        this.pazienteSelect.open();
      }, 0);

    });
  }

  selectedPaziente(evt) {
    this.formRichiesta.get('nome').setValue(evt.nome);
    this.formRichiesta.get('cognome').setValue(evt.cognome);
    this.formRichiesta.get('cf').setValue(evt.cf);
    this.formRichiesta.get('dataNascita').setValue(evt.dataNascita);
    this.formRichiesta.get('sesso').setValue(evt.sesso);
    this.idPazienteSelezionato = evt.idPaziente;
  }

  riepilogoForm(idRichiesta) {
   // alert(23)
    const objRequest = {
      action: 'richiesta',
      param: idRichiesta
    }
    this.service.getCallRequest(objRequest).then(data => {
      this.setValueForm(data).then(async () => {
        // this.getListaMedici();
        // this.getListaDietisti();
        // this.getTipiRichiesta();
        // this.getListaUrgenze();
        // this.getListaTipiPrestazione();
        // this.getListaAmbulatori();

      });
    });
  }
  async setValueForm(data) {

    // passo stato richiesta accessibile per tutto form
    this.statoRichiesta =data.idStatoRichiesta
    //this.statoRichiesta

    if (data.idStatoRichiesta == StatoRichiesta.Accettata) {
      this.isAccettata = true;
    }
    if (data.idStatoRichiesta === StatoRichiesta.Cancellata || data.idStatoRichiesta === StatoRichiesta.Terminata) {
      this.isCancellataTerminata = true;
    }


    this.richiestaObj = data;
if(this.authGuard.canRole(this.appGen.ruolo.Reparto) || this.authGuard.canRole(this.appGen.ruolo.Distretto))
{
  this.formRichiesta.disable();
}
    this.formRichiesta.controls.nome.setValue(data.nome)
    this.formRichiesta.controls.cognome.setValue(data.cognome)
    this.formRichiesta.controls.cf.setValue(data.cf)
    this.formRichiesta.controls.sesso.setValue(data.sesso)
    this.formRichiesta.controls.dataNascita.setValue(data.dataNascita)
    this.formRichiesta.controls.priorita.setValue(data.idPriorita)
    this.formRichiesta.controls.tipoRichiesta.setValue(data.idTipoRichiesta)

    if(data.idTipoRichiesta==this.tipoRichiesta.Distretto){
      this.formRichiesta.controls.motivoRichiesta.clearValidators()
    }

    if (data.idTipoRichiesta == 1) {
      this.isCup = true;
      this.formRichiesta.controls.numeroImpegnativaCup.setValue(data.numeroImpegnativa)
    }

    this.formRichiesta.controls.tipoPrestazione.setValue(data.idTipoPrestazione)
    this.formRichiesta.controls.dataPrestazione.setValue(data.dataPrestazione)

    if (data.idTipoPrestazione === 4) {
      this.isVisitaDomicilio = true;
      this.formRichiesta.controls.durataPrestazione.setValue(data.durataPrestazione)
      this.formRichiesta.controls.infermiere.setValue(data.infermiere)

    }

    this.formRichiesta.controls.motivoRichiesta.setValue(data.motivoRichiesta)
    this.formRichiesta.controls.ambulatorio.setValue(data.idAmbulatorio)
    this.formRichiesta.controls.repartoRichiedente.setValue(data.repartoRichiedente)
    this.formRichiesta.controls.idMedicoPrincipale.setValue(data.idMedicoPrincipale)
    this.formRichiesta.controls.idMedicoSecondario.setValue(data.idMedicoSecondario)
    this.formRichiesta.controls.infermiere.setValue(data.infermiere)
  }

  selectedTipoPrestazione(val) {
    //enum da fare
    if (val === this.tipoPrestazione.VisitaDomicilio)//visita a domicilio
    {
      this.isVisitaDomicilio = true;
      this.formRichiesta.controls.durataPrestazione.enable()

      //perchè essendo a casa non sarà in nessun ambulatorio
      this.formRichiesta.controls.ambulatorio.disable()
      this.formRichiesta.controls.ambulatorio.clearValidators()

      this.formRichiesta.controls.durataPrestazione.setValidators([Validators.required])


      this.formRichiesta.controls.motivoRichiesta.setValue('controllo domiciliare')
      this.formRichiesta.controls.tipoRichiesta.setValue(this.tipoRichiesta.AccettazioneDiretta)
    } else {
      this.isVisitaDomicilio = false;
      this.formRichiesta.controls.ambulatorio.enable()
      this.formRichiesta.controls.ambulatorio.setValidators([Validators.required])

      this.formRichiesta.controls.durataPrestazione.disable()
      this.formRichiesta.controls.durataPrestazione.clearValidators()

    }

    //aggiorno il form
    this.formRichiesta.updateValueAndValidity();
  }

  async annullaVisita() {
    const dialogData = new ConfirmDialogModel("Attenzione!", "Sei sicuro di voler annullare la richiesta di <strong><span class='patientViewCapitalize'>" + this.richiestaObj.nome + " " + this.richiestaObj.cognome + " </span></strong>?");
    const dialogRef = this.appGen.dialog.open(ModalAnnullaRichiestaComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });
    let motivoSelezionato;
    dialogRef.componentInstance.motivoSelezionato.subscribe((data) => {
      motivoSelezionato = data
    });

    dialogRef.afterClosed().subscribe((dialogResult => {
      if (dialogResult) {

        const params = {
          idMotivoCancellazione: motivoSelezionato
        };
        const objRequest = {
          action: 'annullaRichiesta',
          param: this.idRichiesta,
          json: params
        };
        this.service.putCallRequest(objRequest).then(() => {
          this.router.navigate(['/app/richieste']);
        });
      }
    }));
  }
}
