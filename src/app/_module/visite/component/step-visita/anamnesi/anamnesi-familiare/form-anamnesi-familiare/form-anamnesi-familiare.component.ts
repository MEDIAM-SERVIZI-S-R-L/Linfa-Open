import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-anamnesi-familiare',
  templateUrl: './form-anamnesi-familiare.component.html',
  styleUrls: ['./form-anamnesi-familiare.component.scss']
})
export class FormAnamnesiFamiliareComponent implements OnInit {


  formAnamnesiFamiliare: FormGroup;
  idPaziente;
  listaGradiParentela;
  isRiepilogo = false;
  idAnamnesi;

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'anamnesiFamiliare');

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');

    this.formAnamnesiFamiliare = this.formBuilder.group({
      patologia: new FormControl('', Validators.required),
      gradoParentela: new FormControl('', Validators.required),
    });


    this.idAnamnesi = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idAnamnesi)) {
      this.riepilogoForm(this.idAnamnesi);
    }

    this.getGradiParentela();
  }

  async getGradiParentela() {
    await this.service.getCallRequest({ action: 'gradiparentela', param: true }).then(data => {
      this.listaGradiParentela = data;
    });
  }

  async onSubmit(exit) {
    if (this.formAnamnesiFamiliare.invalid) {
      this.appGen.validateAllFormFields(this.formAnamnesiFamiliare);
      return;
    }

    let anamnesi = new Object();
    anamnesi = {
      IdGradoParentela: this.formAnamnesiFamiliare.get("gradoParentela").value,
      Patologia: this.formAnamnesiFamiliare.get("patologia").value,
      Id: this.appGen.isNullOrUndefined(this.idAnamnesi) ? 0 : this.idAnamnesi,
    }

    const obj = {
      Anamnesi: anamnesi,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateAnamnesiFamiliare', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formAnamnesiFamiliare.reset()
      }
    });
  }


  riepilogoForm(idanamnesi) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getDetailAnamnesiFamiliare', param: idanamnesi }).then(data => {
      this.setValueForm(data).then(async () => {
        this.getGradiParentela();
      });
    });
  }
  async setValueForm(data) {
    this.formAnamnesiFamiliare.controls.gradoParentela.setValue(data.idGradoParentela)
    this.formAnamnesiFamiliare.controls.patologia.setValue(data.patologia)
    this.idPaziente = data.idPaziente
  }

}
