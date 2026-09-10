import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-patologie',
  templateUrl: './lista-patologie.component.html',
  styleUrls: ['./lista-patologie.component.scss']
})
export class ListaPatologieComponent implements OnInit {
  patologieDataSource = new MatTableDataSource<any>();
  patologieViewsColumns = ["patologia", "primaria", "cronica", "stress", "trauma", "attivita", "terapia", "periodo", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  elementiTotali: Number = 0;
  pageSelected: Number = 0;
  ricercaParam;
  idPaziente;
  @Input() isRiepilogoVisita;
  @Output() showBtnProsegui = new EventEmitter<any>();

  constructor(private service: HttpSharedService,
    public appGen: AppGeneralService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public dialog: MatDialog,

  ) { }

  ngOnInit() {

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.getListaPatologie();

  }



  async getListaPatologie() {
    this.patologieDataSource = new MatTableDataSource<any>();
    this.patologieDataSource.data = await this.service.getCallRequest({ action: 'listapatologiepaziente', param: this.idPaziente });
    if (this.patologieDataSource.data.length > 0) {
      this.showBtnProsegui.next(null);
    }


  }
  nuovoPatologia() {
    this.router.navigate(['/app/visite/nuova/patologia', this.idPaziente])
  }

  dettaglioPatologia(id) {
    this.router.navigate(['/app/visite/dettaglio/patologia', id])
  }

  async delete(id) {
    const message = `Sei sicuro di voler proseguire? L'eliminazione è irreversibile`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData, panelClass: "modal-custom"

    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {
        this.service.putCallRequest({ action: 'eliminapatologia', param: id }).then(() => {
          this.getListaPatologie()
        });
      }
    }));


  }

}
