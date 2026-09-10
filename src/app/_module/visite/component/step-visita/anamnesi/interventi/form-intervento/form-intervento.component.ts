import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { debounceTime, firstValueFrom, pipe, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service';
import { FiltroICD9Service } from 'src/app/_core/services/filtro-icd9.service';
import { Icd9 } from 'src/app/_models/interventi';

@Component({
  selector: 'app-form-intervento',
  templateUrl: './form-intervento.component.html',
  styleUrls: ['./form-intervento.component.css']
})
export class FormInterventoComponent implements OnInit {


  formIntervento: FormGroup;
  idPaziente;
  listaInterventi;
  listaPatologie;
  idIntervento;
  isRiepilogo = false;

  listaTipoInterventi;
  listaTipoInterventiFiltrata : ReplaySubject<[]> = new ReplaySubject<[]>(1);
  protected _onDestroy = new Subject<void>()

  public filtroIcd9: FormControl = new FormControl();

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location,
    private visitaServ: VisitaRepoService,
    private icd9Serv: FiltroICD9Service) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'interventi');

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');


    this.idIntervento = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idIntervento)) {
      this.riepilogoForm(this.idIntervento);

    }


    this.formIntervento = this.formBuilder.group({
      intervento: new FormControl('', Validators.required),
      anno: new FormControl(''),
      icd9: new FormControl('')
    });

    this.setFiltriIcd9();
  }

  async getListaInterventi() {
    await this.service.getCallRequest({ action: 'interventi' }).then(data => {
      this.listaInterventi = data;
    });
  }
  async getListaPatologie() {
    await this.service.getCallRequest({ action: 'patologie' }).then(data => {
      this.listaPatologie = data;
    });
  }

  async onSubmit(exit) {
    if (this.formIntervento.invalid) {
      this.appGen.validateAllFormFields(this.formIntervento);
      return;
    }


    let intervento = {
      Id: this.appGen.isNullOrUndefined(this.idIntervento) ? 0 : this.idIntervento,
      Intervento: this.formIntervento.get("intervento").value,
      Anno: this.formIntervento.get("anno").value,
    }

    let obj = {
      Intervento: intervento,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateIntervento', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formIntervento.reset()
      }
    });

  }

  riepilogoForm(idintervento) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getIntervento', param: idintervento }).then(data => {
      this.setValueForm(data);
    });
  }
  async setValueForm(data) {
    this.formIntervento.controls.intervento.setValue(data.intervento)
    this.formIntervento.controls.anno.setValue(data.anno)
    this.idPaziente = data.idPaziente
  }


  /**
   * Funzione inserita nell'oninit, parte quando cambia il valore della barra di ricerca
   */
  setFiltriIcd9(){
    this.filtroIcd9.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
    .subscribe((item) => {
      this.setIcd9TramiteRicerca(item)
    })
  }

  /**
   * Parte quando nella barra di ricerca sono presenti almeno 2 lettere
   * compie la ricerca delle ICD9 per riempire il campo intervento
   * @param interventoCercato stringa cercata
   * 
   */
  async setIcd9TramiteRicerca(interventoCercato: string){    
    this.listaTipoInterventi = [];
    try {      
      if (interventoCercato.length >= 2) {        
        this.listaTipoInterventi = await firstValueFrom(this.visitaServ.getICD9(interventoCercato));        
        let listaFiltrataOrdinata : any = [];
        listaFiltrataOrdinata = this.icd9Serv.filtraICD9(interventoCercato, this.listaTipoInterventi);
        this.listaTipoInterventiFiltrata.next(listaFiltrataOrdinata.slice());
      } else {
        this.listaTipoInterventi = [];
        this.listaTipoInterventiFiltrata.next(this.listaTipoInterventi.slice());
      }
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * Una volta cliccato l'icd9 viene compilato il campo intervento, se è già presente un intervento viene aggiunto al campo
   * @param event ICD9 cliccata
   */
  setinterventoDaICD9(event: Icd9){   
    
    const interventoScelto = event.icd9;
    if (this.formIntervento.controls.intervento.value.trim() !== '') {
      this.formIntervento.controls.intervento.setValue( this.formIntervento.controls.intervento.value +
        ', ' + 
       interventoScelto
         );   
    } else {
      this.formIntervento.controls.intervento.setValue(interventoScelto);   
    }
    //Una volta selezionato e riempito il ampo dell'intervento svuota la lista
    const listaVuota : any = [];
    this.listaTipoInterventiFiltrata.next(listaVuota.slice());
  }
}
