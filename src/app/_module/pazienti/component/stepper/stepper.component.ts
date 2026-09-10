import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Location } from '@angular/common';
import { StepPaziente } from 'src/app/_core/helpers/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {

  @Input() stepCorrente: number;

  stepAnagrafica: FormGroup;
  stepPrivacy: FormGroup;
  stepCaregiver: FormGroup;
  stepRiepilogo: FormGroup;
  public currentComponent = null;
  step = StepPaziente

  panelOpenState = false;
  idPaziente: string;
  idRichiesta: string;
  params: any;
  @Output() emitChange = new EventEmitter();
  @ViewChild(MatStepper, { static: true }) stepper: MatStepper;

  constructor(
    private backPreviousPage: Location,
    private activateRoute: ActivatedRoute,
    public appGen: AppGeneralService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.stepper.selectedIndex = this.stepCorrente;
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    this.activateRoute.queryParams.subscribe(params => {
      if (!this.appGen.isNullOrUndefined(params)) {
        this.params = params;
        this.idRichiesta = params.request;
      }
    });

  }


  navigate(i: number): void {
    if (this.appGen.configLinfa.PrivacyAbilitata) {
      switch (i) {
        case this.step.Anagrafica:
          this.router.navigate(['/app/pazienti/step/paziente', this.idPaziente], { queryParams: this.params })
          break;
        case this.step.Privacy:
          this.router.navigate(['/app/pazienti/step/privacy', this.idPaziente], { queryParams: this.params })
          break;

        case this.step.Riepilogo:
          this.router.navigate(['/app/pazienti/step/riepilogo', this.idPaziente], { queryParams: this.params })
          break;
      }
    } else {
      switch (i) {
        case this.step.Anagrafica:
          this.router.navigate(['/app/pazienti/step/paziente', this.idPaziente], { queryParams: this.params })
          break;
        case 1:
          this.router.navigate(['/app/pazienti/step/riepilogo', this.idPaziente], { queryParams: this.params })
          break;
      }
    }
  }

  backToPrevious(): void {
    this.backPreviousPage.back()
  }

}
