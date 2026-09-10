import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { IRepartoToDTO, RepartoToDTO } from 'src/app/_dtos/out';
import { IReparto, Ospedale } from 'src/app/_models/configurazione';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import Swal from 'sweetalert2';
import _ from 'underscore';
import { ModalRepartiComponent } from '../modal-reparti/modal-reparti.component';

@Component({
  selector: 'app-lista-reparti',
  templateUrl: './lista-reparti.component.html',
  styleUrls: ['./lista-reparti.component.scss'],
})
export class ListaRepartiComponent implements OnInit, AfterViewInit {
  listaOspedali: Ospedale[] = []
  idOspedale: number = this.route.snapshot.params['ospedale']
  ospedale?: Ospedale
  listaReparti: IReparto[] = []

  reparto?: IRepartoToDTO

  title = 'Reparti'

  dataSource = new MatTableDataSource()
  displayedColumns: string[] = ['descrizione', 'centroCosto', 'button']

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    private repoService: DistrettiService,
    public router: Router,
    private route: ActivatedRoute,
    private notificate: SnackBarService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IReparto,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getListaReparti()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  async getListaReparti() {
    this.listaOspedali = await firstValueFrom(this.repoService.getListaOspedali())

    this.ospedale = _.findWhere(this.listaOspedali, {
      id: Number(this.idOspedale),
    })

    this.title = 'Reparti ' + this.ospedale.descrizione

    this.listaReparti = await firstValueFrom(
      this.repoService.getListaReparti(this.idOspedale)
    )

    this.dataSource.data = this.listaReparti
  }


  ///APRE LA MODALE PER AGGIUNGERE UN REPARTO
  addReparto() {
    const element: IReparto = {
      descrizione: '',
      idOspedale: this.idOspedale,
      centroCosto: ''
    }
    const dialogRef = this.dialog.open(ModalRepartiComponent, {
      data: element,
      panelClass: 'modal-custom',
    })
    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaReparti()
      }
    })
  }


  ///APRE LA MODALE PER EDITARE IL NOME DEL REPARTO
  editReparto(element: IReparto) {
    const dialogRef = this.dialog.open(ModalRepartiComponent, {
      data: element,
      panelClass: 'modal-custom',
    })
    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaReparti()
      }
    })
  }


  ///FUNZIONE CHE VIENE RICHIAMATA QUANDO SI PROVA AD ELIMIARE,
  ///PRIMA DI RICHIAMARE LA MODALE PER L'EVENTUALE CANCELLAZIONE VIENE VERIFICATO SE CI SONO RICHIESTE ALL'ENTE CHE SI PROVA A CANCELLARE
  async deleteReparto(element: IReparto) {
    try {
      const associato = await firstValueFrom(
        this.repoService.checkReparto(element.id)
      )
      if (associato === true) {
        this.notificate.warning(
          'Impossibile cancellare il reparto come richiesto, in quanto ci sono delle richieste attive per questo reparto'
        )
      } else if (associato === false) {
        Swal.fire({
          title: 'Sei sicuro?',
          html:
            'Così facendo cancellerai il reparto ' +
            '"<b>' +
            element.descrizione +
            '</b>"' +
            ' e tutti gli utenti ad esso associato. Cliccando su conferma non saranno più recuperabili',
          icon: 'warning',
          iconColor: '#d33',
          showCancelButton: true,
          confirmButtonColor: '#00afa6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sì, voglio cancellarlo!',
          cancelButtonText: 'No, annulla',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              element.recordEliminato = true
              this.reparto = new RepartoToDTO(element)
              await firstValueFrom(this.repoService.addReparto(this.reparto))
              this.getListaReparti()

              Swal.fire({
                title: 'Cancellato!',
                text: 'Reparto ' + element.descrizione + ' cancellato con successo',
                icon: 'success',
                iconColor: '#00afa6',
              })
            } catch (error) {
              this.notificate.error('È stato riscontrato qualche problema, riprovare')
            }
          }
        })
      }
    } catch (error) {
      console.error(error);
      this.notificate.error('È stato riscontrato un problema, riprovare')
    }


  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  goToOspedali() {
    this.router.navigate(['app/configurazioni/ospedali'])
  }
}
