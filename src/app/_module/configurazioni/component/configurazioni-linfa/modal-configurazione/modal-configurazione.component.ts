import { Component, Inject, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { ConfigService } from 'src/app/_core/services/config.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { ConfigurazioneToDTO } from 'src/app/_dtos/out'
import { CategoriaConfigurazione, Configurazione } from 'src/app/_models/configurazione'

@Component({
  selector: 'app-modal-configurazione',
  templateUrl: './modal-configurazione.component.html',
  styleUrls: ['./modal-configurazione.component.scss'],
})
export class ModalConfigurazioneComponent implements OnInit {
  proprieta
  form: FormGroup

  categorie: CategoriaConfigurazione[] = []

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public formBuilder: FormBuilder,
    public authGuard: AuthGuard,
    public dialogRef: MatDialogRef<ModalPdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Configurazione,
    private configServ: ConfigService
  ) {
    this.form = this.formBuilder.group({
      descrizione: new FormControl('', Validators.required),
      proprieta: new FormControl('', Validators.required),
      valore: new FormControl('', Validators.required),
      abilitato: new FormControl(''),
      categoria: new FormControl(''),
    })

    if (!this.appGen.isNullOrUndefined(data)) {
      this.proprieta = data
      this.form.get('descrizione').setValue(data.descrizione)
      this.form.get('proprieta').setValue(data.proprieta)
      // this.form.get('proprieta').disable();
      this.form.get('valore').setValue(data.valore)
      this.form.get('abilitato').setValue(data.abilitato)
      this.form.get('categoria').setValue(data.idcategoriaConfig)
    }
  }

  ngOnInit(): void {
    this.getCategorie()
  }

  onDismiss(): void {
    this.dialogRef.close()
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form)
      return
    }

    const obj: Configurazione = {
      id: this.data?.id? this.data.id : 0,
      descrizione: this.form.get('descrizione').value,
      proprieta: this.form.get('proprieta').value,
      valore: this.form.get('valore').value,
      abilitato: this.form.get('abilitato').value,
      idcategoriaConfig: this.form.get('categoria').value,
    }

    const payload: ConfigurazioneToDTO = new ConfigurazioneToDTO(obj)
    this.appGen.configurazioniObj = await firstValueFrom(this.configServ.insertUpdateConfigurazione(payload));
    this.dialogRef.close(true)
  }

  // async getConfigurazioniLinfa() {
  //   await this.service
  //     .getCallRequest({ action: 'getConfigurazioniLinfa' })
  //     .then((data) => {
  //       this.appGen.configurazioniObj = data
  //       this.appGen.setConfigLinfa()
  //     })
  // }

  async getCategorie() {
    this.categorie = await firstValueFrom(this.configServ.getCategorieConfigurazioni());
  }
}
