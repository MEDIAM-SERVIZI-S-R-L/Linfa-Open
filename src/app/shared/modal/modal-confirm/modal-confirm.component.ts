import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent implements OnInit {
  title: string;
  message: string;

  constructor(public dialogRef: MatDialogRef<ModalConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
    // Update view with given values
    this.title = data.title;
    this.message = data.message;
  }


  ngOnInit() {
  }


  onDismiss(): void {
    this.dialogRef.close();
  }
  confirm(): void {
    this.dialogRef.close(true);
  }
}


export class ConfirmDialogModel {

  constructor(public title: string, public message: string) {
  }
}
