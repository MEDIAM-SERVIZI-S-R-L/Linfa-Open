import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { TipoProdotto } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { Location } from '@angular/common';
import { TipoProdottoLista } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-nuovo',
  templateUrl: './nuovo.component.html',
  styleUrls: ['./nuovo.component.scss']
})
export class NuovoComponent implements OnInit {

  listaTipiProdotto: TipoProdottoLista[];
  idTipologia: number;
  tipologia = TipoProdotto;
  title: string;

  constructor(
    private service: HttpSharedService,
    public authGuard: AuthGuard,
    public appGen: AppGeneralService,
    private backPreviousPage: Location,
    private activateRoute: ActivatedRoute,

  ) { }

  ngOnInit(): void {

    this.activateRoute.queryParams.subscribe((params): void => {
      if (!this.appGen.isNullOrUndefined(params.type)) {

        let obj: { ListIdTipoProdotto?: TipoProdotto[]; };
        switch (params.type) {
          case 'miscele':
            this.title = 'AFMS'
            obj = {
              ListIdTipoProdotto: [
                TipoProdotto.SacchePersonalizzate,
                TipoProdotto.NutrizioneArtificiale,
                TipoProdotto.Integratori,
              ]
            }
            break;
          case 'alimenti':
            this.title = 'Alimento'
            obj = {
              ListIdTipoProdotto: [
                TipoProdotto.Solidi,
                TipoProdotto.Liquidi,
              ]
            }
            break;

          default:
            this.title = 'AFMS/Alimenti'
            obj = {}
            break;
        }
        this.getTipiProdotto(obj)

      }
    });

  }

  setCategoria(val: number): void {

    this.idTipologia = val
  }

  async getTipiProdotto(obj: { ListIdTipoProdotto?: TipoProdotto[]; }): Promise<void> {
    this.service.postCallRequest({ action: 'tipiprodotti', param: obj }).then(data => {
      this.listaTipiProdotto = data
    });
  }

  backToPrevious(): void {
    this.backPreviousPage.back()
  }
}
