import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service';

@Component({
  selector: 'app-lista-conclusioni-predefinite',
  templateUrl: './lista-conclusioni-predefinite.component.html',
  styleUrls: ['./lista-conclusioni-predefinite.component.scss']
})
export class ListaConclusioniPredefiniteComponent implements OnInit {


  conclusioniDataSource = new MatTableDataSource<any>();
  conclusioniViewsColumns = [ "note", "pulsanti"]

  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    private notificate: SnackBarService,
    private visitaServ: VisitaRepoService,
    public dialogRef: MatDialogRef<ListaConclusioniPredefiniteComponent>,
  ) { }

  ngOnInit(): void {
    this.getListConclusioniPredefinite()
  }

  ngAfterViewInit() {
    this.conclusioniDataSource.paginator = this.paginator;
  }


    /**
   * Prendo la lista delle conclusioni predefinite
   */
    async getListConclusioniPredefinite() {
      try {
        this.conclusioniDataSource.data = await firstValueFrom(this.visitaServ.getListaConclusioniPredefinite())
      } catch (error) {
        this.notificate.error(error)
      }
    }
/**
 * Quando seleziono la conclusione chiudo la modale e passo la conclusione selezionata
 * @param _conclusione
 */
    selezioniConclusione(_conclusione:string){
      this.dialogRef.close(_conclusione)
    }

/**
 *  Filtraggio nelle conclusioni
 * @param event
 */
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.conclusioniDataSource.filter = filterValue.trim().toLowerCase();

      if (this.conclusioniDataSource.paginator) {
        this.conclusioniDataSource.paginator.firstPage();
      }
    }

}
