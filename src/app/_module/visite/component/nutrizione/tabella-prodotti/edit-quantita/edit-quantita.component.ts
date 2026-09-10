import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-edit-quantita',
  templateUrl: './edit-quantita.component.html',
  styleUrls: ['./edit-quantita.component.scss']
})
export class EditQuantitaComponent implements OnInit {

  quantita;
  prodotto;
  quantitaUpdated = new EventEmitter();

  constructor(
    private appGen: AppGeneralService,
    private service: HttpSharedService,
    public dialogRef: MatDialogRef<EditQuantitaComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    // Update view with given values

    
    this.quantita = data.prodotto.quantita;
   this.prodotto = data.prodotto.prodotto;
  }
  
  ngOnInit() {
  }

  confirm(){
    this.quantitaUpdated.emit(this.quantita);
    this.dialogRef.close();
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}
