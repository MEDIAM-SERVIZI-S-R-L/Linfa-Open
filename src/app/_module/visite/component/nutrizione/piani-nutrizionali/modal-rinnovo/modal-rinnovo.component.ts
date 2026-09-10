import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-modal-rinnovo',
  templateUrl: './modal-rinnovo.component.html',
  styleUrls: ['./modal-rinnovo.component.scss']
})
export class ModalRinnovoComponent {

  dataPiano;
  validitaPiano;
  dataInizio;
  dataFine;
  constructor(
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    public dialogRef: MatDialogRef<ModalRinnovoComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    // Update view with given values

    this.dataPiano = data;

  }

  async confirm() {
    let obj = {
      giorniRinnovo: this.validitaPiano,
      idPianoNutrizionale: this.dataPiano.id
    }

    await this.service.postCallRequest({ action: 'rinnovaPianoNutrizionale', param: obj }).then(() => {
      this.dialogRef.close(true);
    });
  }


  onDismiss(): void {
    this.dialogRef.close();
  }
}
