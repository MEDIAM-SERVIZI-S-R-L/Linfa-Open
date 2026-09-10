import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Questionario } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';

@Component({
  selector: 'app-must',
  templateUrl: './must.component.html',
  styleUrls: ['./must.component.scss']
})
export class MustComponent implements OnInit {


  questionario = Questionario
  idPaziente: string;

  listaDomande = [];
  pesoAttuale: number;
  pesoAbituale: number;
  altezza: number;
  bmi: number;
  decremento: number;
  decrementoPonderaleVal: number;

  arrayRisposte = [];
  @Input() isRiepilogoVisita: boolean;
  valutazioneTotale: number;
  rischioMalnutrizione: string;
  showValutazioni = false;
  arrayErroriScreening;

  panelOpenState = false;


  constructor(private activateRoute: ActivatedRoute,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private notificate: SnackBarService) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.existQuestionario()

    this.getDatiPazienteVisita();
  }

  async getDatiPazienteVisita(): Promise<void> {
    const obj = {
      idPaziente : this.idPaziente,
      idVisita : null
    }
    console.log(obj);
    
    await this.service.postCallRequest({ action: 'getPazienteVisita', param: obj }).then((data) => {
      this.altezza = data.altezza;
    })
  }

  async selectRispostaScreening(i, evt) {

    // se nullo o undefined vuol dire che ho tolto la selezione perciò lo rimuovo dal mio array e tolgo il punteggio
    if (this.appGen.isNullOrUndefined(evt.value)) {
      //rimuovo il vecchio punteggio
      // this.valutazioneTotale -= this.listaDomande[i].xRisposte.filter(x => x.id === this.listaDomande[i].idRispostaSelezionata)[0].punteggio

      this.listaDomande[i].idRispostaSelezionata = null
    } else {

      if (!this.appGen.isNullOrUndefined(this.listaDomande[i].idRispostaSelezionata)) {
        //rimuovo il vecchio punteggio
        // this.valutazioneTotale -= this.listaDomande[i].xRisposte.filter(x => x.id === this.listaDomande[i].idRispostaSelezionata)[0].punteggio
      }

      //assegno quello nuovo
      this.listaDomande[i].idRispostaSelezionata = evt.value

      this.arrayErroriScreening[i] = false;
      //aggiungo il punteggio della risposta

      // this.valutazioneTotale += this.listaDomande[i].xRisposte.filter(x => x.id === evt.value)[0].punteggio
    }

  }

  calcola() {
    if (this.altezza && this.pesoAttuale) {
      const altezzam = this.altezza / 100;

      this.bmi = Math.round((this.pesoAttuale / (altezzam * altezzam)) * 100) / 100;
      const rowDomandaBmi = this.listaDomande.filter(x => x.orderNum == 1)[0];

      let punteggioBmi = 0;
      if (this.bmi > 20) {
        punteggioBmi = 0;
      }
      if (this.bmi <= 20 && this.bmi >= 18.5) {
        punteggioBmi = 1;
      }
      if (this.bmi < 18.5) {
        punteggioBmi = 2;
      }
      const row = rowDomandaBmi.xRisposte.filter(x => x.punteggio == punteggioBmi)[0];
      rowDomandaBmi.idRispostaSelezionata = row.id;
    }

    if (this.pesoAttuale && this.pesoAbituale) {
      this.decremento = (this.pesoAbituale - this.pesoAttuale) / this.pesoAbituale * 100;

      this.decremento = Math.round(this.decremento * 100) / 100;

      const rowDomandaDecremento = this.listaDomande.filter(x => x.orderNum == 2)[0];
      let punteggioDecr = 0;
      if (this.decremento < 5) {
        punteggioDecr = 0;
      }
      if (this.decremento >= 5 && this.decremento <= 10) {
        punteggioDecr = 1;
      }
      if (this.decremento > 10) {
        punteggioDecr = 2;
      }
      const row = rowDomandaDecremento.xRisposte.filter(x => x.punteggio == punteggioDecr)[0];
      rowDomandaDecremento.idRispostaSelezionata = row.id;

      this.decrementoPonderaleVal = Math.abs(this.decremento)     
    }


    this.checkRisposteVuote();
  }

  /** controllo che siano state compilate tutte */
  checkRisposteVuote() {
    for (let index = 0; index < this.listaDomande.length; index++) {
      if (this.appGen.isNullOrUndefined(this.listaDomande[index].idRispostaSelezionata)) {
        this.arrayErroriScreening[index] = true;
      } else {
        this.arrayErroriScreening[index] = false;
      }
    }
  }

  async getQuestionario() {
    await this.service.getCallRequest({ action: 'Questionario', param: this.questionario.Must }).then(data => {
      this.listaDomande = data.xDomande;
      this.arrayErroriScreening = Array.from({ length: this.listaDomande.length }, () => false)
    });
  }

  async getQuestionarioRiepilogo() {
    await this.service.getCallRequest({ action: 'QuestionarioxPaziente', param: this.questionario.Must, param2: this.idPaziente }).then(data => {

      this.showValutazioni = true;
      this.valutazioneTotale = data.valutazioneTotale;
      this.rischioMalnutrizione = data.descrValutazioneTotale;

      this.listaDomande = data.domande;

      this.arrayErroriScreening = Array.from({ length: this.listaDomande.length }, () => false)


    });
  }

  async existQuestionario() {
    await this.service.getCallRequest({ action: 'getExistQuestionario', param: this.questionario.Must, param2: this.idPaziente }).then(data => {
      if (data) {
        this.getQuestionarioRiepilogo();
      } else {
        this.getQuestionario();
      }
    });
  }



  async onSubmit() {
    let error = false;

    //controllo che siano state compilate tutte
    for (let index = 0; index < this.listaDomande.length; index++) {
      if (this.appGen.isNullOrUndefined(this.listaDomande[index].idRispostaSelezionata)) {
        this.arrayErroriScreening[index] = true;
        error = true;
      } else {
        this.arrayErroriScreening[index] = false;
      }
    }

    if (error) {
      this.notificate.error('Non sono state compilate tutte le risposte');
      return;
    }

    let obj = new Object();
    obj = {

      DomandeRisposteMust: this.listaDomande,
      IdPaziente: this.idPaziente,
      IdQuestionario: this.questionario.Must,
    }

    await this.service.postCallRequest({ action: 'InsertUpdateMustQuestionario', param: obj }).then((data) => {
      this.showValutazioni = true;
      this.valutazioneTotale = data.valutazioneTotale;
      this.rischioMalnutrizione = data.rischioMalnutrizione;

      // this.appGen.scroll('valutazioniDiv');
    });
  }



}
