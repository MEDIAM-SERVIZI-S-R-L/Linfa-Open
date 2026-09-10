import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Questionario } from 'src/app/_core/helpers/enums';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';


@Component({
  selector: 'app-form-mna',
  templateUrl: './form-mna.component.html',
  styleUrls: ['./form-mna.component.scss']
})
export class FormMnaComponent implements OnInit {

  questionario = Questionario
  idPaziente;
  listaQuestionario;

  listaScreening;
  listaGlobale;
  listaLivelloMna;
  idmna;

  listaPerditaAppetito;
  listaPerditaPeso;
  listaMotricita;
  listaNeuropsicologici;
  listaBmi;

  arrayRisposte = [];
  @Input() isRiepilogoVisita;
  valutazioneScreening;
  valutazioneGlobale;
  valutazioneTotale;
  descrizioneValutazione;
  showValutazioni = false;
  showGlobale = false;
  arrayErroriScreening;
  arrayErroriGlobale;
  punteggioScreening = 0;
  punteggioTotale = 0;

  constructor(private activateRoute: ActivatedRoute,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private notificate: SnackBarService) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.existQuestionario()


  }
  async selectRispostaScreening(i, evt) {

    // se nullo o undefined vuol dire che ho tolto la selezione perciò lo rimuovo dal mio array e tolgo il punteggio
    if (this.appGen.isNullOrUndefined(evt.value)) {
      //rimuovo il vecchio punteggio
      this.punteggioScreening -= this.listaScreening[i].xRisposte.filter(x => x.id === this.listaScreening[i].idRispostaSelezionata)[0].punteggio

      this.listaScreening[i].idRispostaSelezionata = null
    } else {

      if (!this.appGen.isNullOrUndefined(this.listaScreening[i].idRispostaSelezionata)) {
        //rimuovo il vecchio punteggio
        this.punteggioScreening -= this.listaScreening[i].xRisposte.filter(x => x.id === this.listaScreening[i].idRispostaSelezionata)[0].punteggio
      }

      //assegno quello nuovo
      this.listaScreening[i].idRispostaSelezionata = evt.value

      this.arrayErroriScreening[i] = false;
      //aggiungo il punteggio della risposta

      this.punteggioScreening += this.listaScreening[i].xRisposte.filter(x => x.id === evt.value)[0].punteggio
    }

    let risposteNulle = 0;
    //controllo che siano state compilate tutte
    for await (const item of this.listaScreening) {
      if (this.appGen.isNullOrUndefined(item.idRispostaSelezionata)) {
        risposteNulle++
      }
    }

    //se sono compilate e il punteggio è inferiore a 11 allora mostro la restate parte della globale
    if (risposteNulle == 0 && this.punteggioScreening <= 11) {
      this.showGlobale = true;
    } else {
      this.showGlobale = false;
    }

  }

  async selectRispostaGlobale(i, evt) {
    // se nullo o undefined vuol dire che ho tolto la selezione perciò lo rimuovo dal mio array e tolgo il punteggio
    if (this.appGen.isNullOrUndefined(evt.value)) {
      //rimuovo il vecchio punteggio
      // this.valutazioneGlobale -= this.listaGlobale[i].xRisposte.filter(x => x.id === this.listaGlobale[i].idRispostaSelezionata)[0].punteggio

      this.listaGlobale[i].idRispostaSelezionata = null
    } else {

      if (!this.appGen.isNullOrUndefined(this.listaGlobale[i].idRispostaSelezionata)) {
        //rimuovo il vecchio punteggio
        // this.valutazioneGlobale -= this.listaGlobale[i].xRisposte.filter(x => x.id === this.listaGlobale[i].idRispostaSelezionata)[0].punteggio
      }

      //assegno quello nuovo
      this.listaGlobale[i].idRispostaSelezionata = evt.value

      this.arrayErroriGlobale[i] = false;
      //aggiungo il punteggio della risposta

      // this.valutazioneGlobale += this.listaGlobale[i].xRisposte.filter(x => x.id === evt.value)[0].punteggio
    }
  }



  async getQuestionarioMna() {
    await this.service.getCallRequest({ action: 'Questionario', param: this.questionario.Mna }).then(data => {

      this.listaScreening = data.screening;
      this.listaGlobale = data.globale;

      this.arrayErroriScreening = Array.from({ length: this.listaScreening.length }, (_, i) => false)
      this.arrayErroriGlobale = Array.from({ length: this.listaGlobale.length }, (_, i) => false)
    });
  }


  async getQuestionarioMnaRiepilogo() {
    await this.service.getCallRequest({ action: 'QuestionarioxPaziente', param: this.questionario.Mna, param2: this.idPaziente }).then(data => {

      this.listaScreening = data.screening;
      this.listaGlobale = data.globale;

      this.showValutazioni = true;
      this.valutazioneScreening = data.valutazioneScreening;
      this.valutazioneGlobale = data.valutazioneGlobale;
      this.valutazioneTotale = data.valutazioneTotale;
      this.descrizioneValutazione = data.descrValutazioneTotale;

      this.punteggioScreening = data.valutazioneScreening
      this.punteggioScreening = data.valutazioneScreening
      if (data.valutazioneGlobale > 0 && data.valutazioneScreening <= 11) {
        this.showGlobale = true;
      }

      this.arrayErroriScreening = Array.from({ length: this.listaScreening.length }, (_, i) => false)
      this.arrayErroriGlobale = Array.from({ length: this.listaGlobale.length }, (_, i) => false)


    });
  }

  async existQuestionario() {
    await this.service.getCallRequest({ action: 'getExistQuestionario', param: this.questionario.Mna, param2: this.idPaziente }).then(data => {
      if (data) {
        this.getQuestionarioMnaRiepilogo();
      } else {
        this.getQuestionarioMna();
      }
    });
  }



  async onSubmit() {
    let error = false;

    //controllo che siano state compilate tutte
    for (let index = 0; index < this.listaScreening.length; index++) {
      if (this.appGen.isNullOrUndefined(this.listaScreening[index].idRispostaSelezionata)) {
        this.arrayErroriScreening[index] = true;
        error = true;
      } else {
        this.arrayErroriScreening[index] = false;
      }
    }

    if (this.showGlobale) {
      for (let index = 0; index < this.listaGlobale.length; index++) {
        if (this.appGen.isNullOrUndefined(this.listaGlobale[index].idRispostaSelezionata)) {
          this.arrayErroriGlobale[index] = true;
          error = true;
        } else {
          this.arrayErroriGlobale[index] = false;
        }
      }
    }


    if (error) {
      this.notificate.error('Non sono state compilate tutte le risposte');
      return;
    }

    let obj = new Object();
    obj = {

      Screening: this.listaScreening,
      Globale: this.listaGlobale,
      IdPaziente: this.idPaziente,
      IdQuestionario: this.questionario.Mna,
      // Idrisposte: this.arrayRisposte
      SetGlobale: this.showGlobale
    }

    await this.service.postCallRequest({ action: 'RisposteXpaziente', param: obj }).then((data) => {
      this.showValutazioni = true;
      this.valutazioneScreening = data.valutazioneScreening;
      this.valutazioneGlobale = data.valutazioneGlobale;
      this.valutazioneTotale = data.valutazioneTotale;
      this.descrizioneValutazione = data.descrValutazioneTotale;

      // this.appGen.scroll('valutazioniDiv');
    });
  }



}
