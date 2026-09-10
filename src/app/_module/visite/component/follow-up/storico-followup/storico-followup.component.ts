import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProdottiFollowupComponent } from '../prodotti-followup/prodotti-followup.component';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-storico-followup',
  templateUrl: './storico-followup.component.html',
  styleUrls: ['./storico-followup.component.scss']
})
export class StoricoFollowupComponent implements OnInit {


  storicoDataSource = new MatTableDataSource<any>();
  storicoViewsColumns = ["data", "kcal", "proteine", "azoto", "apportoIdrico", "pesoAttuale", "velocitaSomministrazione", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  formFiltriStorico: FormGroup

  // pageEvent: PageEvent;
  elementiTotali = 0;
  pageSelected = 0;
  queryParams: any = {};
  ricercaParam;
  idPaziente;
  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;


  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private activeroute: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.idPaziente = this.activeroute.snapshot.paramMap.get('id');


    this.formFiltriStorico = this.formBuilder.group({
      dataFollowup: new FormControl(''),
    });

    this.getListaStorico();

  }

  search() {
    this.getListaStorico();
  }

  clearSearch() {
    this.formFiltriStorico.get("dataFollowup").setValue('');
    this.getListaStorico();
  }

  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.getListaStorico(this.pageSelected);
    this.appGen.scroll('table')

  }



  async getListaStorico(page?: Number) {

    let dataVisitaTmp;

    if (this.formFiltriStorico.get("dataFollowup").value != '') {
      dataVisitaTmp = this.formFiltriStorico.get("dataFollowup").value;
    }

    let obj = {
      page: (page === null || page === undefined) ? 0 : page,
      elementForPage: 10,
      DataFollowUp: this.appGen.convertToLocaleDate(dataVisitaTmp),
      IdPaziente: this.idPaziente,
    }

    let res = await this.service.postCallRequest({ action: 'storicofollowup', param: obj });
    if (!this.appGen.isNullOrUndefined(res)) {

      this.storicoDataSource = new MatTableDataSource<any>();
      this.storicoDataSource.data = res.listaStorico;
      this.elementiTotali = res.totalElement;
    }


  }

  async showProdotti(id) {

    let res = await this.service.getCallRequest({ action: 'getprodottifollowup', param: id });
    this.dialog.open(ProdottiFollowupComponent, {
      data: res,
      panelClass: "modal-prodotti-custom"

    });


  }

}
