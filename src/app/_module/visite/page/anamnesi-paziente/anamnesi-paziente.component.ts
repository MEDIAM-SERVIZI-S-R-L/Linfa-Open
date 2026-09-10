import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StepVisita } from 'src/app/_core/helpers/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatAccordion } from '@angular/material/expansion';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-anamnesi-paziente',
  templateUrl: './anamnesi-paziente.component.html',
  styleUrls: ['./anamnesi-paziente.component.scss']
})
export class AnamnesiPazienteComponent implements OnInit {
  @Input() isRiepilogoVisita;

  stepEnum = StepVisita
  step = this.stepEnum.Anamnesi;
  idPaziente;
  idRichiesta;
  idVisita;
  ricercaParam;
  params;
  isExpanded = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  quesito = "";

  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    private service: HttpSharedService,
    public appGen: AppGeneralService) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioStoricoPaziente');
    this.ricercaParam = JSON.parse(retrievedObjectFromPaziente);
    if (!(this.appGen.isNullOrUndefined(this.ricercaParam))) {
      this.isRiepilogoVisita = true;
    }

    this.activateRoute.queryParams.subscribe(params => {
      this.params = params;
      if (!(this.appGen.isNullOrUndefined(params))) {
        this.idRichiesta = params.request;


        if (!(this.appGen.isNullOrUndefined(params.visit))) {

          this.idVisita = params.visit;

          this.getQuesitoDiagnostico();
        }
      }

    });


  }


  ngAfterViewInit(): void {

    if (!this.appGen.isNullOrUndefined(sessionStorage.getItem('box'))) {

      setTimeout(() => {
        this.appGen.scroll(sessionStorage.getItem('box'))
        sessionStorage.removeItem('box');
      }, 500)
    }
  }

  goForward() {
    this.router.navigate(['/app/visite/step/anamnesi-alimentare', this.idPaziente], { queryParams: this.params })
  }

  backToPrevious() {
    // if (this.ricercaParam.fromStorico) {
    //   this.router.navigate(['app/visite/storico']);
    // } else {
    //   this.router.navigate(['app/visite']);
    // }
    this.router.navigate(['/app/pazienti/step/paziente', this.idPaziente], { queryParams: this.params })

  }

  expandCollapseAll() {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      this.accordion.openAll();
    } else {
      this.accordion.closeAll();
    }
  }
  async getQuesitoDiagnostico() {
    await this.service.getCallRequest({ action: 'getQuesitoDiagnostico', param: this.idVisita }).then((data) => {
      this.quesito = data;
    });
  }
  async onSubmit() {
    const obj = {
      quesito: this.quesito,
      idVisita: this.idVisita
    }
    await this.service.postCallRequest({ action: 'saveQuesitoDiagnostico', param: obj })
  }


}
