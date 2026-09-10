import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { ModalInfoProdottiComponent } from 'src/app/shared/modal/modal-info-prodotti/modal-info-prodotti.component';
import { TipoProdotto } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ModalInfoMiscelaComponent } from 'src/app/_module/prodotti/component/miscele/modal-info-miscela/modal-info-miscela.component';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { TipoAlimentazioneArtificialeLista, TipoProdottoLista } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-lista-miscele',
  templateUrl: './lista-miscele.component.html',
  styleUrls: ['./lista-miscele.component.scss']
})
export class ListaMisceleComponent implements OnInit {
  formFiltri: FormGroup;
  queryParams: any = {};

  // Dropdowns
  listaTipiProdotto: TipoProdottoLista[];
  listaTipoAlimentazioneArtificiale: TipoAlimentazioneArtificialeLista[];

  showTipoAlimentazione = false;
  dataSource = new MatTableDataSource<any>();
  viewsColumns = [
    "prodotto",
    "tipo",
    "artificiale",
    "pulsanti",
  ]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  pageEvent: PageEvent;
  elementiTotali = 0;
  pageSelected = 0;
  itemsForPage = 10;
  sortDirection = 'asc';
  columnSort = 'prodotto';

  constructor(private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public authGuard: AuthGuard,
    private dialog: MatDialog,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    this.formFiltri = this.formBuilder.group({
      Prodotto: new FormControl(''),
      TipiProdotto: new FormControl(''),
      TipoAlimentazioneArtificiale: new FormControl(''),
    });

    const obj = {
      ListIdTipoProdotto: [
        TipoProdotto.SacchePersonalizzate,
        TipoProdotto.NutrizioneArtificiale,
        TipoProdotto.Integratori,
      ]
    }

    this.listaTipiProdotto = await this.service.postCallRequest({ action: 'tipiprodotti', param: obj });

    const retrievedObject = sessionStorage.getItem('ricercaParamProdotti');
    if (!this.appGen.isNullOrUndefined(retrievedObject)) {
      const ricercaParam = JSON.parse(retrievedObject);

      this.setValSearch(ricercaParam);
      this.pageSelected = ricercaParam.page;
      this.getListaProdotti(ricercaParam.page).then(() => {
        sessionStorage.removeItem('ricercaParamProdotti');

      });
    } else {


      this.getListaProdotti();

    }
  }

  get formFiltriControls() { return this.formFiltri.controls }

  async getListaProdotti(page?: number): Promise<void> {

    const params = {

      Page: (page === null || page === undefined) ? 0 : page,
      ElementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      IdArtificiale: this.formFiltri.get('TipoAlimentazioneArtificiale').value,
      IdTipoProdotto: this.formFiltri.get('TipiProdotto').value,
      Prodotto: this.formFiltri.get('Prodotto').value,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort,
      ListIdTipoProdotto: [
        TipoProdotto.SacchePersonalizzate,
        TipoProdotto.NutrizioneArtificiale,
        TipoProdotto.Integratori,
      ]
    };

    const objRequest = {
      action: 'listaprodotti',
      param: params
    }
    const res = await this.service.postCallRequest(objRequest);
    this.dataSource = new MatTableDataSource<any>();
    if (!this.appGen.isNullOrUndefined(res)) {

      this.dataSource.data = res['listaProdotti'];
      this.elementiTotali = res['totalElement'];
    }
  }

  sortData(sort: Sort): void {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaProdotti();
  }

  onChangePage(evt: { pageSize: number; pageIndex: number; }): void {

    this.itemsForPage = evt.pageSize;
    this.pageSelected = evt.pageIndex;
    this.getListaProdotti(this.pageSelected);
    this.appGen.scroll('table')

  }

  search(): void {
   this.pageSelected=0 // reseto la paginazione
    this.getListaProdotti();
  }

  clearSearch(): void {
    this.formFiltri.reset();

    this.showTipoAlimentazione = false;
    this.getListaProdotti();
  }

  nuovo(): void {
    this.router.navigate(['/app/prodotti/tipologia'], { queryParams: { type: 'miscele' } })
  }

