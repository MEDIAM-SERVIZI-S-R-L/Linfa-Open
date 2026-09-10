import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-anamnesi-patologica-remota',
  templateUrl: './form-anamnesi-patologica-remota.component.html',
  styleUrls: ['./form-anamnesi-patologica-remota.component.scss']
})
export class FormAnamnesiPatologicaRemotaComponent implements OnInit {

  formAnamnesiPatologicaRemota: FormGroup;
  idPaziente;
  isRiepilogo = false;
  idAnamnesi;

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'anamnesiPatologicaRemota');

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');

    this.formAnamnesiPatologicaRemota = this.formBuilder.group({
      patologia: new FormControl('', Validators.required),
    });

    this.idAnamnesi = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idAnamnesi)) {
      this.riepilogoForm(this.idAnamnesi);
    }


  }

  async onSubmit(exit) {
    if (this.formAnamnesiPatologicaRemota.invalid) {
      this.appGen.validateAllFormFields(this.formAnamnesiPatologicaRemota);
      return;
    }

    let anamnesi = new Object();
    anamnesi = {
      Patologia: this.formAnamnesiPatologicaRemota.get("patologia").value,
      Id: this.appGen.isNullOrUndefined(this.idAnamnesi) ? 0 : this.idAnamnesi,
    }

    let obj = {
      Anamnesi: anamnesi,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateAnamnesiPatologicaRemota', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formAnamnesiPatologicaRemota.reset()
      }
    });
  }


  riepilogoForm(idanamnesi) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getDetailAnamnesiPatologicaRemota', param: idanamnesi }).then(data => {
      this.setValueForm(data)
    });
  }
  async setValueForm(data) {
    this.formAnamnesiPatologicaRemota.controls.patologia.setValue(data.patologia)
    this.idPaziente = data.idPaziente
  }

}
