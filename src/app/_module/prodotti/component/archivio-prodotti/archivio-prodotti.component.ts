import { Component, OnInit } from '@angular/core'
import { Prodotti } from '../../_dto-prodotti/dto-prodotti'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute } from '@angular/router'
import { TipoProdotto } from 'src/app/_core/helpers/enums'

import { firstValueFrom } from 'rxjs'
import { ProdottiService } from 'src/app/_repositories/prodotti_repo.service'
import { IFiltroTipoProdottiToDTO } from 'src/app/_dtos/out'

@Component({
  selector: 'app-archivio-prodotti',
  templateUrl: './archivio-prodotti.component.html',
  styleUrls: ['./archivio-prodotti.component.scss'],
})
export class ArchivioProdottiComponent implements OnInit {
  prodottiDataSource = new MatTableDataSource<Prodotti>()
  tipo: string = null;
   tipoProdotti: TipoProdotto[];
  constructor(private activatedRoute: ActivatedRoute, private prodottiHttp: ProdottiService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((item) => {
      if (item.hasOwnProperty('tipo')) {
        this.tipo = item.tipo
        this.getTipoProdotti()
      }
    })

  }

  /**
   *  prendo la lista dei tipi di prodotti e poi prendo la lista default dei prodotti
   */
  async getTipoProdotti() {
    let getProdottiType:TipoProdotto[] |null= null;

    if (this.tipo == 'miscele') {
      getProdottiType = [
        TipoProdotto.SacchePersonalizzate,
        TipoProdotto.NutrizioneArtificiale,
        TipoProdotto.Integratori,
      ]

    } else if (this.tipo == 'alimenti') {
      getProdottiType = [TipoProdotto.Solidi, TipoProdotto.Liquidi]
    }

    const _filtroProdotti: IFiltroTipoProdottiToDTO ={
      ListIdTipoProdotto:getProdottiType
    }

    this.tipoProdotti = await firstValueFrom(this.prodottiHttp.getTipoProdotti(_filtroProdotti))


  }
}
