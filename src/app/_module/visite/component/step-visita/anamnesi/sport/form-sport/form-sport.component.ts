import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-sport',
  templateUrl: './form-sport.component.html',
  styleUrls: ['./form-sport.component.css']
})
export class FormSportComponent implements OnInit {


  formSport: FormGroup;
  idPaziente;
  listaIntensita;
  listaLivelloSport;
  isRiepilogo = false;
  idAttivitaMotoria;
  orariDurata = Array.from({ length: 8 }, (_, i) => (i * 30) + 30)

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'attivita');

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');


    this.idAttivitaMotoria = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idAttivitaMotoria)) {
      this.riepilogoForm(this.idAttivitaMotoria);
    }

    this.formSport = this.formBuilder.group({
      attivita: new FormControl(''),
      livelloSport: new FormControl(''),
      durata: new FormControl(''),
      frequenza: new FormControl(''),
      intensita: new FormControl('', Validators.required),
    });

    this.getLivelloSport();
    this.getIntensita();
  }

  async getIntensita() {
    await this.service.getCallRequest({ action: 'intensita' }).then(data => {
      this.listaIntensita = data;
    });
  }
  async getLivelloSport() {
    await this.service.getCallRequest({ action: 'sportlivelli' }).then(data => {
      this.listaLivelloSport = data;
    });
  }

  async onSubmit(exit) {
    if (this.formSport.invalid) {
      this.appGen.validateAllFormFields(this.formSport);
      return;
    }

    let attivita = new Object();
    attivita = {
      IdSportLivello: this.formSport.get("livelloSport").value,
      IdIntensita: this.formSport.get("intensita").value,
      Attivita: this.formSport.get("attivita").value,
      Frequenza: this.formSport.get("frequenza").value,
      Durata: this.formSport.get("durata").value,
      Id: this.appGen.isNullOrUndefined(this.idAttivitaMotoria) ? 0 : this.idAttivitaMotoria,
    }

    let obj = {
      Attivita: attivita,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateAttivita', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formSport.reset()
      }
    });
  }


  riepilogoForm(idAttivitaMotoria) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getAttivitaMotoria', param: idAttivitaMotoria }).then(data => {
      this.setValueForm(data).then(async () => {
        this.getLivelloSport();
        this.getIntensita();
      });
    });
  }
  async setValueForm(data) {
    this.formSport.controls.livelloSport.setValue(data.idSportLivello)
    this.formSport.controls.attivita.setValue(data.attivita)
    this.formSport.controls.intensita.setValue(data.idIntensita)
    this.formSport.controls.durata.setValue(data.durata)
    this.formSport.controls.frequenza.setValue(data.frequenza)
    this.idPaziente = data.idPaziente
  }

}
