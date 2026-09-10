import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-form-metodo-assunzione',
  templateUrl: './form-metodo-assunzione.component.html',
  styleUrls: ['./form-metodo-assunzione.component.scss']
})
export class FormMetodoAssunzioneComponent implements OnInit {
  form: FormGroup;

  listaMetodiAssunzione
  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public appGen: AppGeneralService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      id: new FormControl(''),
      metodo: new FormControl('', Validators.required),
    })

    this.getMetodoAssunzione()
  }


  async getMetodoAssunzione() {
    await this.service.getCallRequest({ action: 'listaMedotiAssunzioneIntegratori' }).then(data => {
      this.listaMetodiAssunzione = data;
    });
  }

  selectedModalitaPredefinita(id) {
    if (!this.appGen.isNullOrUndefined(id)) {

      const metodo = this.appGen.getElementByFilter(id, this.listaMetodiAssunzione)[0].metodo;
      this.form.get('metodo').setValue(metodo)
    }
  }

  async onSubmit(nuovo) {
    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      return;
    }

    let params;
    if (nuovo) {
      params = {
        Metodo: this.form.get('metodo').value,
      }
    } else {
      params = {
        Id: this.form.get('id').value,
        Metodo: this.form.get('metodo').value,
      }
    }

    const objRequest = {
      action: 'InsertUpdateMetodoAssunzione',
      param: params,
    }
    await this.service.postCallRequest(objRequest).then((data) => {
      this.getMetodoAssunzione()
      if (nuovo) {
        this.form.reset()
      }
    })
  }

  delete() {
    const message = `Sei sicuro di voler eliminare questo metodo di assunzione?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData

    });

    dialogRef.afterClosed().subscribe(async dialogResult => {
      if (dialogResult) {

        const objRequest = {
          action: 'deleteMetodoAssunzione',
          param: this.form.get('id').value,
        }
        await this.service.deleteCallRequest(objRequest).then(() => {
          this.getMetodoAssunzione()
          this.form.reset()
        })
      }
    });

  }
}
