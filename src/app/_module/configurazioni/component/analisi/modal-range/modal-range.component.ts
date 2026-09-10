import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { DettaglioRangeToDTO } from 'src/app/_dtos/out';
import { unitaMisura } from 'src/app/_models/confezionamenti';
import { DettaglioRange } from 'src/app/_models/paziente';
import { AnalisiService } from 'src/app/_repositories/analisi.service';
import _ from 'underscore';

@Component({
  selector: 'app-modal-range',
  templateUrl: './modal-range.component.html',
  styleUrls: ['./modal-range.component.scss']
})
export class ModalRangeComponent implements OnInit {

  rangeForm = this.fb.group({
    descrizione: ['', Validators.required],
    valoreMin: [0, Validators.required],
    valoreMax: [0, Validators.required],
    etaMin: [0, Validators.required],
    etaMax: [100, Validators.required],
    gender: ['', Validators.required],
  });

  arrayUnitaMisura: unitaMisura[] = [];
  uMisura?: unitaMisura;
  range!: DettaglioRangeToDTO;

  title = 'Nuovo range'
  deleteButton = false;

  constructor(
    private analisiService: AnalisiService,
    private fb: FormBuilder,
    public dialog: MatDialog,    
    public dialogRef: MatDialogRef<ModalRangeComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DettaglioRange,
    public appGen: AppGeneralService,
    private notificate: SnackBarService
  ) { }



  ngOnInit(): void {    
  this.getDatasFromTable();    
  }


  /// IN CASO DI EDIT VENGONO COMPILATI I CAMPI CON IL DATO IN ENTRATA
  async getDatasFromTable() {
    try {
      this.appGen.loadingPanel.show();
      if (this.data.id) {
        this.rangeForm.controls.descrizione.setValue(this.data.descrizione as string);
        this.rangeForm.controls.valoreMin.setValue(this.data.min as number);
        this.rangeForm.controls.valoreMax.setValue(this.data.max as number);
        this.rangeForm.controls.etaMin.setValue(this.data.etaMin as number);
        this.rangeForm.controls.etaMax.setValue(this.data.etaMax as number);
        this.rangeForm.controls.gender.setValue(this.data.sesso as string);
        this.title = 'Modifica range';
        // eslint-disable-next-line no-constant-condition
        if ((this.data.recordEliminato = true)) {
          this.deleteButton = true;
        }
      }
      this.appGen.loadingPanel.hide();
    } catch (error) {
      this.notificate.error('È stato notificato un errore, riprovare')
    }
  
  }


  /// SALVAIL RANGE
  async saveRange() {
    try {
      const valoriDelForm = _.values(this.rangeForm.getRawValue());

      // eslint-disable-next-line prefer-const
      let arrayDeiValori = [];
      for (let i = 0; i < valoriDelForm.length; i++) {
        const element = valoriDelForm[i];
        arrayDeiValori.push(element);
      }
        const item: DettaglioRange = {
          id: (this.data.id ? this.data.id : undefined),
          descrizione: this.rangeForm.controls.descrizione.value as string,
          idValoriEsami: this.data.idValoriEsami,
          min: this.rangeForm.controls.valoreMin.value as unknown as number,
          max: this.rangeForm.controls.valoreMax.value as unknown as number,
          etaMin: this.rangeForm.controls.etaMin.value as unknown as number,
          etaMax: this.rangeForm.controls.etaMax.value as unknown as number,
          sesso: this.rangeForm.controls.gender.value as string,
          unitaMisura: null,
          recordEliminato: false,
        };
        this.range = new DettaglioRangeToDTO(item);


      await firstValueFrom(this.analisiService.manageRangeXValoreEsame(this.range));
      this.dialogRef.close(true);
    } catch (error) {
      console.error(error);
    }
  }

  /// 'X' PER CHIUDERE LA MODALE
  closeDialog() {
    this.dialog.closeAll();
  }

}
