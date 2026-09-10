import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-sport',
  templateUrl: './lista-sport.component.html',
  styleUrls: ['./lista-sport.component.scss']
})
export class ListaSportComponent implements OnInit {


  sportDataSource = new MatTableDataSource<any>();
  sportViewsColumns = ["attivita", "frequenza", "durata", "intensita", "sportLivello", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  elementiTotali: Number = 0;
  pageSelected: Number = 0;
  ricercaParam;
  idPaziente;
  @Input() isRiepilogoVisita;

  constructor(private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public dialog: MatDialog,

  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    this.getListaSport();
  }

  dettaglioSport(id) {
    this.router.navigate(['/app/visite/dettaglio/attivita-motoria', id])
  }

  async getListaSport() {
    this.sportDataSource = new MatTableDataSource<any>();
    let res = await this.service.getCallRequest({ action: 'listaattivitamotoria', param: this.idPaziente });
    if (!this.appGen.isNullOrUndefined(res)) {

      this.sportDataSource.data = res
    }


  }

  nuovoSport() {
    this.router.navigate(['/app/visite/nuova/attivita-motoria', this.idPaziente])
  }

  async delete(id) {
    const message = `Sei sicuro di voler proseguire? L'eliminazione è irreversibile`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData, panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'eliminasport', param: id }).then(() => {
          this.getListaSport()
        });
      }
    }));


  }
}
