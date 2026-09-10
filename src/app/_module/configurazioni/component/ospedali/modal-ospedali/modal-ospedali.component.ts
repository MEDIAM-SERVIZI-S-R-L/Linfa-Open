import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { IOspedaleToDTO, OspedaleToDTO } from 'src/app/_dtos/out';
import { IOspedale } from 'src/app/_models/configurazione';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-ospedali',
  templateUrl: './modal-ospedali.component.html',
  styleUrls: ['./modal-ospedali.component.scss']
})
export class ModalOspedaliComponent implements OnInit {


  formOspedale = this.fb.group({
    descrizione: ['', Validators.required],
    cod:['', Validators.required]
  })

  ospedale!: IOspedaleToDTO;

  title = 'Nuvo ospedale';

  constructor(private repoService: DistrettiService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalOspedaliComponent>,
    private notificate: SnackBarService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IOspedale,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.riempimentoForm();
  }


  riempimentoForm(){
    try {
      if(this.data){
        this.formOspedale.controls.descrizione.setValue(this.data.descrizione);
        this.formOspedale.controls.cod.setValue(this.data.cod);

        this.title = 'Modifica ' + this.data.descrizione;
      }
    } catch (error) {
      this.notificate.error("È stato riscontrato qualche problema, riprovare");
    }

  }


  async saveOspedale(event: any){
    try {
      if (this.formOspedale.valid) {
        const item: IOspedale = {
          id: this.data? this.data.id: undefined,
          descrizione: this.formOspedale.controls.descrizione.value as string,
          cod: this.formOspedale.controls.cod.value as string,
          idStruttura: undefined, //// <- DA CAMBIARE
          recordEliminato: false
        }
        this.ospedale = new OspedaleToDTO(item);
        await firstValueFrom(this.repoService.addOspedale(this.ospedale));
        this.dialogRef.close(true);
  
        this.notificate.ok('Ospedale ' + '"' + this.ospedale.Descr + '"' + ' salvato correttamente');
      } else if(!this.formOspedale.valid){
        this.notificate.error("Impossibile salvare, alcuni campi non sono compilati");      }
      
    } catch(error){
      this.notificate.error("È stato riscontrato qualche problema, riprovare");

    }
  }


  closeDialog() {
    if(!this.formOspedale.controls.descrizione.dirty){
      this.dialog.closeAll();
    }else{
      Swal.fire({
        title: 'Sei sicuro?',
        text: 'I dati non salvati rimarranno tali',
        icon: 'warning',
        iconColor: '#d33',
        showCancelButton: true,
        confirmButtonColor: '#00afa6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sì, voglio uscire senza salvare!',
        cancelButtonText: 'No, annulla',
      }).then((result) => {
        if (result.isConfirmed) {
          this.dialog.closeAll();
        }
      });
    }

  }


}