  async getTipoAlimentazioneArtificiale(): Promise<void> {
    await this.service.getCallRequest({ action: 'getTipoAlimentazioneArtificiale' }).then(data => {
      this.listaTipoAlimentazioneArtificiale = data;
    });
  }


  tipoProdotto(evt: { value: TipoProdotto; }): void {

    if (evt.value == TipoProdotto.NutrizioneArtificiale) {
      this.showTipoAlimentazione = true;

      this.getTipoAlimentazioneArtificiale();

    } else {
      this.showTipoAlimentazione = false;
      this.formFiltri.get("TipoAlimentazioneArtificiale").reset()
    }


  }


  async delete(prodotto: { prodotto: string; id: any; }) {
    const message = `Sei sicuro di voler eliminare: <strong>` + prodotto.prodotto + `?</strong>`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"
    });


    dialogRef.afterClosed().subscribe((dialogResult => {
      if (dialogResult) {
        const objRequest = {
          action: 'deleteProdotto',
          param: prodotto.id
        };
        this.service.putCallRequest(objRequest).then(() => {
          this.getListaProdotti();
        });
      }
    }));
  }

  async getInfo(prodotto: { idTipoProdotto: TipoProdotto; id: any; }): Promise<void> {
    if (prodotto.idTipoProdotto == TipoProdotto.SacchePersonalizzate) {

      const objRequest = {
        action: 'getprodotto',
        param: prodotto.id
      }
      const miscela = await this.service.getCallRequest(objRequest)


      this.dialog.open(ModalInfoMiscelaComponent, {
        data: miscela,
        panelClass: "modal-info-prodotti"

      });
    } else {
      this.dialog.open(ModalInfoProdottiComponent, {
        data: prodotto,
        panelClass: "modal-info-prodotti"

      });
    }


  }



  dettaglio(prodotto: { id: any; idTipoProdotto: TipoProdotto; }): void {
    this.createParams(prodotto.id)

    sessionStorage.setItem('ricercaParamProdotti', JSON.stringify(this.queryParams));

    if (prodotto.idTipoProdotto == TipoProdotto.SacchePersonalizzate) {
      this.router.navigate(['/app/prodotti/dettaglio/sacca', prodotto.id], { queryParams: { type: 'miscele' } });
    } else {
      this.router.navigate(['/app/prodotti/dettaglio/prodotto', prodotto.id], { queryParams: { type: 'miscele' } });
    }




  }
  createParams(id: any): void {
    this.queryParams.page = this.pageSelected;

    if (!(id === null || id === undefined)) {
      this.queryParams.id = id;
    }

    if (!this.appGen.isNullOrUndefined(this.formFiltri.get("Prodotto").value)) {
      this.queryParams.Prodotto = this.formFiltri.get("Prodotto").value;
    }
    if (!this.appGen.isNullOrUndefined(this.formFiltri.get("TipiProdotto").value)) {
      this.queryParams.TipiProdotto = this.formFiltri.get("TipiProdotto").value;
    }

    if (!this.appGen.isNullOrUndefined(this.formFiltri.get("TipoAlimentazioneArtificiale").value)) {
      this.queryParams.TipoAlimentazioneArtificiale = this.formFiltri.get("TipoAlimentazioneArtificiale").value;
    }

    this.queryParams.showTipoAlimentazione = this.showTipoAlimentazione;

  }

  setValSearch(paramsRicerca: { Prodotto: any; TipiProdotto: any; TipoAlimentazioneArtificiale: any; showTipoAlimentazione: boolean; }): void {

    if (!this.appGen.isNullOrUndefined(paramsRicerca.Prodotto)) {
      this.formFiltri.get("Prodotto").setValue(paramsRicerca.Prodotto);
    }

    if (!this.appGen.isNullOrUndefined(paramsRicerca.TipiProdotto)) {
      this.formFiltri.get("TipiProdotto").setValue(paramsRicerca.TipiProdotto);
    }


    if (!this.appGen.isNullOrUndefined(paramsRicerca.TipoAlimentazioneArtificiale)) {
      this.formFiltri.get("TipoAlimentazioneArtificiale").setValue(paramsRicerca.TipoAlimentazioneArtificiale);
    }



    this.showTipoAlimentazione = paramsRicerca.showTipoAlimentazione;


  }
}
