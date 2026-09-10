import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import * as env from 'src/environments/environment'
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AuthService } from 'src/app/_core/app-auth/service/auth.service';
import { Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { LinfaComponent } from 'src/app/page/linfa/linfa.component';
import { Sort } from '@angular/material/sort';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { log } from 'console';

@Component({
  selector: 'app-lista-utenti',
  templateUrl: './lista-utenti.component.html',
  styleUrls: ['./lista-utenti.component.scss']
})
export class ListaUtentiComponent implements OnInit {

  utentiDataSource: MatTableDataSource<any>;// new MatTableDataSource<Utenti>();
  utentiViewsColumns = ["matricola", "username", "nome", "tipiUtente", "ldap", "utenteRemoto", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(LinfaComponent, { static: true }) linfacomponent: LinfaComponent;


  formFiltriUtenti: FormGroup

  // pageEvent: PageEvent;
  totalElements = 0;
  itemsForPage = 10;
  pageSelected = 0;
  ordineFiltro = "desc";
  nomeColonna = "";
  textSearch = "";

  sortDirection = 'asc';
  columnSort = 'username';

  public nessunUtenteTrovato = false;
  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public appGen: AppGeneralService,
    private authService: AuthService,
    private router: Router,
    public authGuard: AuthGuard,
  ) { }

  ngOnInit() {

    this.formFiltriUtenti = this.formBuilder.group({
      TestoRicerca: new FormControl(''),
    });
    this.getListaUtenti();

  }

  dettaglio(idUtente) {
    this.router.navigate(['app/utenti/dettaglio', idUtente]);

  }


  async getListaUtenti(page?: number) {

    try {
    this.nessunUtenteTrovato = false;
    const params = {
      page: this.appGen.isNullOrUndefined(page) ? 0 : page,
      elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      TestoRicerca: this.formFiltriUtenti.get('TestoRicerca').value,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort
    }

    const objRequest = {
      action: 'listaUtenti',
      param: params
    }
    const res = await this.service.postCallRequest(objRequest);   

    if (res.listaUtenti.length > 0) {

      this.utentiDataSource = new MatTableDataSource<any>();
      this.utentiDataSource.data = res['listaUtenti'];
      this.totalElements = res['totalElement'];
    }
  } catch (error) {
    this.utentiDataSource.data = [];
    this.nessunUtenteTrovato = true;
  }

    
    
  }



  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaUtenti();
  }


  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getListaUtenti(this.pageSelected);
    this.appGen.scroll('table')

  }

  onSearch(evt) {
    if (evt.srcElement.value.length >= env.environment.minCharsForDynSearch) {
      this.textSearch = evt.srcElement.value;
      this.getListaUtenti();

    }
    else {
      this.textSearch = "";
      this.getListaUtenti(this.pageSelected)
    }
  }

  cerca() {

    this.getListaUtenti();
  }

  clearFiltri() {
    this.nessunUtenteTrovato = false;
    this.formFiltriUtenti.get('TestoRicerca').setValue('');
    this.getListaUtenti();
  }

  async impersonifica(idUtente) {
    const message = `Vuoi impersonificare questo utente?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });


    dialogRef.afterClosed().subscribe((async dialogResult => {
      if (dialogResult) {


        //effettuo la login, passo la stringa criptata e la converto a be, verifico se posso accedere e restituisco il token
        const obj = {
          idutente: idUtente
        }
        const token = await this.service.impersonifica(obj)


        //setto il token, se non ho errori mi torna null
        const err = this.authService.externalAccess(token);
        if (err === null) {
          this.appGen.username = this.authGuard.getUserName();

          this.appGen.goToModule();

        }
      }

    }));

  }
}
