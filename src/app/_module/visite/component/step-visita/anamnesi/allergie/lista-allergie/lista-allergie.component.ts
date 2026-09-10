import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-allergie',
  templateUrl: './lista-allergie.component.html',
  styleUrls: ['./lista-allergie.component.scss']
})
export class ListaAllergieComponent implements OnInit {


  allergieDataSource = new MatTableDataSource<any>();
  allergieViewsColumns = ["tipo", "dettaglio", "descrizione", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  elementiTotali = 0;
  pageSelected = 0;
  ricercaParam;
  idPaziente;
  @Input() isRiepilogoVisita;


  constructor(private service: HttpSharedService,
    public appGen: AppGeneralService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    this.getListaAllergie();
  }

  dettaglioNote(note) {
    this.appGen.openDialog("Nota", note)
  }

  async getListaAllergie() {
    this.allergieDataSource = new MatTableDataSource<any>();
    const res = await this.service.getCallRequest({ action: 'listaallergie', param: this.idPaziente });

    if (!this.appGen.isNullOrUndefined(res)) {

      this.allergieDataSource.data = res
    }
  }


  nuovaAllergia() {
    this.router.navigate(['/app/visite/nuova/allergia', this.idPaziente])
  }
  dettaglioAllergia(id) {
    this.router.navigate(['/app/visite/dettaglio/allergia', id])
  }

  async delete(id) {
    const message = `Sei sicuro di voler proseguire? L'eliminazione è irreversibile`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'eliminaallergia', param: id }).then(() => {
          this.getListaAllergie()
        });
      }
    }));
  }
}
