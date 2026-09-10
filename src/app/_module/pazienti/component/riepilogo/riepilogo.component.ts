import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatDialog } from '@angular/material/dialog';
import { StepPaziente } from 'src/app/_core/helpers/enums';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-riepilogo',
  templateUrl: './riepilogo.component.html',
  styleUrls: ['./riepilogo.component.scss']
})
export class RiepilogoComponent implements OnInit {

  stepEnum = StepPaziente;
  step = this.stepEnum.Riepilogo;
  isRiepilogo = false;
  isFromVisita = false;
  sessionParam: any;
  idpaziente: string;
  idVisita: string;
  params: any;

  constructor(private activateRoute: ActivatedRoute,
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    private backPreviousPage: Location,
    private router: Router, public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {

    this.idpaziente = this.activateRoute.snapshot.paramMap.get('id');
    if (!(this.idpaziente == null || this.idpaziente == undefined)) {
      this.isRiepilogo = true;
    }

    this.activateRoute.queryParams.subscribe(async (params): Promise<void> => {
      if (!(this.appGen.isNullOrUndefined(params.visit))) {
        this.params = params;
        this.idVisita = params.visit;
        this.isFromVisita = true;
      }
    });
  }

  backToPrevious(): void {
    this.backPreviousPage.back();
  }

  async goToVisita(): Promise<void> {

    sessionStorage.removeItem('caregiverParam');
    sessionStorage.removeItem('dettaglioStoricoPaziente');


    const params = {
      IdVisita: this.idVisita,
      IdPaziente: this.idpaziente
    }

    const objRequest = {
      action: 'updateVisitaIniziata',
      param: params,
    }

    await this.service.postCallRequest(objRequest).then((): void => {
      this.router.navigate(['/app/visite/step/anamnesi', this.idpaziente], { queryParams: this.params })
    });
  }

  esci(): void {
    if (this.isFromVisita) {
      this.router.navigate(['/app/visite'])
    } else {
      this.router.navigate(['/app/pazienti'])
    }
  }
}
