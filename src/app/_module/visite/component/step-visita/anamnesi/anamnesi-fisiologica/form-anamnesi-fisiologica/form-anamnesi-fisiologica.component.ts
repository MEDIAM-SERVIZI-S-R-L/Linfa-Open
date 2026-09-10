import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-anamnesi-fisiologica',
  templateUrl: './form-anamnesi-fisiologica.component.html',
  styleUrls: ['./form-anamnesi-fisiologica.component.scss']
})
export class FormAnamnesiFisiologicaComponent implements OnInit {


  formAnamnesiFisiologica: FormGroup;
  idPaziente;
  isRiepilogo = false;
  idAnamnesi;

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'anamnesiFisiologica');
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');

    this.formAnamnesiFisiologica = this.formBuilder.group({
      descrizione: new FormControl('', Validators.required),
    });

    this.idAnamnesi = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idAnamnesi)) {
      this.riepilogoForm(this.idAnamnesi);
    }


  }

  async onSubmit(exit?) {
    if (this.formAnamnesiFisiologica.invalid) {
      this.appGen.validateAllFormFields(this.formAnamnesiFisiologica);
      return;
    }

    let anamnesi = new Object();
    anamnesi = {
      Descrizione: this.formAnamnesiFisiologica.get("descrizione").value,
      Id: this.appGen.isNullOrUndefined(this.idAnamnesi) ? 0 : this.idAnamnesi,
    }

    let obj = {
      Anamnesi: anamnesi,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateAnamnesiFisiologica', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formAnamnesiFisiologica.reset()
      }
    });
  }


  riepilogoForm(idanamnesi) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getDetailAnamnesiFisiologica', param: idanamnesi }).then(data => {
      this.setValueForm(data)
    });
  }
  async setValueForm(data) {
    this.formAnamnesiFisiologica.controls.descrizione.setValue(data.descrizione)
    this.idPaziente = data.idPaziente
  }

}
