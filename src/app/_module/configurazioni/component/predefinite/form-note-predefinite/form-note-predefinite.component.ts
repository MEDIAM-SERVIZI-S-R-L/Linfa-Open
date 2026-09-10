import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-form-note-predefinite',
  templateUrl: './form-note-predefinite.component.html',
  styleUrls: ['./form-note-predefinite.component.scss']
})
export class FormNotePredefiniteComponent implements OnInit {
  formNote: FormGroup;

  listaNotePredefinite
  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public appGen: AppGeneralService) { }

  ngOnInit() {
    this.formNote = this.formBuilder.group({
      id: new FormControl(''),
      conclusione: new FormControl('', Validators.required),
    })

    this.getListNotePredefinite()
  }


  async getListNotePredefinite() {
    await this.service.getCallRequest({ action: 'getListConclusioniPredefinite', param: 'note' }).then(data => {
      this.listaNotePredefinite = data;
    });
  }

  selectedConclusionePredefinita(id) {
    if (!this.appGen.isNullOrUndefined(id)) {

      const conclusione = this.appGen.getElementByFilter(id, this.listaNotePredefinite)[0].conclusione;
      this.formNote.get('conclusione').setValue(conclusione)
    }
  }

  async onSubmit(nuovaConclusione) {
    if (this.formNote.invalid) {
      this.appGen.validateAllFormFields(this.formNote);
      return;
    }

    let params;
    if (nuovaConclusione) {
      params = {
        Conclusione: this.formNote.get('conclusione').value,
        Tipo: 'note',
      }
    } else {
      params = {
        Id: this.formNote.get('id').value,
        Conclusione: this.formNote.get('conclusione').value,
      }
    }


    const objRequest = {
      action: 'InsertUpdateConclusionePredefinita',
      param: params,
    }
    await this.service.postCallRequest(objRequest).then(data => {
      this.getListNotePredefinite()
      this.formNote.reset()

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
          action: 'deleteNotePredefinite',
          param: this.formNote.get('id').value,
        }
        await this.service.deleteCallRequest(objRequest).then(() => {
          this.getListNotePredefinite()
          this.formNote.reset();


        })
      }
    });

  }
}
