import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-interventi',
  templateUrl: './lista-interventi.component.html',
  styleUrls: ['./lista-interventi.component.scss']
})
export class ListaInterventiComponent implements OnInit {


  interventiDataSource = new MatTableDataSource<any>();
  interventiViewsColumns = ["intervento", "anno", "pulsanti"]
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
    private activateRoute: ActivatedRoute, public dialog: MatDialog,

  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.getListaInterventi();

  }

  dettaglioIntervento(id) {
    this.router.navigate(['/app/visite/dettaglio/intervento', id])
  }

  async getListaInterventi() {
    this.interventiDataSource = new MatTableDataSource<any>();
    this.interventiDataSource.data = await this.service.getCallRequest({ action: 'listainterventi', param: this.idPaziente });

  }
  nuovoIntervento() {
    this.router.navigate(['/app/visite/nuova/intervento', this.idPaziente])
  }

  async delete(id) {
    const message = `Sei sicuro di voler proseguire? L'eliminazione è irreversibile`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData, panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'eliminaintervento', param: id }).then(() => {
          this.getListaInterventi()
        });
      }
    }));


  }
}
