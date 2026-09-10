/* eslint-disable no-debugger */
import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { debounceTime, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import { DistrettoToDTO, IDistrettoToDTO } from 'src/app/_dtos/out';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ModalDistrettiComponent } from '../modal-distretti/modal-distretti.component';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { Distretto, IDistretto } from 'src/app/_models/configurazione';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { FormControl } from '@angular/forms';
import _ from 'underscore';

@Component({
  selector: 'app-lista-distretti',
  templateUrl: './lista-distretti.component.html',
  styleUrls: ['./lista-distretti.component.scss'],
})
export class ListaDistrettiComponent implements OnInit, AfterViewInit {
  listaDistretti : Distretto[] = [];
  backupListaDistretti : Distretto[] = [];
  distretto?: IDistrettoToDTO;

  public filtroDistretti : FormControl = new FormControl();
  protected _onDestroy = new Subject<void>();

  dataSource = new MatTableDataSource()

  ///colonne tabella
  displayedColumns: string[] = ['descrizione', 'approvazione', 'mediciAssociati',  'button'];

  ricercaEffettuata = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public appGen : AppGeneralService,
    private repoService: DistrettiService,
    private notificate: SnackBarService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IDistretto,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getListaDistretti();
    this.setFiltroDistretti();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ///FUNZIONE CHE VIENE RICHIAMATA NELL'ONINIT CHE VA A RECUPERARE LA LISTA DEI DISTRETTI
  async getListaDistretti() {
    this.appGen.loadingPanel.show();
    try {
      this.listaDistretti = await firstValueFrom(this.repoService.getListaDistretti());
      this.backupListaDistretti = this.listaDistretti;
      this.dataSource.data = this.listaDistretti;
  
      if (this.listaDistretti.length > 0) {
        for (const distretto of this.listaDistretti) {
          this.getMediciXDistretto(distretto);
        }
      }
      
      this.appGen.loadingPanel.hide();
    } catch (error) {
      console.error(error);
      this.appGen.loadingPanel.hide();
    }
  }

  ///FUNZIONE PER AGGIUNGERE IL NUOVO DISTRETTO TRAMITE LA MODALE
  addDistretto() {
    const dialogRef = this.dialog.open(ModalDistrettiComponent, {
      panelClass: 'modal-custom',
      disableClose: true,
      maxHeight : '92vh',
      maxWidth: '60vw',
      width: '60vw',
      height:'auto'
    })
    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaDistretti()
      }
    })
  }

  ///FUNZIONE PER EDITARE IL DISTRETTO SELEZIONATO TRAMITE MODALE
  editDistretto(element: IDistretto) {
    const dialogRef = this.dialog.open(ModalDistrettiComponent, {
      data: element,
      panelClass: 'modal-custom',
      disableClose: true,
      maxHeight : '92vh',
      maxWidth: '60vw',
      width: '60vw',
      height:'auto'
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getListaDistretti()
      }
    })
  }

  ///FUNZIONE CHE VIENE RICHIAMATA QUANDO SI PROVA AD ELIMIARE,
  ///PRIMA DI RICHIAMARE LA MODALE PER L'EVENTUALE CANCELLAZIONE VIENE VERIFICATO SE CI SONO RICHIESTE ALL'ENTE CHE SI PROVA A CANCELLARE
  async deleteDistretto(element: IDistretto) {
    try {
      const associato = await firstValueFrom(this.repoService.checkDistretto(element.id));      
      if (associato === true) {
        this.notificate.warning(
          'Impossibile cancellare il distretto come richiesto, in quanto ci sono delle richieste attive per questo distretto'
        )
      } else if (associato === false) {
        Swal.fire({
          title: 'Sei sicuro?',
          html:
            'Così facendo cancellerai il distretto ' +
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

              this.distretto = new DistrettoToDTO(element)
              await firstValueFrom(this.repoService.addDistretto(this.distretto))
              this.getListaDistretti()

            this.notificate.ok('Distretto cancellato con successo')
            } catch (error) {
              this.notificate.error('È stato riscontrato un problema, riprovare')
            }
          }
        })
      }
    } catch (error) {
      console.error(error)
      this.notificate.error('È stato riscontrato un problema, riprovare')
    }
  }


  setFiltroDistretti(){

    this.filtroDistretti.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy)
    )
    .subscribe((item) => {
      this.ricercaEffettuata = true;
      this.getListaDistrettaFiltrata(item);
    })
  }


  getListaDistrettaFiltrata(distrettoCercato: string){
    if (distrettoCercato.length > 0) {
      let listaFiltrata : Distretto[] = [];
      listaFiltrata = _.filter(this.backupListaDistretti, function(distretto)
      {return distretto.descrizione.toLowerCase().includes(distrettoCercato)});
      this.dataSource.data = listaFiltrata;
    } else {
      this.dataSource.data = this.backupListaDistretti;
      this.ricercaEffettuata = false;
    }
  }


  async getMediciXDistretto(distretto : Distretto){
    let listaMedici = [];
    listaMedici  = await firstValueFrom(this.repoService.getMediciXDistretto(distretto.id));
    distretto.arrayMedici = listaMedici;
    distretto.arrayMediciAssociati = [];
    for (const medico of distretto.arrayMedici) {
        if (medico.associatoDistretto === true) {
            distretto.arrayMediciAssociati.push(medico);
        }
    }
  }

  getToolTip(element : Distretto){
    const listaMedici = element.arrayMediciAssociati;
    let toolTip = '';
          for (let i = 0; i < listaMedici?.length; i++) {
              toolTip =  toolTip + ' • ' + listaMedici[i].medico + "\n" ;
          }
    return toolTip;
  }
}
