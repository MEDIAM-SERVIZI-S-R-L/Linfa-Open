import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-modal-edit-proprieta',
  templateUrl: './modal-edit-proprieta.component.html',
  styleUrls: ['./modal-edit-proprieta.component.scss']
})
export class ModalEditProprietaComponent {

  proprieta;
  form: FormGroup;

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public formBuilder: FormBuilder,
    public authGuard: AuthGuard,
    public dialogRef: MatDialogRef<ModalPdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {

    this.proprieta = data;
    this.form = this.formBuilder.group({
      proprieta: new FormControl({ value: data.proprieta, disabled: true }),
      quantita: new FormControl(data.quantita, Validators.required),
      kcal: new FormControl(data.kcal, Validators.required),
      abilitato: new FormControl(data.abilitato),
    })

  }


  onDismiss(): void {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      return;
    }
    const params = {
      Id: this.proprieta.id,
      Quantita: this.form.get('quantita').value,
      Proprieta: this.form.get('proprieta').value,
      Kcal: this.form.get('kcal').value,
      Abilitato: this.form.get('abilitato').value,
    }

    const objRequest = {
      action: 'insertUpdateKcalBaseSacche',
      param: params
    }
    await this.service.postCallRequest(objRequest).then(async () => {
      this.dialogRef.close(true);
    });

  }
}
