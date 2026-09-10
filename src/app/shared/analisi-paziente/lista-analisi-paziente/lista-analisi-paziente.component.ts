import { Component, OnInit, ViewChild,ChangeDetectorRef  } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTable, MatTableDataSource } from '@angular/material/table'
import { firstValueFrom } from 'rxjs'
import { AnalisiPaziente } from 'src/app/_models/paziente'
import { PazienteService } from 'src/app/_repositories/paziente_repo.service'
import Swal from 'sweetalert2'
import * as _ from 'underscore'
import { InserimentoAnalisiComponent } from '../inserimento-analisi/inserimento-analisi.component'
import { ActivatedRoute } from '@angular/router'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'

@Component({
  selector: 'app-lista-analisi-paziente',
  templateUrl: './lista-analisi-paziente.component.html',
  styleUrls: ['./lista-analisi-paziente.component.scss']
})
export class ListaAnalisiPazienteComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort
 // @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatTable) table?: MatTable<AnalisiPaziente[]>
  listaAnalisi = new MatTableDataSource()

  columnsToDisplayWithExpand = ['descrizione', 'data', 'expand']
  rowOpened?: AnalisiPaziente | null

  displayedColumns = ['descrizioneValore', 'valore', 'min', 'max', 'alert', 'delete']
  displayedColumnsLabel = ['Descrizione valore', 'valore', 'valore min', 'valore max']

  buttonClickable = true
  idPaziente
  //dataEsame?: IEsame | null;
  //valoriEsame?: ValoriAnalisi;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;


  constructor(
    public pazienteHttp: PazienteService,
    public dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    public appGen: AppGeneralService,
    private cdr: ChangeDetectorRef  // per refresh paginatore
  ) {}

  ngOnInit(): void {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id')
    this.activateRoute.queryParams.subscribe((params) => {
      if (!this.appGen.isNullOrUndefined(params.patient)) {
        this.idPaziente = params.patient
      }
    })

    if (this.idPaziente) {
      this.listaAnalisiPerPaziente(this.idPaziente)
    }
  }



  ngAfterViewInit(): void {
    this.listaAnalisi.sort = this.sort
    this.listaAnalisi.paginator = this.paginator
  }

  /**
   * Leggo la lista del analisi per paziente
   * @param _idPaziente
   */
  async listaAnalisiPerPaziente(_idPaziente: string) {
    try {
      this.listaAnalisi.data = await firstValueFrom(
        this.pazienteHttp.getAnalisiPaziente(_idPaziente)
      )
    //  this.listaAnalisi.paginator = this.paginator
      this.cdr.detectChanges()
    } catch (error) {
      console.error(error)
    }
  }

  async inserimentoDatiEspandibili(element: any) {
    //così se c'è un esame "espanso" tra tutti quelli presenti, si chiude prima di aprire l'altro esame cliccato
    try {
      if (element.expanded && element.expanded == true) {
        element.expanded = false
      } else if (!element.expanded) {
        element.expanded = true
      }
    } catch (error) {
      console.error(error)
    }
  }

  addAnalisi() {

    const dialogRef = this.dialog.open(InserimentoAnalisiComponent, {
      height: '90%',
      width: '90%',
      data: {
        idPaziente: this.idPaziente,
      },
    })

    dialogRef.afterClosed().subscribe((dialogResult) => {
      this.listaAnalisiPerPaziente(this.idPaziente)
    })
  }

  /*

addAnalisi

  addEsame() {
    this.dialog.open(LinfaComponent);
  }

   editEsame(element: IEsameXPaziente, event: any) {
    if (element.expanded && element.expanded == true) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.dialog.open(LinfaComponent,{
        data: element
      })
  }


/*
  deleteValore(element: ValoriEsame, dataEsame: IEsame){
    Swal.fire({
  title: 'Sei sicuro?',
  text: "Così facendo cancellerai il valore di " + '"' + element.descrizioneValore + '"' + " e non sarà recuperabile",
  icon: 'warning',
  iconColor: '#d33',
  showCancelButton: true,
  confirmButtonColor: '#00afa6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sì, voglio cancellarlo!',
  cancelButtonText: 'No, annulla'
}).then(async (result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: 'Cancellato!',
      text: 'Valore di ' + element.descrizioneValore + ' cancellato con successo',
      icon: 'success',
      iconColor: '#00afa6',
    })
    let item: IEsameObj = {
      id: dataEsame.id as string,
      ///VqR da sostituire con ID paziente
      idPaziente: 'VqR',
      DataEsame: dataEsame.dataEsame,
      Descrizione: dataEsame.descrizione,
      RecordEliminato: false,
      valoriEsame: [{
        IdXValoriEsami: element.idXValoriEsami,
        Valore: element.valore,
        RecordEliminato: true
      }]
    }
    let exam = new ValoriEsamiObjToDto(item)
    await firstValueFrom(this.apiServ.deleteValore(exam))
  }
})
}


  deleteEsame(element: IEsameXPaziente, event: any){
    event.preventDefault();
    event.stopPropagation();
    Swal.fire({
      title: 'Sei sicuro?',
      text: "Così facendo cancellerai l'esame " + '"' + element.descrizione + '"' + " e non sarà recuperabile",
      icon: 'warning',
      iconColor: '#d33',
      showCancelButton: true,
      confirmButtonColor: '#00afa6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sì, voglio cancellarlo!',
      cancelButtonText: 'No, annulla'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cancellato!',
          text: 'Esame "' + element.descrizione + '" cancellato con successo',
          icon: 'success',
          iconColor: '#00afa6',
        })
        let item: IEsameObj = {
          id: element.idesame,
          idPaziente: 'VqR',
          DataEsame: element.dataesame,
          Descrizione: element.descrizione,
          RecordEliminato: true,
          valoriEsame: []
        }

        let exam = new EsameObjToDto(item);
        await firstValueFrom(this.apiServ.deleteExam(exam))
      }
    })
  }*/
}
