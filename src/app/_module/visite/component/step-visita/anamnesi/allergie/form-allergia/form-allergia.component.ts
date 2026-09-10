import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-allergia',
  templateUrl: './form-allergia.component.html',
  styleUrls: ['./form-allergia.component.scss']
})
export class FormAllergiaComponent implements OnInit {

  formAllergia: FormGroup;
  idPaziente;
  selezionato;
  listaTipoAllergie;
  listaIntolleranze;
  isRiepilogo = false;
  idAllergia;
  isIntolleranza = false;
  isAllergia = false;

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'allergie');
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');

    this.getTipologiaAllergie();
    this.getIntolleranze();



    this.idAllergia = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idAllergia)) {
      this.riepilogoForm(this.idAllergia);
    }


    this.formAllergia = this.formBuilder.group({
      tipoAllergia: new FormControl(''),
      descrizione: new FormControl(''),
      intolleranza: new FormControl(''),
    });

  }

  async getTipologiaAllergie() {
    await this.service.getCallRequest({ action: 'allergie' }).then(data => {
      this.listaTipoAllergie = data;
    });
  }
  async getIntolleranze() {
    await this.service.getCallRequest({ action: 'getIntolleranze' }).then(data => {
      this.listaIntolleranze = data;
    });
  }

  async onSubmit(exit) {

    if (this.formAllergia.invalid) {
      this.appGen.validateAllFormFields(this.formAllergia);
      return;
    }

    const allergia = {
      IdAllergia: this.formAllergia.get("tipoAllergia").value,
      IdIntolleranza: this.formAllergia.get("intolleranza").value,
      Descrizione: this.formAllergia.get("descrizione").value,
      Id: this.appGen.isNullOrUndefined(this.idAllergia) ? 0 : this.idAllergia
    }

    const obj = {
      Allergia: allergia,
      IdPaziente: this.idPaziente,
      isAllergia: this.isAllergia,
      isIntolleranza: this.isIntolleranza
    }

    await this.service.postCallRequest({ action: 'insertUpdateAllergiaIntolleranza', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formAllergia.reset()
      }
    });

  }

  radioChange(evt) {
    this.formAllergia.reset();
    if (evt.value == 1) {
      this.isAllergia = true;

      this.formAllergia.controls.tipoAllergia.setValidators([Validators.required])
      this.formAllergia.controls.intolleranza.clearValidators()

      this.formAllergia.controls.tipoAllergia.enable()
      this.formAllergia.controls.intolleranza.disable()
      this.isIntolleranza = false;
    }
    if (evt.value == 2) {

      this.formAllergia.controls.tipoAllergia.clearValidators()
      this.formAllergia.controls.tipoAllergia.disable()
      this.formAllergia.controls.intolleranza.enable()
      this.formAllergia.controls.intolleranza.setValidators([Validators.required])
      this.isAllergia = false;
      this.isIntolleranza = true;
    }
    this.formAllergia.updateValueAndValidity();


  }

  riepilogoForm(idallergia) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getAllergia', param: idallergia }).then(data => {
      this.setValueForm(data).then(async () => {

        this.getTipologiaAllergie();
        this.getIntolleranze();
      });
    });
  }
  async setValueForm(data) {

    if (!this.appGen.isNullOrUndefined(data.idAllergia)) {
      this.formAllergia.controls.tipoAllergia.setValue(data.idAllergia)
      this.isAllergia = true;

      this.formAllergia.controls.tipoAllergia.setValidators([Validators.required])
      this.formAllergia.controls.intolleranza.clearValidators()

      this.formAllergia.controls.tipoAllergia.enable()
      this.formAllergia.controls.intolleranza.disable()
      this.isIntolleranza = false;
      this.selezionato = 1;
    } else {
      this.formAllergia.controls.tipoAllergia.clearValidators()
      this.formAllergia.controls.tipoAllergia.disable()
      this.formAllergia.controls.intolleranza.enable()
      this.formAllergia.controls.intolleranza.setValidators([Validators.required])
      this.isIntolleranza = true;
      this.isAllergia = false;
      this.formAllergia.controls.intolleranza.setValue(data.idIntolleranza)
      this.selezionato = 2
    }

    this.formAllergia.controls.descrizione.setValue(data.descrizione)
    this.formAllergia.updateValueAndValidity();

  }
}
