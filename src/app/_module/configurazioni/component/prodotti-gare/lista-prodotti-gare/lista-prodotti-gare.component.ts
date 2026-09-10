import { AfterViewInit, Component, OnInit, Optional, ViewChild, Inject, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { Pazienti } from 'src/app/_module/pazienti/_dto-pazienti/dto-pazienti';
import { ModalProdottoGaraComponent } from '../modal-prodotto-gara/modal-prodotto-gara.component';
import { FiltroGaraToDTO } from 'src/app/_dtos/out';
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service';
import { firstValueFrom } from 'rxjs';
import { ModalConfezionamentoGaraComponent } from '../modal-confezionamento-gara/modal-confezionamento-gara.component';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-prodotti-gare',
  templateUrl: './lista-prodotti-gare.component.html',
  styleUrls: ['./lista-prodotti-gare.component.scss']
})
export class ListaProdottiGareComponent implements OnInit{

  dataSource = new MatTableDataSource<Pazienti>();
  viewsColumns = ["prodotto", "gara", "abilitato", "pulsanti"]

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginatorConfezionamenti: MatPaginator;

  
 //@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


  sortDirection = 'desc';
  columnSort = 'date';
  @ViewChild(MatSort) sort: MatSort

  listaGare: any = [];
  listaTipoAlimentazioneArtificiale: any = [];

  totalElements = 0;
  itemsForPage = 10;
  pageSelected = 0;

  totalElementsConfezionamenti = 0;
  itemsForPageConfezionamenti = 10;
  pageSelectedConfezionamenti = 0;

  gara;



  dataSourceConfezionamenti = new MatTableDataSource<any>();

  displayedColumns: string[] = [
    'prodotto',
    'artificiale',
    'confezionamenti',
    'buttons'
   ];

   listaConfezioniAssociate = [];

