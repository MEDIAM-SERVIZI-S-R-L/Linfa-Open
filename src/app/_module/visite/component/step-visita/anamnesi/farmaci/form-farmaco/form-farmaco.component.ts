import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatSelect } from '@angular/material/select';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { take } from 'underscore';

@Component({
  selector: 'app-form-farmaco',
  templateUrl: './form-farmaco.component.html',
  styleUrls: ['./form-farmaco.component.scss']
})
export class FormFarmacoComponent implements OnInit {



  @ViewChild(MatSelect, { static: true }) farmacoSelect: MatSelect;

  formFarmaco: FormGroup;
  idPaziente;
  listaPatologie;
  isRiepilogo = false;
  idfarmaco;
  dataFinale;
  listaMisura;
  public farmaciFiltrati: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filtroFarmaci: FormControl = new FormControl();
  protected _onDestroy = new Subject<void>();

  constructor(private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'terapie');


    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');


    this.idfarmaco = this.activateRoute.snapshot.paramMap.get('id');
    if (!(this.idfarmaco == null || this.idfarmaco == undefined || this.idfarmaco <= '')) {
      this.riepilogoForm();

    }


    this.formFarmaco = this.formBuilder.group({
      farmaco: new FormControl('', Validators.required),
      posologia: new FormControl(''),
      dal: new FormControl(''),
      al: new FormControl(''),

    });


    this.getlistaMisura();
  }

  ngOnDestroy() {
    this._onDestroy.next(null);
    this._onDestroy.complete();
  }


  async getlistaMisura() {
    await this.service.getCallRequest({ action: 'unitamisura' }).then(data => {
      this.listaMisura = data;
    });
  }

  async onSubmit(exit) {
    if (this.formFarmaco.invalid) {
      this.appGen.validateAllFormFields(this.formFarmaco);
      return;
    }


    const farmaco = {
      Farmaco: this.formFarmaco.get("farmaco").value,
      Posologia: this.formFarmaco.get("posologia").value,
      Dal: this.formFarmaco.get("dal").value,
      Al: this.formFarmaco.get("al").value,
      Id: this.appGen.isNullOrUndefined(this.idfarmaco) ? 0 : this.idfarmaco
    }
    const obj = {
      Farmaco: farmaco,
      IdPaziente: this.idPaziente
    }


    await this.service.postCallRequest({ action: 'insertUpdateFarmaco', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back();
      } else {
        this.formFarmaco.reset();
      }
    });


  }

  changeFinalDate() {
    const start = new Date(this.formFarmaco.get("dal").value);
    const end = new Date(start.setDate(start.getDate() + 1));
    this.formFarmaco.get('al').setValue(end);
  }

  riepilogoForm() {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getFarmaco', param: this.idfarmaco }).then(data => {
      this.setValueForm(data)
    });
  }
  async setValueForm(data) {
    this.formFarmaco.controls.farmaco.setValue(data.farmaco)
    this.formFarmaco.controls.dal.setValue(data.dal)
    this.formFarmaco.controls.al.setValue(data.al)
    this.formFarmaco.controls.posologia.setValue(data.posologia)
  }


  clearDateAl(event) {
    event.stopPropagation();
    this.formFarmaco.controls.al.reset();
  }
  clearDateDal(event) {
    event.stopPropagation();
    this.formFarmaco.controls.dal.reset();
  }
}
