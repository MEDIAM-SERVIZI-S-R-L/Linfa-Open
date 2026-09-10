import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Pazienti } from 'src/app/_module/pazienti/_dto-pazienti/dto-pazienti';

@Component({
  selector: 'app-lista-log',
  templateUrl: './lista-log.component.html',
  styleUrls: ['./lista-log.component.scss']
})
export class ListaLogComponent implements OnInit {


  dataSource = new MatTableDataSource<Pazienti>();
  viewsColumns = ["date", "logLevel", "utente", "action", "message", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortDirection = 'desc';
  columnSort = 'date';
  @ViewChild(MatSort) sort: MatSort



  totalElements = 0;
  itemsForPage = 10;
  pageSelected = 0;

  formFiltri: FormGroup

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
  ) { }

  ngOnInit() {
    this.formFiltri = this.formBuilder.group({
      data: new FormControl(''),
      logLevel: new FormControl('')
    });

    this.getListaLog()
  }


  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getListaLog(this.pageSelected);
    this.appGen.scroll('table')

  }

  search() {
    this.getListaLog();
  }

  clearSearch() {
    this.formFiltri.reset()
    this.getListaLog();
  }

  async getListaLog(page?: number) {
    const params = {
      page: (page === null || page === undefined) ? 0 : page,
      elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      sort: this.sortDirection,
      columnSort: this.columnSort,
      logLevel: this.formFiltri.get('logLevel').value,
      data: this.appGen.convertToLocaleDate(this.formFiltri.get('data').value)

    }

    const objRequest = {
      action: 'getListLogs',
      param: params
    }

    const res = await this.service.postCallRequest(objRequest);
    this.dataSource = new MatTableDataSource<any>();

    if (!this.appGen.isNullOrUndefined(res)) {

      this.dataSource.data = res['lista'];
      this.totalElements = res['totalElement'];
    }
  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaLog();
  }

  openDetailException(message) {
    this.appGen.openDialog("Exception", message)
  }


}