  formFiltri: FormGroup

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public appGen: AppGeneralService,
    private confService: ConfezionamentiService,
    private notificate: SnackBarService
  ) { }

  ngOnInit() {
    this.formFiltri = this.formBuilder.group({
      prodotto: new FormControl(''),
      tipoArtificiale: new FormControl(''),
      abilitato: new FormControl(''),
    });

    this.getGare();    
  }

  onChangePage(evt) {
    this.pageSelected = evt.pageIndex;
    this.itemsForPage = evt.pageSize;

    this.getLista(this.pageSelected);
    this.appGen.scroll('table')

  }

  deleteProdotto(item) {
    const message = `Sei sicuro di voler rimuovere questo prodotto dalla gara?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData

    });

    dialogRef.afterClosed().subscribe(async dialogResult => {
      if (dialogResult) {
        await this.service.deleteCallRequest({
          action: 'deleteProdottoGara',
          param: item.id,
        }).then(() => {
          this.getLista()
        })
      }
    });
  }

  modalProdotto(item, newVal) {

    const data = {
      item,
      newVal
    }


    const dialogRef = this.dialog.open(ModalProdottoGaraComponent, {
      data: data,
      panelClass: "modal-custom"
    });


    dialogRef.afterClosed().subscribe(async () => {
      this.getLista()
    })
  }


  async getTipoAlimentazioneArtificiale() {
    await this.service.getCallRequest({ action: 'getTipoAlimentazioneArtificiale' }).then(data => {
      this.listaTipoAlimentazioneArtificiale = data;
    });
  }

  search() {
    this.getLista();
  }

  clearSearch() {
    this.formFiltri.reset()
    this.getLista();
  }

  async getLista(page?: number) {
    const params = {
      page: (page === null || page === undefined) ? 0 : page,
      elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 10 : this.itemsForPage,
      sort: this.sortDirection,
      columnSort: this.columnSort,
      prodotto: this.formFiltri.get('prodotto').value,
      idArtificiale: this.formFiltri.get('tipoArtificiale').value,
      abilitato: this.formFiltri.get('abilitato').value,
      idGara: this.appGen.isNullOrUndefined(this.gara) ? null : this.gara.id
    }

    const objRequest = {
      action: 'getProdottiGare',
      param: params
    }

   // let x : FiltroGaraToDTO = new FiltroGaraToDTO()

    const res = await this.service.postCallRequest(objRequest);
    this.dataSource = new MatTableDataSource<any>();

    if (!this.appGen.isNullOrUndefined(res)) {
            
      this.dataSource.data = res['lista'];

      this.totalElements = res['totalElement'];
    }

    this.getConfezioniGare();

  }

  async getGare() {

    const objRequest = {
      action: 'gare',

    }
    await this.service.getCallRequest(objRequest).then((data) => {
      this.listaGare = data;
    });
  }

  selectedGara(val) {
    this.gara = val;
    this.getLista();
    
  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getLista();
  }

  openDetailException(message) {
    this.appGen.openDialog("Exception", message)
  }


 
//#region Confezionamenti

///PAGINATOR CONFEZIONAMENTI GARA
onChangePageXConfezionamenti(evt) {

  this.pageSelectedConfezionamenti = evt.pageIndex;
  this.itemsForPageConfezionamenti = evt.pageSize;

  this.getConfezioniGare(this.pageSelectedConfezionamenti);
  this.appGen.scroll('tableConfezionamenti');
}


///GET PER LE CONFEZIONI
  async getConfezioniGare(page? : number){
    this.appGen.loadingPanel.show();
    try {
    this.dataSourceConfezionamenti = new MatTableDataSource<any>();
    let listaProdottiAssociatiXGara = []
    const params = {
      
      page: (page === null || page === undefined) ? 0 : page,
      elementForPage: (this.itemsForPageConfezionamenti === null || this.itemsForPageConfezionamenti === undefined) ? 10 : this.itemsForPageConfezionamenti,
      sort: 'desc',
      columnSort: 'date',
      prodotto: '',
      idArtificiale: '',
      abilitato: '',
      idGara: this.gara.id,
    }    

    const x = await firstValueFrom(this.confService.getConfezioniGare(params));
    

      if(x.resultData !== null){
      listaProdottiAssociatiXGara = x.resultData.lista;
      this.dataSourceConfezionamenti.data = listaProdottiAssociatiXGara;
      this.totalElementsConfezionamenti = x.resultData.totalElement;
      }
      this.appGen.loadingPanel.hide();
      
    } catch (error) {
      this.appGen.loadingPanel.hide();
      this.notificate.error('È stato riscontrato un problema, riprovare')
    }

    
  }


  ///FUNZIONE CHE APRE LA MODALE PER AGGIUNGERE I CONFEZIONAMENTI DI UN PRODOTTO NON PRESENTE NELLA LISTA DEI PRODOTTI CON RELATIVI CONFEZIONAMENTI ASSOCIATI
  addConfezionamentoXGara(gara){    
    gara = this.gara;

    const dialogRef = this.dialog.open(ModalConfezionamentoGaraComponent,{
      data: gara.id,
      panelClass: 'modal-custom',
      height: 'auto',
      maxHeight: '96vh',
      width: '96vw'
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getLista()
      }
    })
  }


  ///FUNZIONE CHE APRE LA MODALE PERMETTONDO DI ASSOCIARE O DISOCCIARE I CONFEZIONAMENTI DI UN DETERMINATO PRODOTTO ALLA GARA
  editConfezionamentoXGara(element){
    element.idGara = this.gara.id;
    const dialogRef = this.dialog.open(ModalConfezionamentoGaraComponent,{
      data: element,
      panelClass: 'modal-custom',
      height: 'auto',
      maxHeight: '96vh',
      width: '96vw',
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getLista()
      }
    })
  }
  

  ///FUNZIONE CHE DISSOCIA TUTTI I CONFEZIONAMENTI DALLA GARA
  async dissociaConfezioniXGara(element){    
    try {
      element.idGara = this.gara.id;
      const nomeGara = this.gara.gara;

      Swal.fire({
        title: 'Sei sicuro?',
        html:
          "Così facendo dissocerai i confezionamenti del prodotto " +
          '" <b>' +
          element.prodotto +
          '</b>"' +
          ' dalla gara '+
          '" <b>' +
          nomeGara +
          '</b>"',
        icon: 'warning',
        iconColor: '#d33',
        showCancelButton: true,
        confirmButtonColor: '#00afa6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sì, confermo',
        cancelButtonText: 'No, annulla',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await firstValueFrom(this.confService.cancellaconfezionamentixgara(element.idGara , element.idProdotto));
            this.getLista();

            this.notificate.ok('Confezionamenti dissociati correttamente')
          } catch (error) {
            this.notificate.error('È stato riscontrato qualche problema, riprovare')
          }
        }
      })
    } catch (error) {
      this.notificate.error('È stato riscontrato n problema, riprovare')
    }

    
  }

//#endregion Confezionamenti
}

