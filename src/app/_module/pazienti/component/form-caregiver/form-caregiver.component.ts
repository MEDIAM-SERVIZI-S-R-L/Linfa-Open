import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { GradoParentela } from 'src/app/_dtos/models_old';


@Component({
  selector: 'app-form-caregiver',
  templateUrl: './form-caregiver.component.html',
  styleUrls: ['./form-caregiver.component.scss']
})
export class FormCaregiverComponent implements OnInit {

  formCaregiver: FormGroup;
  listaGradiParentela: GradoParentela[];
  idPaziente: string;
  isRiepilogo = false;
  isDettaglio = false;
  queryParams: any = {};
  idCaregiver: string;

  constructor(private formBuilder: FormBuilder,
    private service: HttpSharedService,
    private activateRoute: ActivatedRoute,
    private backPreviousPage: Location,
    public appGen: AppGeneralService,
    private notificate: SnackBarService
  ) { }


  async ngOnInit(): Promise<void> {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    this.idCaregiver = this.activateRoute.snapshot.paramMap.get('idcaregiver');


    this.formCaregiver = this.formBuilder.group({
      Nome: new FormControl('', Validators.required),
      Cognome: new FormControl('', Validators.required),
      CF: new FormControl('', Validators.pattern('^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$')),
      Email: new FormControl(),
      Sesso: new FormControl(),
      Telefono: new FormControl('', Validators.required),
      GradoParentela: new FormControl(),
      NoteDisponibilita: new FormControl()
    });


    await this.service.getCallRequest({ action: 'gradiparentela', param: false }).then(data => this.listaGradiParentela = data);

    if (!(this.appGen.isNullOrUndefined(this.idCaregiver))) {
      this.isDettaglio = true;
      this.getCaregiverDetail(this.idCaregiver);
    }
  }

  get formCaregiverControls() { return this.formCaregiver.controls }

  backToPrevious(): void {
    this.backPreviousPage.back()
  }

  setValueForm(data: { nome: string; cognome: string; cf: string; email: string; sesso: string; telefono: string; idGradoParentela: number; noteDisponibilita: string; }): void {
    this.formCaregiver.get('Nome').setValue(data.nome)
    this.formCaregiver.get('Cognome').setValue(data.cognome)
    this.formCaregiver.get('CF').setValue(data.cf)
    this.formCaregiver.get('Email').setValue(data.email)
    this.formCaregiver.get('Sesso').setValue(data.sesso)
    this.formCaregiver.get('Telefono').setValue(data.telefono)
    this.formCaregiver.get('GradoParentela').setValue(data.idGradoParentela)
    this.formCaregiver.get('NoteDisponibilita').setValue(data.noteDisponibilita)
  }

  async getCaregiverDetail(idcaregiver: string): Promise<void> {
    const objRequest = {
      action: 'caregiver',
      param: idcaregiver,
    }
    await this.service.getCallRequest(objRequest).then((data): void => {
      this.setValueForm(data);
    });
  }

  async onSubmit(): Promise<void> {

    const caregiver = {
      Nome: this.formCaregiver.get('Nome').value,
      Cognome: this.formCaregiver.get('Cognome').value,
      Cf: this.formCaregiver.get('CF').value,
      Sesso: this.formCaregiver.get('Sesso').value,
      NoteDisponibilita: this.formCaregiver.get('NoteDisponibilita').value,
      IdGradoParentela: this.formCaregiver.get('GradoParentela').value,
      Telefono: this.formCaregiver.get('Telefono').value,
      Email: this.formCaregiver.get('Email').value,
    }

    // let count = 0;
    // for (const prop in caregiver) {
    //   if (!this.appGen.isNullOrUndefined(caregiver[prop])) {
    //     count++
    //   }
    // }

    if (!this.formCaregiver.valid) {
      this.notificate.error("É necessario compilare i campi obbligatori")
      return;
    }

    const params = {
      Caregiver: caregiver,
      IdPaziente: this.idPaziente,
      IdCaregiver: this.appGen.isNullOrUndefined(this.idCaregiver) ? null : this.idCaregiver
    };

    const objRequest = {
      action: 'InsertUpdateCaregiver',
      param: params,
    }
    await this.service.postCallRequest(objRequest);
    this.backPreviousPage.back()

  }
  isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}
