/* eslint-disable no-debugger */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { IOspedaleToDTO, OspedaleToDTO } from 'src/app/_dtos/out';
import { IOspedale } from 'src/app/_models/configurazione';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import Swal from 'sweetalert2';
import { ModalOspedaliComponent } from '../modal-ospedali/modal-ospedali.component';

@Component({
  selector: 'app-lista-ospedali',
  templateUrl: './lista-ospedali.component.html',
  styleUrls: ['./lista-ospedali.component.scss'],
})
export class ListaOspedaliComponent implements OnInit, AfterViewInit {
  listaOspedali = []
  ospedale?: IOspedaleToDTO

  dataSource = new MatTableDataSource()
  displayedColumns: string[] = ['descrizione', 'cod', 'button']

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    private repoService: DistrettiService,
    public dialog: MatDialog,
    private notificate: SnackBarService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getListaOspedali()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  async getListaOspedali() {
    this.listaOspedali = await firstValueFrom(this.repoService.getListaOspedali())
    this.dataSource.data = this.listaOspedali
  }

  ///APRE LA MODALE PER AGGIUNGERE UN OSPEDALE
  addOspedale() {
    const dialogRef = this.dialog.open(ModalOspedaliComponent, {
      panelClass: 'modal-custom',
    })
    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaOspedali()
      }
    })
  }

  ///APRE LA MODALE PER EDITARE IL NOME DELL'OSPEDALE
  editOspedale(element: IOspedale, event: any) {
    event.preventDefault()
    event.stopPropagation()

    const dialogRef = this.dialog.open(ModalOspedaliComponent, {
      data: element,
      panelClass: 'modal-custom',
    })
    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaOspedali()
      }
    })
  }


  ///FUNZIONE CHE VIENE RICHIAMATA QUANDO SI PROVA AD ELIMIARE,
  ///PRIMA DI RICHIAMARE LA MODALE PER L'EVENTUALE CANCELLAZIONE VIENE VERIFICATO SE CI SONO RICHIESTE ALL'ENTE CHE SI PROVA A CANCELLARE
  async deleteOspedale(element: IOspedale, event: any) {
    event.preventDefault()
    event.stopPropagation()

    try {
      const associato = await firstValueFrom(this.repoService.checkOspedale(element.id))
      if (associato === true) {
        this.notificate.warning(
          "Impossibile cancellare l'ospedale come richiesto, in quanto ci sono delle richieste attive per questo ospedale"
        )
      } else if (associato === false) {

        Swal.fire({
          title: 'Sei sicuro?',
          html:
            "Così facendo cancellerai l'ospedale" +
            '" <b>' +
            element.descrizione +
            '</b>"' +
            ', i relativi reparti e gli utenti ad esso associati. Cliccando su conferma non saranno più recuperabili',
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
              this.ospedale = new OspedaleToDTO(element)
              await firstValueFrom(this.repoService.addOspedale(this.ospedale))
              this.getListaOspedali()

              this.notificate.ok('Ospedale cancellato correttamente')
            } catch (error) {
              this.notificate.error('È stato riscontrato qualche problema, riprovare')
            }
          }
        })
      }
    } catch (error) {
      this.notificate.error('È stato riscontrato qualche problema, riprovare')
    }
  }

  goToReparti(element: IOspedale) {
    this.router.navigate(['app/configurazioni/reparti', element.id])
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
}
