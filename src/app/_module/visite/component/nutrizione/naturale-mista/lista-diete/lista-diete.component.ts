import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { ModalAnteprimaComponent } from 'src/app/_module/visite/component/nutrizione/modal-anteprima/modal-anteprima.component';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import Swal from 'sweetalert2';
import _ from 'underscore';

@Component({
  selector: 'app-lista-diete',
  templateUrl: './lista-diete.component.html',
  styleUrls: ['./lista-diete.component.scss']
})
export class ListaDieteComponent implements OnInit {



  dietaDataSource = new MatTableDataSource<any>();
  dietaViewsColumns = ["dieta", "kcal", "proteine", "lipidi", "carboidrati", "creato", "pulsanti"]
 // dietaViewsColumns = ["dieta", "kcal", "proteine", "azoto", "lipidi", "carboidrati", "creato", "pulsanti"]
  @ViewChild(MatPaginator, {static: false})
   set paginator(value: MatPaginator) {
    this.dietaDataSource.paginator = value;
  }
  formFiltridieta: FormGroup;

  itemsForPage = 100;
  elementiTotali = 0;
  listaDietePredefinite = [];
  pageSelected = 0;
  sortDirection = 'asc';
  columnSort = 'dieta';
  queryParams: any = {};
  ricercaParam;
  idPaziente: string;
  idVisita: string;
  idValutazione: string;
  isDietaXpaziente = false;
  anamnesiExist = false;
  nutrizioneExist = false;
  params;

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    public authGuard: AuthGuard,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    private report: ReportService
  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.activateRoute.queryParams.subscribe(params => {
      this.params = params;
      if (!(this.appGen.isNullOrUndefined(params.visit))) {
        this.idVisita = params.visit;
        this.isDietaXpaziente = true;

        this.checkVisitaIniziata();

        this.checkAnamnesiExist()
      }
      if (!(this.appGen.isNullOrUndefined(params.vnutr))) {
        this.idValutazione = params.vnutr;
      }

    });

    this.formFiltridieta = this.formBuilder.group({
      dataVisita: new FormControl(''),
    });


