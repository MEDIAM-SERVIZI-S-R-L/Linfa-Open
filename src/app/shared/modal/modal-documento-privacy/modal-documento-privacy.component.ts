import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-modal-documento-privacy',
  templateUrl: './modal-documento-privacy.component.html',
  styleUrls: ['./modal-documento-privacy.component.scss']
})
export class ModalDocumentoPrivacyComponent implements OnInit {
  pdfFile;



  constructor(    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public appGen: AppGeneralService,
     public dialogRef: MatDialogRef<ModalDocumentoPrivacyComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.pdfFile = data
      this.pdfFile


    }

  ngOnInit() {
  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  stampa(){
    this.dialogRef.close(true)
  }

}
