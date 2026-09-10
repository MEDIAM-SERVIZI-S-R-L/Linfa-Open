import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { Pazienti } from 'src/app/_module/pazienti/_dto-pazienti/dto-pazienti';
import { ModalEditProprietaComponent } from '../modal-edit-proprieta/modal-edit-proprieta.component';

@Component({
  selector: 'app-lista-proprieta',
  templateUrl: './lista-proprieta.component.html',
  styleUrls: ['./lista-proprieta.component.scss']
})
export class ListaProprietaComponent implements OnInit {


  dataSource = new MatTableDataSource<Pazienti>();
  viewsColumns = ["proprieta", "kcal", "quantita", "abilitato", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortDirection = 'asc';
  columnSort = 'date';
  @ViewChild(MatSort) sort: MatSort



  totalElements = 0;
  itemsForPage = 10;
  pageSelected = 0;

  form: FormGroup

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      proprieta: new FormControl(''),
    });
    this.getList()
  }


  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getList(this.pageSelected);
    this.appGen.scroll('table')

  }

  search() {
    this.getList();
  }

  clearSearch() {
    this.form.reset()
    this.getList();
  }

  async getList(page?: number) {
    const params = {
      Page: (page === null || page === undefined) ? 0 : page,
      ElementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort,
      Proprieta: this.form.get('proprieta').value
    }

    const objRequest = {
      action: 'getKcalBaseSacche',
      param: params,
      loadingPanel: false
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
    this.getList();

  }

  edit(item) {
    const dialogRef = this.dialog.open(ModalEditProprietaComponent, {
      data: item,
      panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(async dialogResult => {
      if (dialogResult) {
        this.getList(this.pageSelected)
      }
    })
  }


}

