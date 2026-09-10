import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { StepVisita } from 'src/app/_core/helpers/enums';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {

  @Input() stepCorrente;
  @ViewChild(MatStepper, { static: true }) stepper: MatStepper;
  idPaziente;
  idRichiesta;
  step = StepVisita
  params;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,

  ) { }


  ngOnInit(): void {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    this.activateRoute.queryParams.subscribe(params => {
      if (!(params === undefined || params === null)) {
        this.params = params;
        this.idRichiesta = params.request;
      }
    });
    this.stepper.selectedIndex = this.stepCorrente;
  }
  goBack() {
    this.stepper.previous();
  }

  navigate(i) {
    switch (i) {
      case this.step.Anamnesi:
        this.router.navigate(['/app/visite/step/anamnesi', this.idPaziente], { queryParams: this.params })
        break;
      case this.step.AnamnesiAlimentare:
        this.router.navigate(['/app/visite/step/anamnesi-alimentare', this.idPaziente], { queryParams: this.params })
        break;
      case this.step.MNAKarnofsky:
        this.router.navigate(['/app/visite/step/mna-karnofsky', this.idPaziente], { queryParams: this.params })
        break;
      case this.step.ValutazioneNutrizionale:
        this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idPaziente], { queryParams: this.params })
        break;
      case this.step.Riepilogo:
        this.router.navigate(['/app/visite/step/riepilogo', this.idPaziente], { queryParams: this.params })
        break;
    }

  }
}
