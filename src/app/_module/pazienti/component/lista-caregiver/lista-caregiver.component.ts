import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Pazienti } from '../../_dto-pazienti/dto-pazienti';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { StepPaziente } from 'src/app/_core/helpers/enums';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatSort } from '@angular/material/sort';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-lista-caregiver',
  templateUrl: './lista-caregiver.component.html',
  styleUrls: ['./lista-caregiver.component.scss']
})
export class ListaCaregiverComponent implements OnInit {

  dataSource: MatTableDataSource<Pazienti>
  caregiverViewsColumns = ["nome", "cognome", "telefono", "gradoParentela", "pulsanti"]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() riepilogoCaregivers: boolean;
  @Output() outputGoFoward = new EventEmitter();

  stepEnum = StepPaziente

  idPaziente: string;


  stepRiepilogo = false;
  isDettaglio = false;
  isVisita = false;
  ricercaParam: any;
  idVisita: string;
  params: any;

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private router: Router, private activateRoute: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    const retrievedObject = sessionStorage.getItem('ricercaParamPaziente');
    this.ricercaParam = JSON.parse(retrievedObject);
    if (!(this.ricercaParam == null || this.ricercaParam == undefined || this.ricercaParam <= 0)) {
      this.getDettaglioCaregivers();
    }

    this.getListaCaregiver();

    if (this.riepilogoCaregivers) {
      this.getStepRiepilogoCaregiver();
    }

    this.activateRoute.queryParams.subscribe(params => {
      if (!(params === null || params === undefined)) {
        this.params = params;
        this.idVisita = params.visit;
        this.isVisita = true
      }
    });

  }

  async getListaCaregiver(): Promise<void> {
    const objRequest = {
      action: 'caregivers',
      param: this.idPaziente,
    }
    const res = await this.service.getCallRequest(objRequest);
    this.dataSource = new MatTableDataSource<Pazienti>();
    if (!this.appGen.isNullOrUndefined(res)) {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
    }
  }

  backToPrevious(): void {
    this.router.navigate(['app/pazienti/step/privacy', this.idPaziente], { queryParams: this.params })

  }

  nuovoCaregiver(): void {
    this.router.navigate(['app/pazienti/step/nuovo-caregiver', this.idPaziente])
  }

  async dettaglioCaregiver(idcaregiver: string): Promise<void> {
    this.router.navigate(['app/pazienti/dettaglio/caregiver', idcaregiver]);
  }

  async eliminaCaregiver(idcaregiver: string): Promise<void> {
    const message = `Sei sicuro di voler rimuovere il caregiver?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });


    dialogRef.afterClosed().subscribe(((dialogResult): void => {
      if (dialogResult) {

        const objRequest = {
          action: 'deletecaregiver',
          param: idcaregiver,
        };
        this.service.getCallRequest(objRequest).then(() => {
          this.getListaCaregiver();
        });
      }
    }));
  }

  checkIdPaziente(): void {
    const retrievedObject = sessionStorage.getItem('idPazienteParam');
    if (!(retrievedObject == null || retrievedObject == undefined || retrievedObject == '')) {
      const param = JSON.parse(retrievedObject);
      this.idPaziente = param.idPaziente;
    }
  }

  goForward(): void {
    if (!this.appGen.isNullOrUndefined(this.idVisita)) {
      this.router.navigate(['app/pazienti/step/riepilogo', this.idPaziente], { queryParams: this.params })
    } else {
      this.router.navigate(['app/pazienti'])
    }
  }

  getStepRiepilogoCaregiver(): void {
    this.stepRiepilogo = true;
    this.getListaCaregiver();

  }
  getDettaglioCaregivers() {
    this.isDettaglio = true;
    this.getListaCaregiver();

  }
}
