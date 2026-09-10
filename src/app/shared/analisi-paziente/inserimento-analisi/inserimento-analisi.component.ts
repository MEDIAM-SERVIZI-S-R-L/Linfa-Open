import { Component, Inject, OnInit, Optional } from '@angular/core'
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatTableDataSource } from '@angular/material/table'
import { firstValueFrom } from 'rxjs'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { AnalisiToDTO } from 'src/app/_dtos/out'
import { CategoriaAnalisi, IAnalisiFormToRaw, ProprietaAnalisi } from 'src/app/_models/paziente'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import { forEach } from 'underscore'
import Swal from "sweetalert2";
import { TipoValoreAnalisi } from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
@Component({
  selector: 'app-inserimento-analisi',
  templateUrl: './inserimento-analisi.component.html',
  styleUrls: ['./inserimento-analisi.component.scss'],
})
export class InserimentoAnalisiComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'valore']
  categorie: any
  dataSourceAnalisi = new MatTableDataSource<ProprietaAnalisi>()
  minDate: any
  maxDate: any
TipoCampo = TipoValoreAnalisi
  formAnalisi: FormGroup
  constructor(
    private fb: FormBuilder,
     public pazienteHttp: PazienteService,
     private notificate: SnackBarService,
     @Optional() @Inject(MAT_DIALOG_DATA) public data,
     public dialogRef: MatDialogRef<InserimentoAnalisiComponent>,
     public appGen: AppGeneralService,
     ) {

    this.formAnalisi = this.fb.group({
      idAnalisi: [data && data.idAnalisi?data.idPaziente:null],
      idPaziente:[(data && data.idPaziente?data.idPaziente:null)],
      dataAnalisi: [null, [Validators.required]],
      descrizione: [null,[Validators.required]],

      listaProprieta:this.fb.array([])

    })
  }

  async ngOnInit() {
    // prendo le tutte propieta per tutti tipi di analisi
    this.creaFormProprietaAnalisi(await firstValueFrom(this.pazienteHttp.getProprietaAnalisi()));

  }




  get getListaProprieta(): FormArray {

    return this.formAnalisi.get('listaProprieta') as FormArray;

  }

  creaFormProprietaAnalisi(_listaPropieta:ProprietaAnalisi[]){

    const arrayTable = this.formAnalisi.get('listaProprieta') as FormArray;
    _listaPropieta.forEach(element => {
      arrayTable.push(this.fb.group({
        id: new FormControl(element.idProprieta.toString()),
        nome: new FormControl(element.descrizione.toString()),
        valore: new FormControl(null),
        unitaMisura: new FormControl(element.unitaMisura),
        tipoCampo: new FormControl(element.tipoCampo)
      }))

    })

    this.dataSourceAnalisi.data = _listaPropieta

  }



 async saveAnalisi() {
    try {
      if(this.formAnalisi.invalid)
      {

       this.appGen.validateAllFormFields(this.formAnalisi);
 return;
      }
      else if(!this.formAnalisi.dirty)
      {
   // verifico se nel form è stato cambiato qualcosa
   Swal.fire({
    icon: "info",
    title: "Non è stato modificato niente",

  });
      }else{
  // form valido proseguo

  const rawFormData: IAnalisiFormToRaw= this.formAnalisi.getRawValue();

  let campiCompilati = 0;

  for (const proprieta of rawFormData.listaProprieta) {
    if (!this.appGen.isNullOrUndefined(proprieta.valore)) {
      campiCompilati ++;
    }
  }
  
  if (campiCompilati > 0) {
    await firstValueFrom(this.pazienteHttp.saveAnalisiPaziente(new AnalisiToDTO(rawFormData)))
    this.notificate.ok("La nuova analisi è stata inserita")
    this.dialogRef.close(true);
  } else {
    Swal.fire({
      title: 'Impossibile salvare le analisi',
      text: 'Non è stato inserito alcun dato nelle proprietà',
      icon: 'warning',
      iconColor: '#d33',
    })
  }

  }



   } catch (error) {
console.error(error)
this.notificate.error("Errore nel salvataggio Analisi")
    }


    }





}
