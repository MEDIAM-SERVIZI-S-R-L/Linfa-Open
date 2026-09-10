import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { ProprietaConfig, Ruoli } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import _ from 'underscore';

@Component({
  selector: 'app-form-utente',
  templateUrl: './form-utente.component.html',
  styleUrls: ['./form-utente.component.scss']
})
export class FormUtenteComponent implements OnInit {

  isDettaglio = false;
  formUtente: FormGroup;
  listaRuoli;
  idUtente;
  ruoloSelezionato;

  isSaved = false;

  tipiUtenteSelezionati = [];

  anagrafica: string;

  ruoli = Ruoli;
  distrettoCliccabile = false;
  farmaciaCliccabile = false;
  ospedaleCliccabile = false;

  LDAPAbilitato : boolean;
  firmaDigitaleAbilitata : boolean;
  digitalSingLocale: boolean;
  OTPManuale : boolean;

  idEnte: number;

  hide = true;

  selectedTab

  constructor(
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private router: Router,
    public dialog: MatDialog,
    private service: HttpSharedService,
    private activatedRoute: ActivatedRoute,
    public authGuard: AuthGuard,
    private notificate : SnackBarService
  ) { }

  ngOnInit() {    
    this.formUtente = this.formBuilder.group({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl(''),
      username: new FormControl('', Validators.required),
      cf: new FormControl('', Validators.pattern('^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$')),
      email: new FormControl('',),
      matricola: new FormControl('', Validators.required),
      password: new FormControl({value: '', disabled: true}),
      utenteLdap: new FormControl(''),
      utenteRemoto : new FormControl(''),
      otpManuale : new FormControl(false)
      // confermaPassword: new FormControl('')
    });

    this.idUtente = this.activatedRoute.snapshot.paramMap.get('id');

    this.getRuoli();

    if (!(this.idUtente == null || this.idUtente == undefined)) {
      //se ho l'id vuol dire che sono nel dettaglio
      this.isDettaglio = true;
      this.dettaglioForm();
    }
    this.getConfigurazionilinfa();
  }

  get formUtenteControls() { return this.formUtente.controls; }

