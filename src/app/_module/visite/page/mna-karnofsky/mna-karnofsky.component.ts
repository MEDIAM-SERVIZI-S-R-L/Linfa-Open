import { Component, OnInit, Input } from '@angular/core';
import { StepVisita } from 'src/app/_core/helpers/enums';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mna-karnofsky',
  templateUrl: './mna-karnofsky.component.html',
  styleUrls: ['./mna-karnofsky.component.scss']
})
export class MnaKarnofskyComponent implements OnInit {

  stepEnum = StepVisita
  step = this.stepEnum.MNAKarnofsky;
  idPaziente;
  idRichiesta;
  @Input() isRiepilogoVisita;
  sessionParam;
  isStoricoDettaglio = false;
  dettaglioVisita = false;
  params;

  constructor(private activateRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!(retrievedObjectFromPaziente == null || retrievedObjectFromPaziente == undefined || retrievedObjectFromPaziente == '')) {
      this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
      if (!(this.sessionParam == null || this.sessionParam == undefined || this.sessionParam == '')) {
        this.isRiepilogoVisita = true;
      }
    } else {
      const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioVisitaPaziente');
      if (!(retrievedObjectFromPaziente == null || retrievedObjectFromPaziente == undefined || retrievedObjectFromPaziente == '')) {
        this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
        if (!(this.sessionParam === null || this.sessionParam === undefined)) {
          this.dettaglioVisita = true;
        }
      }
    }

    this.activateRoute.queryParams.subscribe(params => {
      if (!(params === null || params === undefined)) {
        this.params = params
        this.idRichiesta = params.request;
      }
    });

  }

  prosegui() {
    this.router.navigate(['/app/visite/step/valutazione-nutrizionale', this.idPaziente], { queryParams: this.params })
  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/anamnesi-alimentare', this.idPaziente], { queryParams: this.params })

  }
}
