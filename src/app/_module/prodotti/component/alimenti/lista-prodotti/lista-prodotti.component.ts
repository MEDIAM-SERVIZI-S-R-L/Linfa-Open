import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalInfoProdottiComponent } from 'src/app/shared/modal/modal-info-prodotti/modal-info-prodotti.component';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { Sort } from '@angular/material/sort';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { Prodotti } from 'src/app/_module/prodotti/_dto-prodotti/dto-prodotti';
import { TipoProdottoLista, CategoriaAlimentare } from 'src/app/_dtos/models_old';
import { TipoProdotto } from 'src/app/_core/helpers/enums';

@Component({
  selector: 'app-lista-prodotti',
  templateUrl: './lista-prodotti.component.html',
  styleUrls: ['./lista-prodotti.component.scss']
})
export class ListaProdottiComponent implements OnInit {

  formFiltri: FormGroup;
  queryParams: any = {};
  showCategoriaAlimentare = false;
  // Dropdowns
  listaTipiProdotto: TipoProdottoLista[];
  listaCategorieAlimentari: CategoriaAlimentare[];

  prodottiDataSource = new MatTableDataSource<Prodotti>();
  prodottiViewsColumns = [
    "codice",
    "prodotto",
    "tipo",
    "categoria",
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
    private dialog: MatDialog,
    public authGuard: AuthGuard,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    this.formFiltri = this.formBuilder.group({
      Prodotto: new FormControl(''),
      TipiProdotto: new FormControl(''),
      CategorieAlimentari: new FormControl(''),
    });

    const obj = {
      ListIdTipoProdotto: [
        TipoProdotto.Solidi,
        TipoProdotto.Liquidi,
      ]
    }
    this.listaTipiProdotto = await this.service.postCallRequest({ action: 'tipiprodotti', param: obj });
    this.getListaProdotti();

    const retrievedObject = sessionStorage.getItem('ricercaParamProdotti');
    if (!this.appGen.isNullOrUndefined(retrievedObject)) {
      const ricercaParam = JSON.parse(retrievedObject);

      this.setValSearch(ricercaParam);
      this.pageSelected = ricercaParam.page;
      this.getListaProdotti(ricercaParam.page).then(() => {
        sessionStorage.removeItem('ricercaParamProdotti');

      });
    }
  }

  get formFiltriControls() { return this.formFiltri.controls }

  async getListaProdotti(page?: number): Promise<void> {

    const params = {

      Page: (page === null || page === undefined) ? 0 : page,
      ElementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      IdCategoriaAlimentare: this.formFiltri.get('CategorieAlimentari').value,
      IdTipoProdotto: this.formFiltri.get('TipiProdotto').value,
      Prodotto: this.formFiltri.get('Prodotto').value,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort,
      ListIdTipoProdotto: [
        TipoProdotto.Solidi,
        TipoProdotto.Liquidi,
      ]
    };

    const objRequest = {
      action: 'listaprodotti',
      param: params
    }
    const res = await this.service.postCallRequest(objRequest);
    this.prodottiDataSource = new MatTableDataSource<any>();
    if (!this.appGen.isNullOrUndefined(res)) {

      this.prodottiDataSource.data = res['listaProdotti'];
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
    this.getListaProdotti();
  }

  clearSearch(): void {
    this.formFiltri.reset();

    this.showCategoriaAlimentare = false;
    this.getListaProdotti();
  }

  nuovo(): void {
    this.router.navigate(['/app/prodotti/tipologia'], { queryParams: { type: 'alimenti' } });
  }


  tipoProdotto(evt: { value: number; }): void {
    switch (evt.value) {
      case TipoProdotto.Solidi:
        this.showCategoriaAlimentare = true;
        this.getCategorieAlimentari(evt.value)

        break;
      case TipoProdotto.Liquidi:
        this.showCategoriaAlimentare = true;
        this.formFiltri.get("CategorieAlimentari").reset()
        evt.value
        this.getCategorieAlimentari(evt.value)
        break;

      default:
        this.showCategoriaAlimentare = false;
        this.formFiltri.get("CategorieAlimentari").reset()

        break;
    }

  }

  async getCategorieAlimentari(tipologia: number): Promise<void> {
    const objRequest = {
      action: 'categoriealimentari',
      param: tipologia,
      loadingPanel: false
    }
    this.service.getCallRequest(objRequest).then((data): any => this.listaCategorieAlimentari = data);
  }

  async deleteProdotto(prodotto: { prodotto: string; id: number; }) {
    const message = `Sei sicuro di voler eliminare: <strong>` + prodotto.prodotto + `?</strong>`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"
    });


    dialogRef.afterClosed().subscribe(((dialogResult: any): void => {
      if (dialogResult) {
        const objRequest = {
          action: 'deleteProdotto',
          param: prodotto.id
        };
        this.service.putCallRequest(objRequest).then((): void => {
          this.getListaProdotti();
        });
      }
    }));
  }

  getInfoProdotto(prodotto: any): void {
    this.dialog.open(ModalInfoProdottiComponent, {
      data: prodotto,
      panelClass: "modal-info-prodotti"

    });
  }



  dettaglio(prodotto: { id: number; }): void {
    this.createParams(prodotto.id)
    sessionStorage.setItem('ricercaParamProdotti', JSON.stringify(this.queryParams));

    this.router.navigate(['/app/prodotti/dettaglio/prodotto', prodotto.id], { queryParams: { type: 'alimenti' } });
  }
  createParams(id: number): void {
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
    if (!this.appGen.isNullOrUndefined(this.formFiltri.get("CategorieAlimentari").value)) {
      this.queryParams.CategorieAlimentari = this.formFiltri.get("CategorieAlimentari").value;
    }

    this.queryParams.showCategoriaAlimentare = this.showCategoriaAlimentare;

  }

  setValSearch(paramsRicerca: { Prodotto: any; TipiProdotto: number; CategorieAlimentari: number; showCategoriaAlimentare: boolean; }): void {

    if (!this.appGen.isNullOrUndefined(paramsRicerca.Prodotto)) {
      this.formFiltri.get("Prodotto").setValue(paramsRicerca.Prodotto);
    }

    if (!this.appGen.isNullOrUndefined(paramsRicerca.TipiProdotto)) {
      this.formFiltri.get("TipiProdotto").setValue(paramsRicerca.TipiProdotto);
    }

    if (!this.appGen.isNullOrUndefined(paramsRicerca.CategorieAlimentari)) {
      this.formFiltri.get("CategorieAlimentari").setValue(paramsRicerca.CategorieAlimentari);
    }

    this.showCategoriaAlimentare = paramsRicerca.showCategoriaAlimentare;
  }
}
