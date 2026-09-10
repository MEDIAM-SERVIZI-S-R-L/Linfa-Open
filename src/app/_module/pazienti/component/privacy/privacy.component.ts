import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDocumentoPrivacyComponent } from 'src/app/shared/modal/modal-documento-privacy/modal-documento-privacy.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { StepPaziente } from 'src/app/_core/helpers/enums';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { LivelliPrivacy } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {

  idPaziente: string;
  stepEnum = StepPaziente
  step = this.stepEnum.Privacy;
  stepRiepilogo = false;
  isDettaglio = false;
  isMaggiorenne = false;
  proseguiVisita = false;
  showPrivacy = false;
  privacyFirmata = false;
  params: any;
  idVisita: string;
  formPrivacy: FormGroup;
  @Input() isRiepilogoVisita: boolean;
  livelliPrivacy: LivelliPrivacy[];
  validitaPrivacy: string;

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private router: Router, private activateRoute: ActivatedRoute,
    public dialog: MatDialog,
    private report: ReportService,
    private formBuilder: FormBuilder,
    private backPreviousPage: Location,

  ) { }

  ngOnInit(): void {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.formPrivacy = this.formBuilder.group({
      Privacy: new FormControl(''),
      DataFirmaPrivacy: new FormControl({ value: '', disabled: true }),

    });

    if (this.isRiepilogoVisita) {
      this.formPrivacy.disable()
    }

    this.activateRoute.queryParams.subscribe(async params => {
      if (!(params === null || params === undefined)) {
        this.params = params;
        this.idVisita = params.visit;
        await this.checkEtaPaziente()

      }
    });

    this.checkPrivacyExist()
    this.getLivelliPrivacy()
  }

  backToPrevious(): void {
    this.backPreviousPage.back()
  }

  async getLivelliPrivacy(): Promise<void> {
    await this.service.getCallRequest({ action: 'getLivelliPrivacy' }).then((data) => {
      this.livelliPrivacy = data
    })
  }
  async checkEtaPaziente(): Promise<void> {
    const objRequest = {
      action: 'checkPazienteMinorenne',
      param: this.idPaziente,
    }
    await this.service.getCallRequest(objRequest).then((data): void => {
      this.isMaggiorenne = data
      if (this.isMaggiorenne) {
        this.showPrivacy = true;
      }
    });
  }

  async moduloPrivacy(): Promise<void> {
    const params = {
      IdVisita: this.idVisita,
      IdPaziente: this.idPaziente
    }

    const objRequest = {
      action: 'getModuloPrivacy',
      param: params,
    }
    await this.service.postCallRequest(objRequest).then((res): void => {
      if (this.appGen.isNullOrUndefined(res)) {
        return;
      }

      const pdfFile = this.report.createDocumentoPrivacy(res)
      
      const dialogRef = this.dialog.open(ModalDocumentoPrivacyComponent, {
        data: pdfFile,
        panelClass: "modal-anteprima-pdf"

      });

      dialogRef.afterClosed().subscribe(dialogResult => {

        if (dialogResult) {
          this.report.print(pdfFile)
          this.checkPrivacyExist()

        }
      });


    });
  }

  async selectedPrivacy(val: number): Promise<void> {
    const params = {
      Privacy: val,
      IdPaziente: this.idPaziente
    }
    const objRequest = {
      action: 'updatePrivacyPaziente',
      param: params,
    }
    await this.service.postCallRequest(objRequest).then((): void => {
      this.checkPrivacyExist()

    })
  }

  async checkPrivacyExist(): Promise<void> {
    const objRequest = {
      action: 'checkPrivacyExist',
      param: this.idPaziente,
    }
    await this.service.getCallRequest(objRequest).then((res): void => {
      if (!res.scaduta) {
        const data = new Date(res.dataPrivacy)
        this.formPrivacy.get('Privacy').setValue(res.privacySelezionata)
        this.formPrivacy.get('DataFirmaPrivacy').setValue(data)
        this.privacyFirmata = true;
        if (!this.appGen.isNullOrUndefined(res.validitaPrivacy)) {
          this.validitaPrivacy = res.validitaPrivacy
        }
      } else {
        this.formPrivacy.get('DataFirmaPrivacy').disable()
        this.formPrivacy.updateValueAndValidity()
      }

    })

  }

  showPrivacyEmit(): void {
    this.showPrivacy = true;
    this.appGen.scroll('privacy');
  }

  goFoward(): void {
    if (!this.appGen.isNullOrUndefined(this.idVisita)) {
      //sono nella compilazione della visita
    //  this.router.navigate(['app/pazienti/step/riepilogo', this.idPaziente], { queryParams: { visit: this.idVisita } });

    this.goToVisita()

    }
  }

  async goToVisita(): Promise<void> {

    sessionStorage.removeItem('caregiverParam');
    sessionStorage.removeItem('dettaglioStoricoPaziente');


    const params = {
      IdVisita: this.idVisita,
      IdPaziente: this.idPaziente
    }

    const objRequest = {
      action: 'updateVisitaIniziata',
      param: params,
    }

    await this.service.postCallRequest(objRequest).then((): void => {
      this.router.navigate(['/app/visite/step/anamnesi', this.idPaziente], { queryParams: this.params })
    });
  }

}
