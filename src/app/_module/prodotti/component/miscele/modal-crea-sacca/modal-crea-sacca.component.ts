import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { FormSaccaComponent } from 'src/app/_module/prodotti/component/miscele/form-sacca/form-sacca.component';

@Component({
  selector: 'app-modal-crea-sacca',
  templateUrl: './modal-crea-sacca.component.html',
  styleUrls: ['./modal-crea-sacca.component.scss']
})
export class ModalCreaSaccaComponent {

  fromModal = true;
  saccaEsistente: any;
  @ViewChild(FormSaccaComponent, { static: false }) public FormSaccaComponent: FormSaccaComponent;

  constructor(
    private appGen: AppGeneralService,
    public dialogRef: MatDialogRef<ModalCreaSaccaComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {

    if (!this.appGen.isNullOrUndefined(data)) {
      this.saccaEsistente = data
    }

  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.FormSaccaComponent.onSubmit()
  }

  return(val: any): void {
    this.dialogRef.close(val);
  }
}
