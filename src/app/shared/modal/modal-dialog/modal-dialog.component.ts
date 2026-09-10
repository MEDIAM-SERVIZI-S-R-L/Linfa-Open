import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  title: string;
  message: string;

  constructor(public dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogModel) {
    // Update view with given values
    this.title = data.title;
    this.message = data.message;
  }


  ngOnInit() {
  }

}



export class DialogModel {

  constructor(public title: string, public message: string) {
  }
}
