import { Component, Inject, OnInit } from '@angular/core'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'
import { TipoProdotto } from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { IDettaglioConfezionamenti } from 'src/app/_models/confezionamenti'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import _ from 'underscore'

@Component({
  selector: 'app-modal-info-prodotti',
  templateUrl: './modal-info-prodotti.component.html',
  styleUrls: ['./modal-info-prodotti.component.scss'],
})
export class ModalInfoProdottiComponent {
  prodotto
  imageBase64: string

  IdTipiProdotto = TipoProdotto;

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public confService: ConfezionamentiService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {

    if (data && _.isObject(data.prodotto)) {

      this.prodotto = data.prodotto
      this.getImage()
      if (this.prodotto.idTipoProdotto === this.IdTipiProdotto.NutrizioneArtificiale) {
      this.getConfezionamenti(this.prodotto.id)
      }
    } else if (data) {

      this.prodotto = data
      this.getImage()
      if (this.prodotto.idTipoProdotto === this.IdTipiProdotto.NutrizioneArtificiale) {
      this.getConfezionamenti(this.prodotto.id);
      }
    }
  }

  getImage() {

    let idProdotto = this.prodotto.id

    if (this.appGen.isNullOrUndefined(this.prodotto.id)) {
      idProdotto = this.prodotto.idProdotto
    }

    this.service.getImage(idProdotto).subscribe((picture) => {
      this.imageBase64 = picture
    })
  }

  async getConfezionamenti(idProdotto: number){
    
    const obj : IDettaglioConfezionamenti = {
      IdProdotto: idProdotto,
      IdGara: 0
    }
    this.prodotto.listaConfezionamenti = [];
    this.prodotto.listaConfezionamenti = await firstValueFrom(this.confService.getConfezioniXProdottoDisponibili(obj));    
  }
}
