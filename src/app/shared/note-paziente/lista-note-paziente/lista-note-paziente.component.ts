import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ModalNotePazienteComponent } from '../modal-note-paziente/modal-note-paziente.component';
import { NotePazienteService } from '../note-paziente.service';

@Component({
  selector: 'app-lista-note-paziente',
  templateUrl: './lista-note-paziente.component.html',
  styleUrls: ['./lista-note-paziente.component.scss']
})
export class ListaNotePazienteComponent implements OnInit {


  @ViewChild(MatSort) sort: MatSort
  storicoDataSource = new MatTableDataSource<any>();
  storicoViewsColumns = ["data", "note", "creato", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  formFiltriStorico: FormGroup

  totalElements = 0;
  itemsForPage = 0;
  pageSelected = 0;
  sortDirection;
  columnSort;
  paziente;
  idPaziente;

  constructor(
    private service: HttpSharedService,
    private noteService: NotePazienteService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private dialog: MatDialog,
    private activateRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.formFiltriStorico = this.formBuilder.group({
      data: new FormControl(''),
    });

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    this.activateRoute.queryParams.subscribe(params => {

      if (!(this.appGen.isNullOrUndefined(params.patient))) {
        this.idPaziente = params.patient;
      }
    });


    if (!this.appGen.isNullOrUndefined(this.idPaziente)) {
      this.getListaStorico();
    }

    this.noteService.change.subscribe(update => {
      if (!this.appGen.isNullOrUndefined(this.idPaziente)) {
        this.getListaStorico();
      }
    });

  }



  search() {
    this.getListaStorico();
  }

  clearSearch() {
    this.formFiltriStorico.get("data").setValue('');
    this.getListaStorico();

  }

  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getListaStorico(this.pageSelected);
    this.appGen.scroll('containerTable')
  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaStorico();
  }

  async getListaStorico(page?: number) {

    const obj = {
      Page: this.appGen.isNullOrUndefined(page) ? 0 : page,
      ElementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      Data: this.formFiltriStorico.get("data").value,//this.appGen.convertToLocaleDate(dataTmp),
      IdPaziente: this.idPaziente,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort
    }



    const res = await this.service.postCallRequest({ action: 'listaNotePaziente', param: obj });
    if (!this.appGen.isNullOrUndefined(res)) {
      this.storicoDataSource = new MatTableDataSource<any>();
      this.storicoDataSource.data = res.lista;
      this.totalElements = res.totalElement;
      this.paziente = res.nome + " " + res.cognome;
    }
  }


  async openDettaglio(idnote) {

    const obj = {
      idNote: idnote
    }

    this.dialog.open(ModalNotePazienteComponent, {
      data: obj,
      panelClass: "modal-lista-documenti"
    });


  }

}
