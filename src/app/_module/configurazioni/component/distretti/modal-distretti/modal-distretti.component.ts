import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { Ruoli } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { DatMediciDistrettoToDTO, DistrettoToDTO, IDistrettoToDTO } from 'src/app/_dtos/out';
import { DatMediciDistretti, Distretto, IDistretto, MedicoXDistretto } from 'src/app/_models/configurazione';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import Swal from 'sweetalert2';
import _ from 'underscore';

@Component({
  selector: 'app-modal-distretti',
  templateUrl: './modal-distretti.component.html',
  styleUrls: ['./modal-distretti.component.scss']
})
export class ModalDistrettiComponent implements OnInit, AfterViewInit{

  formDistretto = this.fb.group({
    descrizione: ['', Validators.required],
    approvazione: [false]
  })

  distretto! : DistrettoToDTO;
  listaMedici : MedicoXDistretto[] = [];
  backupListaMedici : MedicoXDistretto[] = [];
  tipoUtente = Ruoli;

  allMediciSelected = false;

  title = 'Nuvo distretto';

  listaMediciDataSource = new MatTableDataSource();
  displayedColumns: string[] = ['medico', 'associato'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filtroMedici : FormControl = new FormControl('');
  protected _onDestroy = new Subject<void>()

  constructor(
    private repoServ: DistrettiService,
    public dialogRef: MatDialogRef<ModalDistrettiComponent>,
    private notificate: SnackBarService,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Distretto,
    public dialog: MatDialog,
    private appGen : AppGeneralService
    ) {}


  ngOnInit(): void {
    this.riempimentoForm();   
    this.setFiltroMedico(); 
  }

  ngAfterViewInit(): void {
    this.listaMediciDataSource.paginator = this.paginator;
  }


  ///NEL CASO VENGA PREMUTO EDIT NL COMPONENTE PRINCIPALE, LA SEGUENTE FUNZIONE PROVVEDE A INSERIRE I DATI NELLA MODALE
  riempimentoForm(){
    try {
      if (this.data) {
        this.formDistretto.controls.descrizione.setValue(this.data.descrizione);
        this.formDistretto.controls.approvazione.setValue(this.data.approvazioneAutomatica as boolean);
        this.title = 'Modifica ' + this.data.descrizione;
        this.listaMedici = this.data.arrayMedici;
        this.backupListaMedici = this.listaMedici;
        this.listaMediciDataSource.data = this.listaMedici;
      }
    } catch (error) {
      this.notificate.error("È stato riscontrato qualche problema, riprovare")
    }

  }


  ///PREMENDO SAVE SI VA AD AGGIUNGERE O MODIFICARE UN DISTRETTO ALLA LISTA
  async saveDistretto(event: any){
    try {
      if (this.formDistretto.valid) {
        const item: Distretto = {
          id : this.data? this.data.id : undefined,
          descrizione: this.formDistretto.controls.descrizione.value as string,
          recordEliminato : false,
          approvazioneAutomatica: this.formDistretto.controls.approvazione.value as boolean,
        }
        this.distretto = new DistrettoToDTO(item);
        await firstValueFrom(this.repoServ.addDistretto(this.distretto));  
        this.dialogRef.close(true);
        this.notificate.ok('Distretto ' + '"' + this.distretto.Descr + '"' + ' salvato correttamente')  
      } else if(!this.formDistretto.valid){
        this.notificate.error("Impossibile salvare, alcuni campi non sono compilati");
      }
      
    } catch (error) {
       this.notificate.error("È stato riscontrato qualche problema, riprovare")
    }
  }

  async statusCheck(event: any, element: MedicoXDistretto){
    try {
      element.associatoDistretto = event.checked;
    if (this.data && this.data.id && this.listaMedici.length > 0) {
        const item : DatMediciDistretti = {
          idUtente : element.idMedico,
          idDistretto : this.data.id,
          associato : element.associatoDistretto
      }
      const obj : DatMediciDistrettoToDTO = new DatMediciDistrettoToDTO(item);
      await firstValueFrom(this.repoServ.manageMediciDistretti([obj]));
    }
    } catch (error) {
      console.error(error);
      this.notificate.error("Non e stato possibile effetuare l'associazione tra medico e distretto, riprovare")
    }
    
  }

  setFiltroMedico(){
    this.filtroMedici.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtraMedici(this.filtroMedici.value)
      })
  }

  filtraMedici(medicoCercato : string){
    if (medicoCercato.length >= 2) {
      this.listaMedici = _.filter(this.listaMedici, function(medico){return medico.medico.toLowerCase().includes(medicoCercato)})
      this.listaMediciDataSource.data = this.listaMedici;
    }else{
      this.listaMedici = this.backupListaMedici;
      this.listaMediciDataSource.data = this.listaMedici;
    }
  }

  ///X IN ALTO A DESTRA PER CHIUDERE LA MODALE
  closeDialog() {
    if(!this.formDistretto.controls.descrizione.dirty){
      this.dialogRef.close(true)
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
          this.dialogRef.close(true);
        }
      });
    }
  }

}