    this.getListadieta();
  }

  ngAfterViewInit(): void {
    sessionStorage.removeItem('dettagliodietaPaziente');
  }

  async checkVisitaIniziata() {
    const obj = {
      idPaziente: this.idPaziente,
      idVisita: this.idVisita
    }
    await this.service.postCallRequest({ action: 'checkVisitaIniziata', param: obj }).then((data) => {
      if (data.existVisita) {
        this.nutrizioneExist = true;
      }
    });

  }

  sortData(sort: Sort) {
    if (sort.direction === '') {
      return;
    }
    this.columnSort = sort.active;
    this.sortDirection = sort.direction;
    this.pageSelected = 0;
    this.getListadieta();
  }

  search() {
    this.getListadieta();
  }

  clearSearch() {
    this.formFiltridieta.get("dataVisita").setValue('');
    this.getListadieta();

  }

  // onChangePage(evt) {
  //   this.pageSelected = evt.pageIndex;
  //   this.itemsForPage = evt.pageSize;

  //   this.getListadieta(this.pageSelected);

  // }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idPaziente], { queryParams: { visit: this.idVisita } })
  }

  async getListadieta(page?: number) {


    const obj = {
      page: this.appGen.isNullOrUndefined(page) ? 0 : page,
      elementForPage: (this.itemsForPage === null || this.itemsForPage === undefined) ? 100 : this.itemsForPage,
      Sort: this.sortDirection,
      ColumnSort: this.columnSort

    }

    const res = await this.service.postCallRequest({ action: 'listadiete', param: obj });
    this.dietaDataSource = new MatTableDataSource<any>();
    this.dietaDataSource.data = res.lista;
    this.elementiTotali = res['totalElement'];
  }

  /**
   * Se ci troviamo nella visita e esiste già un piano nutrizionale apre una modale che avverte che selezionando la dieta verrà
   * sostituita con la prcedente
   * @param idDieta id della dieta
   */
  dettaglioDieta(idDieta) {
    if(this.nutrizioneExist){
      Swal.fire({
        title: 'Sei sicuro?',
        html: 'Esiste già una dieta per questa visita, procedendo verrà cancellato il piano attuale e sostituito con la dieta selezionata',
        icon: 'warning',
        iconColor: '#d33',
        showCancelButton: true,
        showDenyButton: true,
        showConfirmButton: true,

        confirmButtonColor: '#00afa6',
        cancelButtonColor: '#d33',
        denyButtonColor: '#05668D',

        confirmButtonText: 'Sì, sostituisci la dieta',
        cancelButtonText: 'No, annulla',
        denyButtonText: `Riprendi il piano precedente`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (this.isDietaXpaziente) {
            this.router.navigate(['/app/visite/step/piani-alimentari/dettaglio', this.idPaziente],
              { queryParams: { detail: idDieta, visit: this.idVisita, vnutr: this.idValutazione, fromList : true  } })

          } else {
             //* Visualizza dettaglio della dieta salvata fuori dalla visita */
            this.router.navigate(['/app/visite/piani-alimentari/dettaglio'], { queryParams: { detail: idDieta } })
          }
        } else if(result.isDenied){
          this.continuaDieta();
        }
      })
    } else{
      if (this.isDietaXpaziente) {
        this.router.navigate(['/app/visite/step/piani-alimentari/dettaglio', this.idPaziente],
          { queryParams: { detail: idDieta, visit: this.idVisita, vnutr: this.idValutazione, fromList : true } })

      } else {
        //* Visualizzo nuova dieta  fuori dalla visita */
        this.router.navigate(['/app/visite/piani-alimentari/dettaglio'], { queryParams: { detail: idDieta } })
      }
    }
  }

  continuaDieta() {
    this.router.navigate(['/app/visite/step/piani-alimentari/dettaglio', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })
  }

  async download(idDieta) {
    await this.service.getCallRequest({ action: 'dieta', param: idDieta }).then(async data => {
      this.report.createPianoDieta(data);

    });
  }

  async getpdf(namePDF) {
    await this.service.getpdf(namePDF);
  }

  nuovaDieta() {
    if (this.isDietaXpaziente) {
      this.router.navigate(['/app/visite/piani-alimentari/nuovo', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione, new: true } })

    } else {
      this.router.navigate(['/app/visite/piani-alimentari/nuovo/new'])
    }
  }

  async delete(iddieta, nomeDieta) {

    const dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi eliminare la dieta: <strong>" + nomeDieta + "</strong>?");
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });
    dialogRef.afterClosed().subscribe((dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'deletedieta', param: iddieta }).then(() => {
          this.getListadieta();
        });
      }
    }));
  }

  createParams(dietaId) {
    this.queryParams.page = this.pageSelected;

    if (!this.appGen.isNullOrUndefined(dietaId)) {
      this.queryParams.idPaziente = dietaId;
    }

    this.queryParams.fromdieta = true;

    const dataTmp = this.formFiltridieta.get("dataVisita").value;


    if (dataTmp != '') {
      this.queryParams.dataVisita = this.appGen.convertToLocaleDate(dataTmp)
    }
  }

  setValSearch(paramsRicerca) {
    if (!(paramsRicerca['dataVisita'] == null || paramsRicerca['dataVisita'] == undefined || paramsRicerca['dataVisita'] == '')) {

      const date = new Date(paramsRicerca.dataVisita);
      this.formFiltridieta.get("dataVisita").setValue(date);
    }
  }

  async importaAnamnesi() {
    const message = `Vuoi importare l'ultima anamnesi compilata?`;
    const obj = {
      message,
      idPaziente: this.idPaziente,
      fromListaDiete: true,
      class : 'title'
    }

    const dialogRef = this.dialog.open(ModalAnteprimaComponent, {
      data: obj,
      panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.router.navigate(['/app/visite/piani-alimentari/nuovo', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione, anamnesi: true } })
      }
    }));
  }


  async checkAnamnesiExist() {
    const obj = {
      idPaziente: this.idPaziente,
      idVisita: this.idVisita
    }
    await this.service.postCallRequest({ action: 'checkAnamnesiExist', param: obj }).then((data) => {
      this.anamnesiExist = data;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dietaDataSource.filter = filterValue.trim().toLowerCase();
  }
}
