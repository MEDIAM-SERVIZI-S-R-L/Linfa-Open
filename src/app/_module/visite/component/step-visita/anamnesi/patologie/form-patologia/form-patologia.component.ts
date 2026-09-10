import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-patologia',
  templateUrl: './form-patologia.component.html',
  styleUrls: ['./form-patologia.component.css']
})
export class FormPatologiaComponent implements OnInit {


  formPatologia: FormGroup;
  idPaziente;
  listaPatologie;
  listaTraumi;
  listaStress;
  listaAttivita;
  isRiepilogo = false;
  idPatologia;
  dataFinale;



  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');


    this.idPatologia = this.activateRoute.snapshot.paramMap.get('id');
    if (!(this.idPatologia == null || this.idPatologia == undefined || this.idPatologia <= '')) {
      this.riepilogoForm(this.idPatologia);
    }

    this.formPatologia = this.formBuilder.group({
      patologia: new FormControl('', Validators.required),
      terapia: new FormControl(''),
      stress: new FormControl(''),
      cronica: new FormControl(false),
      primaria: new FormControl(false),
      attivita: new FormControl(''),
      trauma: new FormControl(''),
      dal: new FormControl(''),
      al: new FormControl(''),
    });

    this.getListaPatologie();
    this.getListaStress();
    this.getListaTrauma();
    this.getListaAttivita();
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  async getListaPatologie() {
    await this.service.getCallRequest({ action: 'patologie' }).then(data => {
      this.listaPatologie = data;
    });
  }

  async getListaStress() {
    await this.service.getCallRequest({ action: 'stress' }).then(data => {
      this.listaStress = data;
    });
  }
  async getListaTrauma() {
    await this.service.getCallRequest({ action: 'trauma' }).then(data => {
      this.listaTraumi = data;
    });
  }
  async getListaAttivita() {
    await this.service.getCallRequest({ action: 'attivita' }).then(data => {
      this.listaAttivita = data;
    });
  }

  showAttivita = false;
  showStress = false;
  showTrauma = false;

  patologiaSelezionata(evt) {
    if (this.listaPatologie[evt].attivita) {
      this.showAttivita = true;
    }
    if (this.listaPatologie[evt].stress) {
      this.showStress = true;
    }
    if (this.listaPatologie[evt].trauma) {
      this.showTrauma = true;
    }
  }

  changeFinalDate() {
    const start = new Date(this.formPatologia.get("dal").value);
    const end = new Date(start.setDate(start.getDate() + 1));
    this.dataFinale = end;
  }

  async onSubmit(exit) {
    if (this.formPatologia.invalid) {
      this.validateAllFormFields(this.formPatologia);
      return;
    }


    let primaria = this.formPatologia.get('primaria').value;
    let cronica = this.formPatologia.get('cronica').value;

    let obj = new Object();
    obj = {
      Terapia: this.formPatologia.get("terapia").value,
      Dal: this.appGen.convertToLocaleDate(this.formPatologia.get("dal").value),
      Al: this.appGen.convertToLocaleDate(this.formPatologia.get("al").value),
      // Dal: dalTmp == null || dalTmp == ''  ? '': this.appGen.convertUTCDateToLocalDate(dalTmp),
      // Al: alTmp == '' || alTmp == null ? '': this.appGen.convertUTCDateToLocalDate(alTmp),
      IdPatologia: this.formPatologia.get("patologia").value,
      Primaria: this.formPatologia.get("primaria").value,
      Cronica: this.formPatologia.get("cronica").value,
      IdStress: this.formPatologia.get("stress").value,
      IdAttivita: this.formPatologia.get("attivita").value,
      IdTrauma: this.formPatologia.get("trauma").value,
      Id: this.isRiepilogo ? this.idPatologia : 0
    }



    // if (this.isRiepilogo) {

    //   await this.service.putCallRequest('modificapatologia',null,obj).then(() => {
    //     this.backPreviousPage.back()
    //   });
    // } else {

    //   await this.service.postCallRequest('inserimentopatologia',this.idPaziente, obj).then(() => {
    //     if(exit){
    //       this.backPreviousPage.back()
    //     }else{
    //       this.formPatologia.reset()
    //     }
    //   });

    // }
  }

  riepilogoForm(idPatologia) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getPatologia', param: idPatologia }).then(data => {
      this.setValueForm(data).then(async () => {
        this.getListaPatologie()
      });
    });
  }
  async setValueForm(data) {
    this.formPatologia.controls.terapia.setValue(data.terapia)
    this.formPatologia.controls.patologia.setValue(data.idPatologia)
    this.formPatologia.controls.dal.setValue(data.dal)
    this.formPatologia.controls.al.setValue(data.al)
    this.formPatologia.controls.primaria.setValue(data.primaria)
    this.formPatologia.controls.cronica.setValue(data.cronica)
    this.formPatologia.controls.stress.setValue(data.idStress)
    this.formPatologia.controls.attivita.setValue(data.idAttivita)
    this.formPatologia.controls.trauma.setValue(data.idTrauma)
  }
}
