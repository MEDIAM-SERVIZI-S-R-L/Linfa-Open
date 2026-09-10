import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StepVisita } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

import { FormDietaComponent } from '../naturale-mista/form-dieta/form-dieta.component';
import { NewFormDietaComponent } from '../naturale-mista/new-form-dieta/new-form-dieta.component';

@Component({
  selector: 'app-anamnesi-alimentare',
  templateUrl: './anamnesi-alimentare.component.html',
  styleUrls: ['./anamnesi-alimentare.component.scss']
})
export class AnamnesiAlimentareComponent implements OnInit {
  @Input() isRiepilogoVisita;

  stepEnum = StepVisita
  step = this.stepEnum.AnamnesiAlimentare;
  idPaziente;
  idRichiesta;
  sessionParam;
  dettaglioVisita = false;
  showBtnProsegui = false;
  params;


  @ViewChild(FormDietaComponent, { static: false }) private formDietaComponent: FormDietaComponent;

  @ViewChild(NewFormDietaComponent, { static: false}) private newformDietaComponent : NewFormDietaComponent;


  constructor(
    private appGen: AppGeneralService,
    private activateRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');


    const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!this.appGen.isNullOrUndefined(retrievedObjectFromPaziente)) {

      this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
      if (!this.appGen.isNullOrUndefined(this.sessionParam)) {

        this.isRiepilogoVisita = true;
      }
    } else {
      const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioVisitaPaziente');
      if (!this.appGen.isNullOrUndefined(retrievedObjectFromPaziente)) {
        this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
        if (!this.appGen.isNullOrUndefined(this.sessionParam)) {
          this.dettaglioVisita = true;
        }
      }
    }

    this.activateRoute.queryParams.subscribe(params => {
      this.params = params;

      if (!this.appGen.isNullOrUndefined(params)) {
        this.idRichiesta = params.request;
      }
    });
  }

  showBtnProseguiResult() {
    this.showBtnProsegui = true
  }

  prosegui() {

    // this.formDietaComponent.onSubmit().then((error) => {
    //   if (error) {
    //     return;
    //   }
    //   this.router.navigate(['/app/visite/step/mna-karnofsky', this.idPaziente], { queryParams: this.params })
    // });

    this.newformDietaComponent.onSubmit().then((error) =>{
      if (error) {
        return;
      }
      this.router.navigate(['/app/visite/step/mna-karnofsky', this.idPaziente], { queryParams: this.params })
    })


  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/anamnesi', this.idPaziente], { queryParams: this.params })
  }
}
