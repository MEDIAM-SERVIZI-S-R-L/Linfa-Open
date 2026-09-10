import { Component, Inject, OnInit, Optional } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'
import { TipoValoreAnalisi } from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { ProprietaAnalisiToDTO } from 'src/app/_dtos/out'
import { CategoriaAnalisi, ProprietaAnalisi } from 'src/app/_models/paziente'
import { AnalisiService } from 'src/app/_repositories/analisi.service'
import _ from 'underscore'

@Component({
  selector: 'app-modal-proprieta',
  templateUrl: './modal-proprieta.component.html',
  styleUrls: ['./modal-proprieta.component.scss'],
})
export class ModalProprietaComponent implements OnInit {
  proprietaForm = this.fb.group({
    descrizione: ['', Validators.required],
    tipoCampo: [undefined, Validators.required],
    unitaMisura: [undefined, Validators.required],
    categoria: [undefined, Validators.required],
  })

  tipoCampo = TipoValoreAnalisi;

  categorie: CategoriaAnalisi[]

  constructor(
    private analisiService: AnalisiService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ModalProprietaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ProprietaAnalisi,
    public appGen: AppGeneralService,
    private notificate: SnackBarService
  ) {}

  ngOnInit(): void {
    this.getCategorieEsami();
    }


  async getCategorieEsami() {
    this.appGen.loadingPanel.show();
    this.categorie = await firstValueFrom(this.analisiService.getCategoriaEsami());
    this.riempimentoCampi();
    this.appGen.loadingPanel.hide();
  }


  ///IN CASO DI EDIT I CAMPI VENGONO PRECOMPILATI CON QUELLI DEL DATO IN ENTRATA
  riempimentoCampi() {
    try {
      if (this.data) {
        this.proprietaForm.controls.descrizione.setValue(this.data.descrizione)
        this.proprietaForm.controls.tipoCampo.setValue(this.data.tipoCampo)
        this.proprietaForm.controls.unitaMisura.setValue(this.data.unitaMisura)
        this.proprietaForm.controls.categoria.setValue(this.data.idCategorieAnalisi)
        //this.proprietaForm.controls.categoria.disable();

        if (this.data.tipoCampo !== this.tipoCampo.Number) {
          this.proprietaForm.controls.unitaMisura.disable();
        }
      }
    } catch (error) {
      this.notificate.error('È stato notificato un errore, riprovare')
    }

  }


  ///SALVA LA PROPRIETA
  async saveProprieta() {
    try {
      const element: ProprietaAnalisi = {
        idProprieta: this.data ? this.data.idProprieta : 0,
        descrizione: this.proprietaForm.controls.descrizione.value,
        idCategorieAnalisi: this.proprietaForm.controls.categoria.value,
        tipoCampo: this.proprietaForm.controls.tipoCampo.value,
        unitaMisura: this.proprietaForm.controls.unitaMisura.value,
      }
  
      const nuovaProprieta = new ProprietaAnalisiToDTO(element)
      nuovaProprieta.RecordEliminato = false;
      await firstValueFrom(this.analisiService.manageXValoriEsame(nuovaProprieta));    
      this.dialogRef.close(true);
    } catch (error) {
      this.notificate.error('È stato notificato un errore, riprovare')
    }
  }


  cambiaUnitaMisura(selectedTipo: any){
    if (selectedTipo.value === this.tipoCampo.Boolean) {
      this.proprietaForm.controls.unitaMisura.setValue('Presente');
      this.proprietaForm.controls.unitaMisura.disable();
      
    } else if(selectedTipo.value === this.tipoCampo.String){
      this.proprietaForm.controls.unitaMisura.setValue('');
      this.proprietaForm.controls.unitaMisura.disable();

    } else if(selectedTipo.value === this.tipoCampo.Number){
      this.proprietaForm.controls.unitaMisura.setValue('');
      this.proprietaForm.controls.unitaMisura.enable();
    }
  }


  /// 'X' PER CHIUDERE LA DIALOG
  closeDialog() {
    this.dialog.closeAll();
  }
}
