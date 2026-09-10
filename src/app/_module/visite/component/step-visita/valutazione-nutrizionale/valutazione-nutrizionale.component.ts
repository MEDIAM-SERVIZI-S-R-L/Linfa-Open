import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { Permessi, StepVisita, TipoAlimentazione } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { VisitaRepoService } from 'src/app/_repositories/visita_repo.service';

import { FormValutazioneComponent } from './form-valutazione/form-valutazione.component';

//import { CruscottoPazienteComponent } from 'src/app/_module/visite/component/cruscotto-paziente/cruscotto-paziente.component';

@Component({
  selector: 'app-valutazione-nutrizionale',
  templateUrl: './valutazione-nutrizionale.component.html',
  styleUrls: ['./valutazione-nutrizionale.component.scss']
})
export class ValutazioneNutrizionaleComponent implements OnInit {

  @Input() isRiepilogoVisita;
  @ViewChild(FormValutazioneComponent) childFormValutazione: FormValutazioneComponent;
 // @ViewChild(CruscottoPazienteComponent) cruscottoComp: CruscottoPazienteComponent;

  stepEnum = StepVisita;
  tipoAlimentazione = TipoAlimentazione;
  step = this.stepEnum.ValutazioneNutrizionale;
  idPaziente;
  idVisita;
  sessionParam;
  isStoricoDettaglio = false;
  idValutazione;
  showBtnNutrizione = false;
  showBtnAnnullaCambioAlimentazione = false;
  showBtnContinuaAlimentazione = false;
  alimentazioneScelta;
  params;
  nutrizioneExist = false
  isStepVisita = true
  permessi = Permessi

  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    public authGuard: AuthGuard,
    private visitaServ: VisitaRepoService
  ) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');
    const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!(this.appGen.isNullOrUndefined(retrievedObjectFromPaziente))) {
      this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
    }
    if (!(this.appGen.isNullOrUndefined(this.sessionParam))) {
      this.isRiepilogoVisita = true;
    }

    this.activateRoute.queryParams.subscribe(params => {
      if (!(this.appGen.isNullOrUndefined(params))) {
        this.params = params;
        this.idVisita = params.visit;
        //ho controllato che siano già state compilate valutazione nutrizione e/o la nutrizione
        this.checkVisitaIniziata()
      }
    });

  }

  async checkVisitaIniziata() {
    const obj = {
      idPaziente: this.idPaziente,
      idVisita: this.idVisita
    }
    await this.service.postCallRequest({ action: 'checkVisitaIniziata', param: obj }).then((data) => {
      if (data.existVisita) {
        this.nutrizioneExist = true;
      }
      if (!this.appGen.isNullOrUndefined(data.tipoAlimentazione)) {
        this.alimentazioneScelta = data.tipoAlimentazione
      }

    });

  }


  async concludiVisita() {
    const obj = {
      idVisita: this.idVisita,
      // idTipoAlimentazione: this.tipoAlimentazione.NaturaleMista
    }

    await this.service.postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj }).then(async () => {
      await this.service.putCallRequest({ action: 'concludiVisita', param: this.idVisita }).then(() => {
        this.router.navigate(['/app/visite/riepilogo', this.idPaziente], { queryParams: this.params })
      })
    });
  }

  prosegui() {
    this.router.navigate(['/app/visite/step/riepilogo', this.idPaziente], { queryParams: this.params })
  }

  backToPrevious() {
    this.router.navigate(['/app/visite/step/mna-karnofsky', this.idPaziente], { queryParams: this.params })
  }

  showBtnNutrizioneResult() {

    if (this.nutrizioneExist || !this.appGen.isNullOrUndefined(this.alimentazioneScelta)) {
      this.showBtnContinuaAlimentazione = true;
      this.showBtnAnnullaCambioAlimentazione = false;
      this.showBtnNutrizione = false
    } else {
      this.showBtnNutrizione = true

    }
  }
  getIdValutazione(idvalutazione) {
    this.idValutazione = idvalutazione
  }

  updateCruscotto() {
   // this.cruscottoComp.ngOnInit()

  }

  async goToAlimentazione(alimentazione) {
    let obj = new Object;
    switch (alimentazione) {

      case 'conclusioni':
        obj = {
          idVisita: this.idVisita,
          //idTipoAlimentazione: this.tipoAlimentazione.Conclusioni
        }

        await this.service.postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj }).then(() => {
          this.router.navigate(['/app/visite/step/conclusioni', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })
        });
        break;
      case 'naturale':
        obj = {
          idVisita: this.idVisita,
          idTipoAlimentazione: this.tipoAlimentazione.NaturaleMista
        }

        await this.service.postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj }).then(() => {
          this.router.navigate(['/app/visite/step/piani-alimentari/lista', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })
        });
        break;

      case 'artificiale':
        obj = {
          idVisita: this.idVisita,
          idTipoAlimentazione: this.tipoAlimentazione.Artificiale
        }

        await this.service.postCallRequest({ action: 'setTipoAlimentazioneVisita', param: obj }).then(() => {
          this.router.navigate(['/app/visite/step/nutrizione/artificiale', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })
        });
        break;

    }
  }

  cambiaAlimentazione() {
    this.showBtnContinuaAlimentazione = false;
    this.showBtnNutrizione = true
    this.showBtnAnnullaCambioAlimentazione = true;
  }



  riprendiVisita() {
    switch (this.alimentazioneScelta) {
      case this.tipoAlimentazione.Conclusioni:
        this.router.navigate(['/app/visite/step/conclusioni', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })
        break;
      case this.tipoAlimentazione.Artificiale:
        this.router.navigate(['/app/visite/step/nutrizione/artificiale', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })

        break;
      case this.tipoAlimentazione.NaturaleMista:
        this.router.navigate(['/app/visite/step/piani-alimentari/lista', this.idPaziente], { queryParams: { visit: this.idVisita, vnutr: this.idValutazione } })
        break;

      default:
        break;
    }
  }
}
