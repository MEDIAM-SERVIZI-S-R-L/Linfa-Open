import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-dipendenze',
  templateUrl: './lista-dipendenze.component.html',
  styleUrls: ['./lista-dipendenze.component.scss']
})
export class ListaDipendenzeComponent implements OnInit {


  dipendenzeDataSource = new MatTableDataSource<any>();
  dipendenzeViewsColumns = ["tipologiaDipendenza", "descrizione", "periodo", "quantita", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  elementiTotali = 0;
  pageSelected = 0;
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

    this.getListaDipendenze();

  }

  dettaglioNote(note) {
    this.appGen.openDialog("Nota", note)
  }

  async getListaDipendenze() {

    this.dipendenzeDataSource = new MatTableDataSource<any>();
    const res = await this.service.getCallRequest({ action: 'listadipendenze', param: this.idPaziente });

    if (!this.appGen.isNullOrUndefined(res)) {

      this.dipendenzeDataSource.data = res
    }
  }
  nuovaDipendenza() {
    this.router.navigate(['/app/visite/nuova/dipendenza', this.idPaziente])
  }
  dettaglioDipendenza(id) {
    this.router.navigate(['/app/visite/dettaglio/dipendenza', id])
  }

  async delete(id) {
    const message = `Sei sicuro di voler proseguire? L'eliminazione è irreversibile`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData, panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'eliminadipendenza', param: id }).then(() => {
          this.getListaDipendenze()
        });
      }
    }));
  }

}
