import { Component, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-modal-annulla-richiesta',
  templateUrl: './modal-annulla-richiesta.component.html',
  styleUrls: ['./modal-annulla-richiesta.component.scss']
})
export class ModalAnnullaRichiestaComponent {
  title: string;
  message: string;
  listaMotiviCancellazione = [];
  showConfirm = false;
  motivoSelezionato = new EventEmitter();


  constructor(
    private service: HttpSharedService,
    public dialogRef: MatDialogRef<ModalAnnullaRichiestaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
    this.title = data.title;
    this.message = data.message;

    this.getMotiviCancellazione();
  }

  async getMotiviCancellazione() {
    await this.service.getCallRequest({ action: 'motivicancellazione' }).then(data => {
      this.listaMotiviCancellazione = data;
    });
  }

  setMotivoCancellazione(value) {
    this.showConfirm = true;
    this.motivoSelezionato.emit(value);
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}

export class ConfirmDialogModel {
  constructor(public title: string, public message: string) {
  }
}
