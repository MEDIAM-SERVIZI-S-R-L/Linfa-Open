import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-farmaci',
  templateUrl: './lista-farmaci.component.html',
  styleUrls: ['./lista-farmaci.component.scss']
})
export class ListaFarmaciComponent implements OnInit {

  farmaciDataSource = new MatTableDataSource<any>();
  farmaciViewsColumns = ["farmaco", "posologia", "periodo", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  elementiTotali = 0;
  pageSelected = 0;
  ricercaParam;
  idPaziente: string;
  @Input() isRiepilogoVisita: boolean;


  constructor(private service: HttpSharedService,
    public appGen: AppGeneralService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public dialog: MatDialog,

  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.getListaFarmaci();

  }



  async getListaFarmaci() {
    this.farmaciDataSource = new MatTableDataSource<any>();
    const res = await this.service.getCallRequest({ action: 'listafarmaci', param: this.idPaziente });

    if (!this.appGen.isNullOrUndefined(res)) {

      this.farmaciDataSource.data = res
    }

  }
  nuovoFarmaco() {
    this.router.navigate(['/app/visite/nuova/farmaco', this.idPaziente])
  }

  dettaglioFarmaco(id: any) {
    this.router.navigate(['/app/visite/dettaglio/farmaco', id])
  }

  async delete(id: any) {
    const message = `Sei sicuro di voler proseguire? L'eliminazione è irreversibile`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData, panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'eliminafarmaco', param: id }).then(() => {
          this.getListaFarmaci()
        });
      }
    }));


  }

}
