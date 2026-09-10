import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AuthService } from 'src/app/_core/app-auth/service/auth.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { debounceTime, ReplaySubject, Subject, takeUntil } from 'rxjs';
import _ from 'underscore';

@Component({
  selector: 'app-form-permessi',
  templateUrl: './form-permessi.component.html',
  styleUrls: ['./form-permessi.component.scss']
})
export class FormPermessiComponent implements OnInit {

  form: FormGroup;
  listaRuoli;
  listaRuoliFiltrata :  ReplaySubject<[]> = new ReplaySubject<[]>(1);
  listaPermessi = []
  listaUtenti : any = [];
  listaUtentiFiltrata :  ReplaySubject<[]> = new ReplaySubject<[]>(1);
  protected _onDestroy = new Subject<void>()

  @Input() tabPermessi

  listaPermessiGenerali;

  public filtroUtenti : FormControl = new FormControl();
  public filtroRuolo : FormControl = new FormControl();


  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public authService: AuthService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      tipoUtente: new FormControl(''),
      utente: new FormControl('')
    })

    this.getRuoli();
    this.getUtenti();  
    this.setFiltriUtente();    
    this.setFiltriRuoli();   
  }

  async setValueCheck(value, group, index) {
    this.listaPermessi[group].value[index].abilitato = value
  }
  ngOnChanges(changes) {

    if (!this.appGen.isNullOrUndefined(changes.listaPermessi)) {

      this.listaPermessi = changes.listaPermessi.currentValue;
    }
  }

  async onSubmit() {

    const message = `Sei sicuro di voler proseguire?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });


    dialogRef.afterClosed().subscribe((async (dialogResult) => {
      if (dialogResult) {



        let params;
        let objRequest;

        switch (this.tabPermessi) {
          case 0: //tipi utente

            params = {
              tipoUtente: this.form.get('tipoUtente').value,
              listaPermessi: this.listaPermessi
            };

            objRequest = {
              action: 'SalvaPermessiXTipoUtente',
              param: params
            };
            this.service.postCallRequest(objRequest).then(() => {
              this.authService.refreshToken();

            });

            break;
          case 1: //utente

            params = {
              utente: this.form.get('utente').value,
              listaPermessi: this.listaPermessi
            };
            objRequest = {
              action: 'SalvaPermessiXUtente',
              param: params
            };
            this.service.postCallRequest(objRequest).then(() => {
              this.authService.refreshToken();
            });
            break;

          default:
            return;
        }

      }


    }));
  }


  displaySelected(selectedOption: any){
    this.listaPermessi = [];
    this.tabPermessi = selectedOption.value; 
  }


  accordionPanelChanged(evt) {

    this.form.reset()
    this.listaPermessi = []
  }

  async selectedRuolo(value) {
    const objRequest = {
      action: 'GetPermessiXTipoUtente',
      param: value
    }
    await this.service.getCallRequest(objRequest).then((data) => {

      this.listaPermessi = data;
    })

  }
  async selectedUtente(value) {
    const objRequest = {
      action: 'GetPermessiXUtente',
      param: value
    }
    await this.service.getCallRequest(objRequest).then((data) => {
      this.listaPermessi = data;
    })

  }

  async getRuoli() {
    await this.service.getCallRequest({ action: 'getTipiUtente' }).then(data => this.listaRuoli = data); 
    this.listaRuoliFiltrata.next(this.listaRuoli.slice());  
  }

  async getUtenti() {
    const objRequest = {
      action: 'listaUtenti',
      param: {
        elementForPage: 1000
      }
    }
    await this.service.postCallRequest(objRequest).then(data => {
      
      this.listaUtenti = data?.listaUtenti;
    })
    this.listaUtentiFiltrata.next(this.listaUtenti.slice());
  }


  setFiltriUtente(){
    this.filtroUtenti.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy)
    )
    .subscribe((item) => {
      this.setListaUtentiTramiteRicerca(item)
    })
  }

  setListaUtentiTramiteRicerca(utenteCercato: string){
    if (utenteCercato.length >= 2) {
      let listaFiltrata : any = [];
      listaFiltrata  = _.filter(this.listaUtenti, function(utente){return utente.nomeUtente.toLowerCase().includes(utenteCercato)});
      this.listaUtentiFiltrata.next(listaFiltrata.slice());  
    }else{
      this.listaUtentiFiltrata.next(this.listaUtenti.slice());
    }
  }


  setFiltriRuoli(){
    this.filtroRuolo.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy)
    )
    .subscribe((item) => {
      this.setListaRuoliTramiteRicerca(item)
    })
  }


  setListaRuoliTramiteRicerca(ruoloCercato: string){
    if (ruoloCercato.length >= 2) {
      let listaFiltrata : any = [];
      listaFiltrata  = _.filter(this.listaRuoli, function(tipo){return tipo.tipoUtente.toLowerCase().includes(ruoloCercato)});
      this.listaRuoliFiltrata.next(listaFiltrata.slice());  
    }else{
      this.listaRuoliFiltrata.next(this.listaRuoli.slice());
    }
  }
}
