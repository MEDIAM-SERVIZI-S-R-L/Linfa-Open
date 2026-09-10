import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ConfigService } from 'src/app/_core/services/config.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { CategoriaConfigurazione } from 'src/app/_models/configurazione';
import { ModalCategoriaConfigurazioneComponent } from '../modal-categoria-configurazione/modal-categoria-configurazione.component';

@Component({
  selector: 'app-gestione-configurazioni',
  templateUrl: './gestione-configurazioni.component.html',
  styleUrls: ['./gestione-configurazioni.component.scss']
})
export class GestioneConfigurazioniComponent implements OnInit {

  //Array
  listaCategorie : CategoriaConfigurazione[] = [];

  //Table
  dataSource = new MatTableDataSource<CategoriaConfigurazione>();
  viewsColumns = ["categoria", "abilitato", "button"]
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  
  constructor(
    private appGen: AppGeneralService,
    private dialog: MatDialog,
    private configServ: ConfigService
  ) { }

  ngOnInit(): void {
    this.getCategorieConfig();
  }

  /**
   * Funzione in get, tutte le categorie 
   */
  async getCategorieConfig(){
    this.listaCategorie = await firstValueFrom(this.configServ.getCategorieConfigurazioni());
    if (!this.appGen.isNullOrUndefined(this.listaCategorie)) {
      this.dataSource.data = this.listaCategorie;
    }
  }

  /**
   * Apre la modale per editare o creare una nuova categoria
   * @param data categoria da modificare, in caso sia null vuol dire che la sto creando nuova
   */
  openModalCategoriaConfig(data: CategoriaConfigurazione = null){    
    const dialogRef = this.dialog.open(
      ModalCategoriaConfigurazioneComponent,
      {
        data: data,
        panelClass: 'modal-custom',
        maxHeight : '70vh',
        maxWidth: '50vw',
        width: 'auto',
        height:'auto'
      }
    )

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getCategorieConfig()
      }
    })
  }

}
