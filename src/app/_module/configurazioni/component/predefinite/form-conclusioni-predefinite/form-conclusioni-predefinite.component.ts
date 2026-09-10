import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { id } from 'date-fns/locale';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-form-conclusioni-predefinite',
  templateUrl: './form-conclusioni-predefinite.component.html',
  styleUrls: ['./form-conclusioni-predefinite.component.scss']
})
export class FormConclusioniPredefiniteComponent implements OnInit {
  formConclusioni: FormGroup;

  listaConclusioniPredefinite
  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public appGen: AppGeneralService) { }

  ngOnInit() {
    this.formConclusioni = this.formBuilder.group({
      id: new FormControl(''),
      conclusione: new FormControl('', Validators.required),
    })

    this.getListConclusioniPredefinite()
  }


  async getListConclusioniPredefinite() {
    await this.service.getCallRequest({ action: 'getListConclusioniPredefinite', param: 'conclusioni' }).then(data => {
      this.listaConclusioniPredefinite = data;
    });
  }

  selectedConclusionePredefinita(id) {
    if (!this.appGen.isNullOrUndefined(id)) {

      const conclusione = this.appGen.getElementByFilter(id, this.listaConclusioniPredefinite)[0].conclusione;
      this.formConclusioni.get('conclusione').setValue(conclusione)
    }
  }

  async onSubmit(nuovaConclusione) {
    if (this.formConclusioni.invalid) {
      this.appGen.validateAllFormFields(this.formConclusioni);
      return;
    }

    let params;
    if (nuovaConclusione) {
      params = {
        Conclusione: this.formConclusioni.get('conclusione').value,
        Tipo: 'conclusioni',
      }
    } else {
      params = {
        Id: this.formConclusioni.get('id').value,
        Conclusione: this.formConclusioni.get('conclusione').value,
      }
    }


    const objRequest = {
      action: 'InsertUpdateConclusionePredefinita',
      param: params,
    }
    await this.service.postCallRequest(objRequest).then(data => {
      this.getListConclusioniPredefinite()
      this.formConclusioni.reset()

    })
  }

  delete() {
    const message = `Sei sicuro di voler eliminare questa conclusione predefinita?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData

    });

    dialogRef.afterClosed().subscribe(async dialogResult => {
      if (dialogResult) {


        const objRequest = {
          action: 'deleteConclusioniPredefinite',
          param: this.formConclusioni.get('id').value,
        }
        await this.service.deleteCallRequest(objRequest).then(() => {
          this.getListConclusioniPredefinite()
          this.formConclusioni.reset();


        })
      }
    });

  }
}
