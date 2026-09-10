import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ModalConfigurazioneComponent } from '../modal-configurazione/modal-configurazione.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { ReportService } from 'src/app/_core/services/report.service';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigService } from 'src/app/_core/services/config.service';
import { firstValueFrom } from 'rxjs';
import { Configurazione } from 'src/app/_models/configurazione';

@Component({
  selector: 'app-lista-config',
  templateUrl: './lista-config.component.html',
  styleUrls: ['./lista-config.component.scss']
})
export class ListaConfigComponent implements OnInit {

  dataSource = new MatTableDataSource<Configurazione>();
  viewsColumns = ["proprieta", "descrizione", "valore", "abilitato", "categoriaConfigurazione", "pulsanti"]
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  constructor(
    private service: HttpSharedService,
    private dialog: MatDialog,
    private report: ReportService,
    public appGen: AppGeneralService,
    private configServ: ConfigService
  ) { }

  ngOnInit() {
    this.getLista()
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  async getLista() {

    const res = await firstValueFrom(this.configServ.getConfigurazioniXCategorie());
    
    this.dataSource = new MatTableDataSource<Configurazione>();

    if (!this.appGen.isNullOrUndefined(res)) {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
    }
  }


  editProprieta(item?) {
    const dialogRef = this.dialog.open(ModalConfigurazioneComponent, {
      data: item,
      panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(async dialogResult => {
      if (dialogResult) {
        await this.getLista();
        this.appGen.setConfigLinfa();
      }
    })
  }

  anteprimaReferto() {
    const obj = {
      pdfFile: this.report.createRefertoProva(this.appGen.refertoTest),
      anteprimaIntestazione: true,
      title: 'Anteprima referto'

    }
    this.dialog.open(ModalPdfViewerComponent, {
      data: obj,
      panelClass: "modal-anteprima-pdf",
      width : '50vw',
      height: '50vh'
    });
  }

}

