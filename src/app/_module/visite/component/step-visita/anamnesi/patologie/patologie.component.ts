import { Component, OnInit, Input } from '@angular/core';
import { StepVisita } from 'src/app/_core/helpers/enums';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-patologie',
  templateUrl: './patologie.component.html',
  styleUrls: ['./patologie.component.scss']
})
export class PatologieComponent implements OnInit {

  @Input() isRiepilogoVisita;

  stepEnum = StepVisita
  step = this.stepEnum.Anamnesi;
  idPaziente;
  idRichiesta;
  sessionParam;
  dettaglioVisita = false;
  showBtnProsegui = false;

  constructor(private activateRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');


    var retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!(retrievedObjectFromPaziente == null || retrievedObjectFromPaziente == undefined || retrievedObjectFromPaziente == '')) {
      this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
      if (!(this.sessionParam == null || this.sessionParam == undefined || this.sessionParam == '')) {
        this.isRiepilogoVisita = true;
      }
    } else {
      var retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioVisitaPaziente');
      if (!(retrievedObjectFromPaziente == null || retrievedObjectFromPaziente == undefined || retrievedObjectFromPaziente == '')) {
        this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
        if (!(this.sessionParam === null || this.sessionParam === undefined)) {
          this.dettaglioVisita = true;
        }
      }
    }

    this.activateRoute.queryParams.subscribe(params => {
      if (!(params === null || params === undefined)) {
        this.idRichiesta = params.request;
      }
    });
  }

  showBtnProseguiResult() {
    this.showBtnProsegui = true
  }

  prosegui() {
    this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idPaziente], { queryParams: { request: this.idRichiesta, new: true } })
  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/mna-karnofsky', this.idPaziente], { queryParams: { request: this.idRichiesta, new: true } })

  }
}
