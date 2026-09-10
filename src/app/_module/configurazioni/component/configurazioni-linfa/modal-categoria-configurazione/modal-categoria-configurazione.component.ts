import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ConfigService } from 'src/app/_core/services/config.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { CategoriaConfigurazioneToDTO } from 'src/app/_dtos/out';
import { CategoriaConfigurazione, ConfigurazioneEasy } from 'src/app/_models/configurazione';

@Component({
  selector: 'app-modal-categoria-configurazione',
  templateUrl: './modal-categoria-configurazione.component.html',
  styleUrls: ['./modal-categoria-configurazione.component.scss']
})
export class ModalCategoriaConfigurazioneComponent implements OnInit {

  //Array
  listaConfigurazioniCoinvolte : ConfigurazioneEasy[] = [];
  //String
  Title : string = "Nuova categoria";

  //Form
  formCategoria = this.fb.group({
    descrizione : ['', Validators.required],
    abilitato : [true]
  })

  constructor(
    public dialog: MatDialog,
    private appGen : AppGeneralService,
    public dialogRef: MatDialogRef<ModalCategoriaConfigurazioneComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CategoriaConfigurazione,
    private fb: FormBuilder,
    private configServ: ConfigService,
    private notificate : SnackBarService
  ) { }

  async ngOnInit(){
    await this.fillForm();
    await this.getConfigXCategoria();
  }

  closeDialog(){
    this.dialogRef.close(false);
  }

  async getConfigXCategoria(){
    if (this.data && this.data.id) {
      this.listaConfigurazioniCoinvolte = await firstValueFrom(this.configServ.getConfigurazioniXCategoria(this.data.id));      
    }
  }

  /**
   * Riempie il form in base al dato che arriva
   */
  fillForm(){
    if (!this.appGen.isNullOrUndefined(this.data)) {
      this.formCategoria.controls.descrizione.setValue(this.data.categoriaConfigurazione);
      this.formCategoria.controls.abilitato.setValue(this.data.abilitato);

      //change modal title name
      this.Title = 'Modifica categoria "' + this.data.categoriaConfigurazione + '"';  
    }
  }

  /**
   * Salva la nuova/editata categoria
   */
  async saveCategoria(){
    try {
      if (this.formCategoria.valid) {
        this.appGen.loadingPanel.show();
        
        const categoria: CategoriaConfigurazione = {
          id: this.data? this.data.id : 0,
          categoriaConfigurazione: this.formCategoria.controls.descrizione.value,
          abilitato: this.formCategoria.controls.abilitato.value,
          coreConfigurazioni: null
        } 
    
        const el : CategoriaConfigurazioneToDTO = new CategoriaConfigurazioneToDTO(categoria)
        await firstValueFrom(this.configServ.insertUpdateCategoriaConfigurazione(el));
        this.appGen.loadingPanel.hide();
        this.dialogRef.close(true);
        this.notificate.ok('Categoria ' + el.categoriaConfigurazione + ' inserita correttamente');
      }else{
        this.notificate.error('Impossibile salvare, alcuni campi obbligatori non sono compilati');
        this.appGen.validateAllFormFields(this.formCategoria)
      }
    } catch (error) {
      console.error(error);
      this.appGen.loadingPanel.hide();
      this.notificate,error('È stato riscontrato qualche problema, riprovare')
    }

  }

}
