/* eslint-disable no-debugger */
/* eslint-disable no-cond-assign */
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, firstValueFrom, takeUntil, Subject } from 'rxjs';
import { Ruoli, TipoEnti } from 'src/app/_core/helpers/enums';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { IUtenteDaAssociareToDTO, UtenteDaAssociareToDTO } from 'src/app/_dtos/out';
import {  IOspedale, IEnte, IEntiXUtente, EntiXUtente, IUtenteDaAssociare } from 'src/app/_models/configurazione';
import { DistrettiService } from 'src/app/_repositories/distretti.service';
import _ from 'underscore';

@Component({
  selector: 'app-associazione-enti',
  templateUrl: './associazione-enti.component.html',
  styleUrls: ['./associazione-enti.component.scss'],
})
export class AssociazioneEntiComponent implements OnInit, OnDestroy, AfterViewInit {
  protected _onDestroy = new Subject<void>()

  listaOspedale: IOspedale[] = []
  listaOspedaleFiltrata: ReplaySubject<IOspedale[]> = new ReplaySubject<IOspedale[]>()

  listaTipoEnti: IEnte[] = []

  listaEntiUtente: IEntiXUtente[] = []
  listaEntiUtenteFiltrato: IEntiXUtente[] = []

  defaultValue = 0

  utente!: IUtenteDaAssociareToDTO

  ruoli = Ruoli;

  tipoEnti = TipoEnti;

  idTipoEnte!: number
  idUtente!: string
  dataSource = new MatTableDataSource()
  displayedColumns: string[] = ['ente', 'ospedale', 'associato']

  filtroOspedale = new FormControl('')

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tipiEnti = TipoEnti;

  @Input() tabEnte

  constructor(
    private route: ActivatedRoute,
    private repoService: DistrettiService,
    private notificate: SnackBarService
    ) {}

  ngOnInit(): void {
    this.getEntiXUtente()
    this.getOspedale()
    this.filtraOspedale()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  ngOnDestroy() {
    this._onDestroy.next()
    this._onDestroy.complete()
  }

  ////FILTRO PER I DATI INTERNI DELLA TABELLA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  async getOspedale() {
    this.listaOspedale = await firstValueFrom(this.repoService.getListaOspedali())
    this.listaOspedaleFiltrata.next(this.listaOspedale.slice());
  }

  ///FUNZIONE CHE VIENE RICHIAMATA QUANDO VIENE SELEZIONATO UTENTE E ENTE, DISPLAYANDO A TABELLA I DATI.
  ///NEL CASO IN CUI VENGA CLICCATO L'ENTE NELLE TAB VIENE CONVERTITO NELL'ENUM CORRISPONDENTE
  async getEntiXUtente() {
    if (this.tabEnte === this.ruoli.Distretto) {
      this.idTipoEnte = this.tipoEnti.Distretto;
    } else if (this.tabEnte === this.ruoli.Reparto) {
      this.idTipoEnte = this.tipoEnti.Reparto;
    } else if (this.tabEnte === this.ruoli.FarmaciaOspedaliera) {
      this.idTipoEnte = this.tipoEnti.FarmaciaOspedaliera;
    }

    this.defaultValue = 0
    this.idUtente = this.route.snapshot.paramMap.get('id')
    this.listaEntiUtente = await firstValueFrom(
      this.repoService.getEntiXUtente(this.idUtente, this.idTipoEnte)
    )
    this.listaEntiUtenteFiltrato = this.listaEntiUtente;
    this.dataSource.data = this.listaEntiUtenteFiltrato;
  }

  ///FUNIONE LEGATA ALLA CHECKBOX, CLICCANDO SI ASSOCIA O DISSOCIA L'UTENTE ALL'ENTE
  ///20.01.2024 bug 1166 chiesto di fare in modo che sia possibile associare un solo distretto
  async cambiaAssocia(element: EntiXUtente, event: any) {
    try {

      for (const ente of this.listaEntiUtente) {
        ente.associato = false;
      }      

      element.associato = event.checked;
      
      for (const ente of this.listaEntiUtente) {
        const item: IUtenteDaAssociare = {
          idUtente: this.idUtente,
          idEnte: ente.idente,
          idTipoEnte: this.idTipoEnte,
          associato: ente.associato,
        }

        const utente = new UtenteDaAssociareToDTO(item);
        await firstValueFrom(this.repoService.cambiaAssociazioneXUtente(utente));
      }
      
    } catch (error) {
      this.notificate.error('Errore durante il salvataggio, riprovare')
    }

  }

  ///FUNZIONE CHE MOSTRA A TABELLA SOLAMENTE I DISTRETTI DELL'OSPEDALE SELEZIONATO
  filterEntiXOspedale(selectedOspedale: any) {
    if (selectedOspedale.value === 0) {
      this.dataSource.data = this.listaEntiUtente
    } else {
      const arrayFiltrato = _.where(this.listaEntiUtente, {
        ospedale: selectedOspedale.value,
      })
      this.listaEntiUtenteFiltrato = arrayFiltrato;
      this.dataSource.data = this.listaEntiUtenteFiltrato
    }
  }

  ///FUNZIONE CHE VIENE RICHIAMATA NELL'ONINIT PER IL FILTRAGGIO DURANTE LA SCELTA DEGLI OSPEDALI
  protected filtraOspedale() {
    this.listaOspedaleFiltrata.next(this.listaOspedale.slice())

    this.filtroOspedale.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filtraListaOspedali()
    })
  }

  ///FUNZIONE CHE VIENE RICHIAMATA PER FILTRARE GLI OSPEDALI, NELLA SELECT DELLA SELEZIONE
  filtraListaOspedali() {
    if (!this.listaOspedale) {
      return
    }
    let search = this.filtroOspedale.value
    if (!search) {
      this.listaOspedaleFiltrata.next(this.listaOspedale.slice());
      return
    } else {
      search = search.toLowerCase();
    }

    this.listaOspedaleFiltrata.next(
      this.listaOspedale.filter((element) => {
        if (element.descrizione.toLowerCase().indexOf(search as string) > -1) {
          return element
        } else {
          return null
        }
      })
    )
  }
}
