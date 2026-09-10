import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-anamnesi-patologica-prossima',
  templateUrl: './form-anamnesi-patologica-prossima.component.html',
  styleUrls: ['./form-anamnesi-patologica-prossima.component.scss']
})
export class FormAnamnesiPatologicaProssimaComponent implements OnInit {

  formAnamnesiPatologicaProssima: FormGroup;
  idPaziente;
  isRiepilogo = false;
  showCampoAltro = false;
  idAnamnesi;
  listaMacroPatologie;
  listaPatologie = [];

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'anamnesiPatologicaProssima');

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');

    this.formAnamnesiPatologicaProssima = this.formBuilder.group({
      macroPatologia: new FormControl('', Validators.required),
      patologia: new FormControl('', Validators.required),
      altro: new FormControl(''),
      descrizione: new FormControl(''),
    });

    this.idAnamnesi = this.activateRoute.snapshot.paramMap.get('id');
    if (!this.appGen.isNullOrUndefined(this.idAnamnesi)) {
      this.riepilogoForm(this.idAnamnesi);
    }

    this.getListMacroPatologie();

  }

  async onSubmit(exit) {
    if (this.formAnamnesiPatologicaProssima.invalid) {
      this.appGen.validateAllFormFields(this.formAnamnesiPatologicaProssima);
      return;
    }

    let anamnesi = new Object();
    anamnesi = {
      IdPatologia: this.formAnamnesiPatologicaProssima.get("patologia").value,
      IdMacroPatologia: this.formAnamnesiPatologicaProssima.get("macroPatologia").value,
      Altro: this.formAnamnesiPatologicaProssima.get("altro").value,
      Descrizione: this.formAnamnesiPatologicaProssima.get("descrizione").value,
      Id: this.appGen.isNullOrUndefined(this.idAnamnesi) ? 0 : this.idAnamnesi,
    }

    const obj = {
      Anamnesi: anamnesi,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateAnamnesiPatologicaProssima', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formAnamnesiPatologicaProssima.reset()
        this.listaPatologie = []
        this.showCampoAltro = false;
      }
    });
  }


  riepilogoForm(idanamnesi) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getDetailAnamnesiPatologicaProssima', param: idanamnesi }).then(data => {
      this.setValueForm(data)
    });
  }
  async setValueForm(data) {
    this.macroSelezionata(data.idMacroPatologia).then(() => {


      this.formAnamnesiPatologicaProssima.controls.descrizione.setValue(data.descrizione)


      this.formAnamnesiPatologicaProssima.controls.macroPatologia.setValue(data.idMacroPatologia)
      this.formAnamnesiPatologicaProssima.controls.altro.setValue(data.altro)
      this.formAnamnesiPatologicaProssima.controls.patologia.setValue(data.idPatologia)
      // this.patologiaSelezionata(data.idPatologia);
      const patologia = this.appGen.getElementByFilter(data.idPatologia, this.listaPatologie)[0]
      if (patologia.altro) {
        this.showCampoAltro = true;
      } else {
        this.showCampoAltro = false;
      }
      this.idPaziente = data.idPaziente
    })
  }
  async getListMacroPatologie() {
    await this.service.getCallRequest({ action: 'getListMacroPatologie' }).then((data) => {
      this.listaMacroPatologie = data;
    });
  }

  async macroSelezionata(val) {
    this.showCampoAltro = false;



    await this.service.getCallRequest({ action: 'listapatologie', param: val }).then((data) => {
      this.listaPatologie = data;
    });
  }

  async patologiaSelezionata(val) {
    const patologia = this.appGen.getElementByFilter(val, this.listaPatologie)[0]
    if (!this.appGen.isNullOrUndefined(patologia)) {

      if (patologia.altro) {
        this.showCampoAltro = true;
      } else {
        this.showCampoAltro = false;
      }

    }

    // await this.visiteService.getListPatologie(val).then((data) => {
    //   this.listaPatologie = data;
    // });
  }
}