  drop(event: CdkDragDrop<string[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }


  async getRuoli() {
    await this.service.getCallRequest({ action: 'getTipiUtente' }).then(data => this.listaRuoli = data);
  }

  /**
   * Funzione che recupera le configurazioni di Linfa, in base a queste determina se il campo LDAP e il campo firma digitale (remoto) siano required o no
   */
  async getConfigurazionilinfa(){
    try {
      const config =  await this.service.getCallRequest({ action: 'getConfigurazioniLinfa' });
      
      const ldap = _.findWhere(config, {proprieta: ProprietaConfig.LDAP});
      const digitalSign = this.appGen.configLinfa.ConfigDigitalSign;    

      this.LDAPAbilitato = ldap.abilitato;

      this.firmaDigitaleAbilitata = JSON.parse(digitalSign.remote.toString());

      this.digitalSingLocale =  !this.firmaDigitaleAbilitata;

      this.OTPManuale = digitalSign.otpmanuale;

      if (this.LDAPAbilitato === true) {
        this.formUtente.get('utenteLdap').setValidators([Validators.required]);
      } else{
        this.formUtente.get('utenteLdap').setValidators([]);
      }
      this.formUtente.get('utenteLdap').updateValueAndValidity();

      if (this.digitalSingLocale === false) {
        this.formUtente.get('utenteRemoto').setValidators([Validators.required]);
      } else{
        this.formUtente.get('utenteRemoto').setValidators([]);
      }
      this.formUtente.get('utenteRemoto').updateValueAndValidity();

      if (this.digitalSingLocale === true) {
        this.formUtente.get('cf').setValidators([Validators.required, Validators.pattern('^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$')]);
      }else {
        this.formUtente.get('cf').setValidators([]);
      }
      this.formUtente.get('cf').updateValueAndValidity();

    } catch (error) {
      console.error(error);
    }
  }



  async onSubmit() {
    if (this.formUtente.invalid) {
      this.appGen.validateAllFormFields(this.formUtente);
      this.notificate.error('Alcuni campi obbligatori non sono compilati correttamente');
      this.selectedTab = 0;
      return;
    }

    const params = {
      UserName: this.formUtente.get('username').value,
      Nome: this.formUtente.get('nome').value,
      Cognome: this.formUtente.get('cognome').value,
      Email: this.formUtente.get('email').value,
      Cf : this.formUtente.get('cf').value,
      Matricola: this.formUtente.get('matricola').value,
      utenteLDAP: this.formUtente.get('utenteLdap').value,
      utenteRemoto: this.formUtente.get('utenteRemoto').value,
      otpManuale : this.formUtente.get('otpManuale').value,
      // IdRuolo: this.formUtente.get('ruolo').value,
      IdUtente: this.idUtente,
      ListaTipiUtenti: this.tipiUtenteSelezionati
    };

    const objRequest = {
      action: 'InsertUpdateUtente',
      param: params
    }

    await this.service.postCallRequest(objRequest).then((data) => {
      if (!this.isDettaglio) {
        //insert nuovo utente
        const message = "La password generata per l'utente è: " + data.password;

        this.appGen.openDialog("Utente", message);

        this.formUtente.get('password').setValue(data.password);
        this.formUtente.disable();
        this.isSaved = true;
      }
      // this.router.navigate(['app/utenti/' + this.idUtente]);
      //window.location.reload();
    });

    await this.verificaRuoli();

    if (this.appGen.isNullOrUndefined(this.idUtente)) {
        this.router.navigate(['/app/utenti'])
    }
  }


  async dettaglioForm() {

    const objRequest = {
      action: 'utente',
      param: this.idUtente
    }

    await this.service.getCallRequest(objRequest).then(data => {

      data.tipiUtente.forEach(element => {

        this.listaRuoli = this.listaRuoli.filter(item => item.id !== element.id);
      });

      this.tipiUtenteSelezionati = data.tipiUtente;
      this.formUtente.get('email').setValue(data['email']);
      this.formUtente.get('matricola').setValue(data['matricola']);
      this.formUtente.get('nome').setValue(data['nome']);
      this.formUtente.get('cognome').setValue(data['cognome']);
      this.formUtente.get('username').setValue(data['username']);
      this.formUtente.get('cf').setValue(data['cf']);
      this.formUtente.get('utenteLdap').setValue(data['utenteLDAP']);
      this.formUtente.get('utenteRemoto').setValue(data['utenteRemoto']);
      this.formUtente.get('otpManuale').setValue(data['otpManuale'])
      // this.formUtente.get('ruolo').setValue(data['idRuolo']);
      if (!this.authGuard.canAccess(this.appGen.permesso.ModificaUtente)) {
        this.formUtente.disable();
      }

      this.anagrafica = data.nome + ' ' + data.cognome;
    });

    this.verificaRuoli();
  }

  verificaRuoli(){
    const abilitatoDistretto = _.where(this.tipiUtenteSelezionati, {id: this.ruoli.Distretto});
    const abilitataFarmacia = _.where(this.tipiUtenteSelezionati, {id: this.ruoli.FarmaciaOspedaliera});
    const abilitatoOspedale = _.where(this.tipiUtenteSelezionati, {id: this.ruoli.Reparto});

    if (abilitatoDistretto.length > 0) {
      this.distrettoCliccabile = true;
    } else {
      this.distrettoCliccabile = false;
    }

    if (abilitataFarmacia.length > 0) {
      this.farmaciaCliccabile = true;
    } else{
      this.farmaciaCliccabile = false;
    }

    if(abilitatoOspedale.length > 0){
      this.ospedaleCliccabile = true;
    } else{
      this.ospedaleCliccabile = false;
    }
  }
}
