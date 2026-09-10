import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Pazienti } from '../../_dto-pazienti/dto-pazienti';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { environment } from 'src/environments/environment.test';
import { ListaDocumentiComponent, ListaDocumentiDialogModel } from 'src/app/shared/lista-documenti/lista-documenti.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { Comune, Provincia, Regione } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-lista-pazienti',
  templateUrl: './lista-pazienti.component.html',
  styleUrls: ['./lista-pazienti.component.scss']
})
export class ListaPazientiComponent implements OnInit {

  pazientiDataSource = new MatTableDataSource<Pazienti>();
  pazientiViewsColumns = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortDirection = 'asc';
  columnSort = 'paziente';
  @ViewChild(MatSort) sort: MatSort


  formFiltriPazienti: FormGroup

  // pageEvent: PageEvent;
  elementiTotali = 0;
  itemsForPage = 10;
  pageSelected = 0;
  queryParams: any = {};
  listaProvince: Provincia[];
  listaComuni: Comune[];
  listaRegioni: Regione[];
  ricercaParam: any;

  isFromDashboard = false;

  constructor(
    private service: HttpSharedService,
    private report: ReportService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) platformId: string
  ) {

    // domain and port for SSR in this example is static. Use i.e. environment files to use appropriate dev/prod domain:port
    const domain = (isPlatformServer(platformId)) ? environment.Url : '';

    this.matIconRegistry.addSvgIcon(
      "male",
      this.domSanitizer.bypassSecurityTrustResourceUrl(domain + "assets/icons/gender-male.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "female",
      this.domSanitizer.bypassSecurityTrustResourceUrl(domain + "assets/icons/gender-female.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "other",
      this.domSanitizer.bypassSecurityTrustResourceUrl(domain + "assets/icons/gender-other.svg")
    );


    if (this.appGen.configLinfa.PrivacyAbilitata) {
      this.pazientiViewsColumns = ["paziente", "cf", "dataUltimaVisita", "privacy", "pulsanti"]

    } else {
      this.pazientiViewsColumns = ["paziente", "cf", "dataUltimaVisita", "pulsanti"]
    }

  }

  ngOnInit(): void {
    this.formFiltriPazienti = this.formBuilder.group({
      regione: new FormControl(''),
      comune: new FormControl(''),
      provincia: new FormControl(''),
      cf: new FormControl(''),
      cognome: new FormControl(''),
      nome: new FormControl(''),
      dataNascita: new FormControl(''),
    });


    this.activateRoute.queryParams.subscribe((params): void => {
      //controllo i parametri, se ho l'id query allora provengo dalla dashboard e mi prendo solo i pazienti segnalati lì
      if (!(this.appGen.isNullOrUndefined(params.query))) {
        this.isFromDashboard = true;
        this.getListaPazienti(null, params.query);
      } else {

        //Altrimenti controllo se ho in sessione dei parametri
        const retrievedObjectFromPaziente = sessionStorage.getItem('ricercaParamPaziente');
        if (!this.appGen.isNullOrUndefined(retrievedObjectFromPaziente)) {
          this.ricercaParam = JSON.parse(retrievedObjectFromPaziente);
        }
        if (!this.appGen.isNullOrUndefined(this.ricercaParam)) {
          this.setValSearch(this.ricercaParam);
          this.pageSelected = this.ricercaParam.page;
          this.getListaPazienti(this.ricercaParam.page);
        } else {
          //Non ho parametri nemmeno in sessione, mi prendo tutti gli utenti
          this.getListaPazienti();

        }

      }

    });



  }


  ngAfterViewInit(): void {
    sessionStorage.removeItem('idPazienteParam');
    sessionStorage.removeItem('ricercaParamPaziente');
  }


  search(): void {
    this.getListaPazienti();
  }

  clearSearch(): void {
    this.formFiltriPazienti.reset();
    this.getListaPazienti();

  }

  onChangePage(evt: { pageIndex: number; pageSize: number; }): void {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getListaPazienti(this.pageSelected);
    this.appGen.scroll('table')

  }


  async getRegioni(): Promise<void> {
    await this.service.getCallRequest({ action: 'regioni' }).then((data): void => {
      this.listaRegioni = data;
    });
  }

  async getProvince(regioneSelezionata: number): Promise<void> {
    const objRequest = {
      action: 'provincia',
      param: regioneSelezionata,
    }
    await this.service.getCallRequest(objRequest).then((data): void => {
      this.listaProvince = data;
    });
  }
  async getComuni(provinciaSelezionata: number): Promise<void> {
    const objRequest = {
      action: 'comune',
      param: provinciaSelezionata,
    }
    await this.service.getCallRequest(objRequest).then((data): void => {
      this.listaComuni = data;
    });
  }

  async getListaPazienti(page?: number, query?: number): Promise<void> {


    const params = {
      page: (page === null || page === undefined) ? 0 : page,
      elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      Nome: this.formFiltriPazienti.get("nome").value,
      Cognome: this.formFiltriPazienti.get("cognome").value,
      Cf: this.formFiltriPazienti.get("cf").value,
      DataNascita: this.appGen.convertToLocaleDate(this.formFiltriPazienti.get("dataNascita").value),
      Query: query,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort
    }

    const objRequest = {
      action: 'listapazienti',
      param: params,
    }
    const res = await this.service.postCallRequest(objRequest);
    this.pazientiDataSource = new MatTableDataSource<Pazienti>();
    if (!this.appGen.isNullOrUndefined(res)) {
      this.pazientiDataSource.data = res['listaPazienti'];
      this.elementiTotali = res['totalElement'];
    } else {
      this.elementiTotali = 0;
    }

  }

  sortData(sort: Sort): void {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListaPazienti();
  }

  async getCredenzialiStampa(idPaziente: string): Promise<void> {
    const objRequest = {
      action: 'GetDatiCredenziali',
      param: idPaziente,
    }
    await this.service.getCallRequest(objRequest).then((data): void => {
      this.report.createCredenzialiPaziente(data);
    });
  }

  storicoVisite(idPaziente: string): void {
    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['app/visite/storico', idPaziente]);
  }
  notePaziente(idPaziente: string): void {
    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['app/pazienti/dettaglio/note', idPaziente]);
  }

  pianiNutrizionali(idPaziente: string): void {
    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['app/visite/piani-nutrizionali/lista', idPaziente]);
  }

  dettaglioPaziente(idPaziente: string): void {
    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['app/pazienti/dettaglio/paziente', idPaziente]);
  }

  dettaglioCaregivers(idPaziente: string): void {
    this.createParams(idPaziente)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['app/pazienti/dettaglio/caregivers', idPaziente]);
  }

  goToFollowUp(idPaziente: string, idVisita: string): void {
    this.createParams(idPaziente, idVisita)
    sessionStorage.setItem('ricercaParamPaziente', JSON.stringify(this.queryParams));
    this.router.navigate(['/app/visite/followup', idPaziente], { queryParams: { visit: idVisita } })
  }

  createParams(pazienteId: string, idVisita?: string): void {
    this.queryParams.page = this.pageSelected;

    if (!(pazienteId === null || pazienteId === undefined)) {
      this.queryParams.idPaziente = pazienteId;
    }
    if (!(idVisita === null || idVisita === undefined)) {
      this.queryParams.idVisita = idVisita;
    }
    const dataNascitaTmp = this.formFiltriPazienti.get("dataNascita").value;

    if (this.formFiltriPazienti.get("nome").value != '') {
      this.queryParams.nome = this.formFiltriPazienti.get("nome").value;
    }

    if (this.formFiltriPazienti.get("cognome").value != '') {
      this.queryParams.cognome = this.formFiltriPazienti.get("cognome").value;
    }

    if (this.formFiltriPazienti.get("cf").value != '') {
      this.queryParams.cf = this.formFiltriPazienti.get("cf").value;
    }

    this.queryParams.sortDirection = this.sortDirection;
    this.queryParams.columnSort = this.columnSort;

    if (dataNascitaTmp != '') {
      this.queryParams.dataNascita = this.appGen.convertToLocaleDate(dataNascitaTmp)
    }
  }

  setValSearch(paramsRicerca: { [x: string]: string; dataNascita: string; cf: string; cognome: string; nome: string; }): void {
    if (!(paramsRicerca['dataNascita'] == null || paramsRicerca['dataNascita'] == undefined || paramsRicerca['dataNascita'] == '')) {

      const date = new Date(paramsRicerca.dataNascita);
      this.formFiltriPazienti.get("dataNascita").setValue(date);
    }
    if (!(paramsRicerca['cf'] == null || paramsRicerca['cf'] == undefined || paramsRicerca['cf'] == '')) {
      this.formFiltriPazienti.get("cf").setValue(paramsRicerca.cf);
    }
    if (!(paramsRicerca['cognome'] == null || paramsRicerca['cognome'] == undefined || paramsRicerca['cognome'] == '')) {
      this.formFiltriPazienti.get("cognome").setValue(paramsRicerca.cognome);
    }
    if (!(paramsRicerca['nome'] == null || paramsRicerca['nome'] == undefined || paramsRicerca['nome'] == '')) {
      this.formFiltriPazienti.get("nome").setValue(paramsRicerca.nome);
    }
    if (!(paramsRicerca['columnSort'] == null || paramsRicerca['columnSort'] == undefined || paramsRicerca['columnSort'] == '')) {
      this.columnSort = paramsRicerca['columnSort'];
    }
    if (!(paramsRicerca['sortDirection'] == null || paramsRicerca['sortDirection'] == undefined || paramsRicerca['sortDirection'] == '')) {
      this.sortDirection = paramsRicerca['sortDirection'];
    }

  }

  async openDocumentList(id: string, nome: string, cognome: string): Promise<void> {

    const obj = {
      idPaziente: id
    }
    nome = this.appGen.transform(nome)
    cognome = this.appGen.transform(cognome)

    const dialogData = new ListaDocumentiDialogModel("Archivio documenti di " + nome + " " + cognome, obj);

    this.dialog.open(ListaDocumentiComponent, {
      data: dialogData,

      panelClass: "modal-lista-documenti"
    });


  }

}
