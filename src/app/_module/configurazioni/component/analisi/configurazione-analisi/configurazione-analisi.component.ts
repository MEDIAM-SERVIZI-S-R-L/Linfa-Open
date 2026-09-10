/* eslint-disable no-debugger */
import { trigger, state, style, transition, animate } from '@angular/animations'
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { firstValueFrom } from 'rxjs'
import { TipoValoreAnalisi } from 'src/app/_core/helpers/enums'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { DettaglioRangeToDTO, ProprietaAnalisiToDTO } from 'src/app/_dtos/out'
import { unitaMisura } from 'src/app/_models/confezionamenti'
import {
  CategoriaAnalisi,
  DettaglioRange,
  ProprietaAnalisi,
} from 'src/app/_models/paziente'
import { AnalisiService } from 'src/app/_repositories/analisi.service'
import Swal from 'sweetalert2'
import _ from 'underscore'
import { ModalProprietaComponent } from '../modal-proprieta/modal-proprieta.component'
import { ModalRangeComponent } from '../modal-range/modal-range.component'

@Component({
  selector: 'app-configurazione-analisi',
  templateUrl: './configurazione-analisi.component.html',
  styleUrls: ['./configurazione-analisi.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed, void => expanded',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ConfigurazioneAnalisiComponent implements OnInit, AfterViewInit {
  categorie: CategoriaAnalisi[]
  valori: ProprietaAnalisi[]
  range: DettaglioRange[] | null = []
  arrayUnitaMisura: unitaMisura[] = []
  proprieta: ProprietaAnalisi;

  categoriaAnalisi = null;

  tipoCampo = TipoValoreAnalisi

  dataSource = new MatTableDataSource()
  columns: string[] = ['descrizione']
  displayedColumns: string[] = [
    'descrizione',
    'min',
    'max',
    'rangeEta',
    'sesso',
    'unitaMisura',
    'button',
  ]
  columnsToDisplayWithExpand = [...this.columns, 'expand']

  expandedElement?: DettaglioRange | null

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    private analisiService: AnalisiService,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DettaglioRange,
    @Optional() @Inject(MAT_DIALOG_DATA) public dataProprieta: ProprietaAnalisi,
    public appGen: AppGeneralService,
    private notificate: SnackBarService
  ) {}

  ngOnInit(): void {
    this.getCategorieEsami();
    this.getValori(null);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  async getCategorieEsami() {
    try {
      this.categorie = await firstValueFrom(this.analisiService.getCategoriaEsami())
    } catch (error) {
      this.notificate.error('È stato notificato un errore, riprovare');
    }
  }

  async getValori(selectedCategory: any) {
    this.appGen.loadingPanel.show();
    let categoria: number;
    if (selectedCategory === null || selectedCategory.value === 0) {
      categoria = 0;
    } else {
      categoria = selectedCategory.value !== undefined? selectedCategory.value.id : selectedCategory;
    }
    this.valori = await firstValueFrom(this.analisiService.getXValoriEsami(categoria));
    this.categoriaAnalisi = categoria;
    this.dataSource.data = this.valori

    this.appGen.loadingPanel.hide();
  }

  ///APRE MODALE PER AGGIUNGERE UNA NUOVA PROPRIETA
  addNewProprieta() {
    const dialogRef= this.dialog.open(ModalProprietaComponent, {
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getValori(this.categoriaAnalisi);
      }
    })
  }


  ///APRE MODALE PER EDITARE PROPRIETA
  editProprieta(element: ProprietaAnalisi, event: any) {
    event.preventDefault()
    event.stopPropagation()

    const dialogRef = this.dialog.open(ModalProprietaComponent, {
      panelClass: 'modal-custom',
      data: element,
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getValori(this.categoriaAnalisi);
      }
    })
  }

  ///ELIMINA PROPRIETA, NEL CASO SIA ASSOCIATA NON VIENE ELIMINATA
  async deleteProprieta(element: ProprietaAnalisi, event: any) {
    event.preventDefault()
    event.stopPropagation()

    try {
      const associato = await firstValueFrom(
        this.analisiService.checkvaloreesame(element.idProprieta)
      )
      if (associato === true) {
        this.notificate.warning(
          'Impossibile cancellare la proprietà selezionata in quanto è associata ad alcune visite'
        )
      } else if (associato === false) {
        Swal.fire({
          title: 'Sei sicuro?',
          html:
            'Così facendo cancellerai la proprietà ' +
            '"<b>' +
            element.descrizione +
            '</b>"' +
            'Cliccando su conferma non sarà più recuperabile',
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

              const proprietaDaEliminare = new ProprietaAnalisiToDTO(element)
              await firstValueFrom(
                this.analisiService.manageXValoriEsame(proprietaDaEliminare)
              )
              this.getValori(this.categoriaAnalisi)

              this.notificate.ok(
                'Proprietà ' + element.descrizione + ' cancellata con successo'
              )
            } catch (error) {
              this.notificate.error('È stato riscontrato un problema, riprovare')
            }
          }
        })
      }
    } catch (error) {
      this.notificate.error('È stato riscontrato un problema, riprovare')
    }
  }


  ///ESPANSIONE PANNELLO CON TABELLA INTERNA E PRENDE I RANGE DELLA PROPRIETA SELEZIONATA
  async getRangeEsami(element: any) {
    if (element.tipoCampo == this.tipoCampo.Number) {
      try {
        if (element.expanded) {
          element.expanded = false
          this.range = null
        } else if (!element.expanded) {
          this.appGen.loadingPanel.show()
          this.proprieta = element
          for (const valore of this.valori) {
            valore.expanded = false
          }

          element.idProprieta && !element.expanded
          this.range = await firstValueFrom(
            this.analisiService.getRangeXValoreEsame(element.idProprieta)
          )
          element.expanded = true

          for (const range of this.range) {
            range.unitaMisura = element.unitaMisura
          }          
          this.appGen.loadingPanel.hide()
        }
      } catch (error) {
        console.error(error)
      }
    }
  }


  ///APRE LA MODALE PER AGGIUNGERE UN NUOVO RANGE
  addNewRange(item: ProprietaAnalisi) {
    const element: DettaglioRange = {
      id: null,
      descrizione: undefined,
      etaMax: undefined,
      etaMin: undefined,
      sesso: undefined,
      min: undefined,
      max: undefined,
      idValoriEsami: item.idProprieta,
      idUnitaMisura: null,
      unitaMisura: item.unitaMisura,
      recordEliminato: false,
    }
    const dialogRef = this.dialog.open(ModalRangeComponent, {
      panelClass: 'modal-custom',
      data: element,
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        item.expanded = false;
        this.getRangeEsami(item)
      }
    })
  }


  ///APRE LA MODALE PER MODIFICARE IL RANGE SELEZIONATO
  editRange(element: DettaglioRange) {
    const dialogRef = this.dialog.open(ModalRangeComponent, {
      panelClass: 'modal-custom',
      data: element,
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.proprieta.expanded = false;
        this.getRangeEsami(this.proprieta)
      }
    })
  }


  ///ELIMINA IL RANGE SELEZIONATO
  async deleteRange(element: DettaglioRange) {
    Swal.fire({
      title: 'Sei sicuro?',
      text:
        'Vuoi cancellare il range ' +
        '"' +
        element.descrizione +
        '" definitivamente? Non sarà piùrecuperabile',
      icon: 'warning',
      iconColor: '#d33',
      showCancelButton: true,
      confirmButtonColor: '#00afa6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sì, voglio cancellarlo!',
      cancelButtonText: 'No, annulla',
    }).then(async (result) => {
      if (result.isConfirmed) {
        element.recordEliminato = true;
        this.proprieta.expanded = false;
        const item = new DettaglioRangeToDTO(element)
        await firstValueFrom(this.analisiService.manageRangeXValoreEsame(item))
        this.notificate.ok('Range cancellato correttamente')
        this.getRangeEsami(this.proprieta)
      }
    })
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
}
