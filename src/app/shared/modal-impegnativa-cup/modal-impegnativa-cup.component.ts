import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { IModelImpegnativaCupModel } from 'src/app/_models/paziente';
import { PazienteService } from 'src/app/_repositories/paziente_repo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-impegnativa-cup',
  templateUrl: './modal-impegnativa-cup.component.html',
  styleUrls: ['./modal-impegnativa-cup.component.scss']
})
export class ModalImpegnativaCupComponent implements OnInit {

  //Control
  numeroImpegnativaCup : FormControl = new FormControl('');

  constructor(
    public appGen : AppGeneralService,
    public dialogRef: MatDialogRef<ModalImpegnativaCupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IModelImpegnativaCupModel,
    private pazienteServ : PazienteService
  ) { }

  ngOnInit(): void {
    this.fillForm();
  }

  fillForm(){
    if (!this.appGen.isNullOrUndefined(this.data)) {
      this.numeroImpegnativaCup.setValue(this.data.NumeroImpegnativa);
    }
  }

  
  ///X IN ALTO A DESTRA PER CHIUDERE LA MODALE
  closeDialog() {
      this.dialogRef.close(true)
  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  async onSubmit(){
    try {
      const newImpegnativa : IModelImpegnativaCupModel = {
        idVisita: this.data.idVisita,
        NumeroImpegnativa: this.numeroImpegnativaCup.value
      }
      await firstValueFrom(this.pazienteServ.setNumeroImpegnativa(newImpegnativa));
      this.dialogRef.close(true);  
    } catch (error) {
      console.error(error);
    }
  }

}
