import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { IRepartoToDTO, RepartoToDTO } from 'src/app/_dtos/out';
import { IOspedale, IReparto } from 'src/app/_models/configurazione';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import Swal from 'sweetalert2';
import { ModalOspedaliComponent } from '../../ospedali/modal-ospedali/modal-ospedali.component';

@Component({
  selector: 'app-modal-reparti',
  templateUrl: './modal-reparti.component.html',
  styleUrls: ['./modal-reparti.component.scss']
})
export class ModalRepartiComponent implements OnInit {


  formReparto = this.fb.group({
    descrizione: ['', Validators.required],
    centroCosto: ['', Validators.required]
  })

  listaOspedali : IOspedale[] = [];

  reparto!: IRepartoToDTO;

  title = 'Nuovo reparto';


  constructor(private repoService: DistrettiService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalOspedaliComponent>,
    private notificate: SnackBarService,
    public appGen: AppGeneralService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IReparto,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getOspedali();
    this.riempimentoForm();
  }

  async getOspedali(){
    this.listaOspedali = await firstValueFrom(this.repoService.getListaOspedali());
  }

  riempimentoForm(){
    try {
      if (this.data.id) {
        this.formReparto.controls.descrizione.setValue(this.data.descrizione);
        this.formReparto.controls.centroCosto.setValue(!this.appGen.isNullOrUndefined(this.data.centroCosto)? this.data.centroCosto : '')

        this.title = 'Modifica ' + this.data.descrizione
      }
    } catch (error) {
      this.notificate.error("È stato riscontrato qualche problema, riprovare");
    }

  }


  async saveReparto(event: any){    
    try {
      if (this.formReparto.valid) {
        const item :IReparto = {
          id: this.data? this.data.id: undefined,
          descrizione: this.formReparto.controls.descrizione.value as string,
          idOspedale:  this.data.idOspedale,
          recordEliminato: false,
          centroCosto : this.formReparto.controls.centroCosto.value as string,
        }
        this.reparto = new RepartoToDTO(item);
        await firstValueFrom(this.repoService.addReparto(this.reparto));
  
        this.dialogRef.close(true);
  
        if (this.data.id) {
          this.notificate.ok('Reparto modificato correttamente');
        } else {
          this.notificate.ok('Nuovo reparto salvato correttamente');
        }
      } else if(!this.formReparto.valid){
        this.notificate.error("Impossibile salvare, alcuni campi non sono compilati");
      }

    } catch (error) {
      this.notificate.error("È stato riscontrato qualche problema, riprovare");
    }
  }


  closeDialog() {
    if(!this.formReparto.controls.descrizione.dirty){
      this.dialog.closeAll();
    } else {
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
