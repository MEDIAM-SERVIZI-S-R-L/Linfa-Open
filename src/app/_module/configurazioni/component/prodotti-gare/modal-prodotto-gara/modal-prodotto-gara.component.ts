/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { TipoNutrizioneArtificiale, TipoProdotto } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service';

@Component({
  selector: 'app-modal-prodotto-gara',
  templateUrl: './modal-prodotto-gara.component.html',
  styleUrls: ['./modal-prodotto-gara.component.scss']
})
export class ModalProdottoGaraComponent implements OnInit{


  form: FormGroup;
  dataObj;
  idTipoAlimentazioneArtificiale;
  listaTipoAlimentazioneArtificiale: any = [];
  listaProdotti: any = [];
  mostraSacche = false
  TipoAlimentazioneArtificiale = TipoNutrizioneArtificiale;
  tipoProdotto = TipoProdotto;
  confezionamenti : any = [];


  idTipoProdotto : number;

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public formBuilder: FormBuilder,
    public authGuard: AuthGuard,
    public dialogRef: MatDialogRef<ModalPdfViewerComponent>,
    private confService : ConfezionamentiService,
    @Inject(MAT_DIALOG_DATA) public data) {

    this.dataObj = data;
    this.form = this.formBuilder.group({
      tipoArtificiale: new FormControl('', Validators.required),
      prodotto: new FormControl('', Validators.required),
      abilitato: new FormControl(''),
    })

    this.getTipoAlimentazioneArtificiale();


    if (!data.newVal) {
      this.form.get('tipoArtificiale').setValue(data.item.idArtificiale);
      this.idTipoAlimentazioneArtificiale = data.item.idArtificiale
      this.form.get('tipoArtificiale').disable();
      this.form.get('prodotto').setValue(data.item.idProdotto);
      this.form.get('abilitato').setValue(data.item.abilitato);
      this.selectedTipoAlimentazione(data.item.idArtificiale)
    }
  }


  ngOnInit(): void {
    
    }

  returnFiltered(type) {
    if (type === 0) {
      return this.listaProdotti.filter(i => i.idTipoProdotto != TipoProdotto.Integratori && i.idTipoProdotto != TipoProdotto.SacchePersonalizzate);
    }
    return this.listaProdotti.filter(i => i.idTipoProdotto === type);

  }

  async getTipoAlimentazioneArtificiale() {
    await this.service.getCallRequest({ action: 'getTipoAlimentazioneArtificiale' }).then(data => {
      this.listaTipoAlimentazioneArtificiale = data;
    });
  }

  async selectedTipoAlimentazione(idartificiale) {
    this.idTipoAlimentazioneArtificiale = idartificiale;
    await this.getListaProdotti(idartificiale);
  }


  async getListaProdotti(idartificiale) {

    const obj = {
      IdTipoAlimentazioneArtificiale: idartificiale,
      Integratori: true
    }

    await this.service.postCallRequest({ action: 'listaprodotti', param: obj }).then(data => {
      this.listaProdotti = data;
    });
  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  async onSubmit(close) {
    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      return;
    }

    let params;
    const datiGara = this.dataObj.item;
    if (this.dataObj.newVal) {
      //nuovo inserimento, quindi l'id è riferito all'id della gara
      params = {
        idProdotto: this.form.get('prodotto').value,
        idGara: datiGara.id,
        abilitato: this.form.get('abilitato').value,
      }
    } else {
      //modifica di uno esistente, quindi l'id è quello della tabella di associazione
      params = {
        idProdotto: this.form.get('prodotto').value,
        idGara: datiGara.idGara,
        id: datiGara.id,
        abilitato: this.form.get('abilitato').value,
      }
    }


    const objRequest = {
      action: 'insertUpdateProdottoGara',
      param: params
    }
    await this.service.postCallRequest(objRequest).then(async () => {

      if (close) {
        this.dialogRef.close();
      } else {
        this.form.get('prodotto').reset();
        this.form.get('abilitato').reset();

      }
    });

  }

}