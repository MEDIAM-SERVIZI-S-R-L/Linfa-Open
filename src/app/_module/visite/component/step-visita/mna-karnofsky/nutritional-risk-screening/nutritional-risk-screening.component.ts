import { Component, Input, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, FormControl } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute } from '@angular/router'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { Questionario } from 'src/app/_core/helpers/enums'
import { MnaKarnowskyService } from 'src/app/_repositories/mna-karnowsky_repo.service'
import {
  NrsPatientAnswers,
  NutritionalRiskScreening,
  QuestionarioDomandeBase,
  QuestionarioNRS,
} from 'src/app/_models/mna-karnowsky'
import { firstValueFrom } from 'rxjs'
import _ from 'underscore'
import { NrsToDTO } from 'src/app/_dtos/out'

@Component({
  selector: 'app-nutritional-risk-screening',
  templateUrl: './nutritional-risk-screening.component.html',
  styleUrls: ['./nutritional-risk-screening.component.scss'],
})
export class NutritionalRiskScreeningComponent implements OnInit {
  @Input() isRiepilogoVisita: boolean
  idPaziente: string
  questionario = Questionario
  domande: QuestionarioDomandeBase[] = null
  showTable = false

  nrsQuestion = {
    statoNutrizionale: new MatTableDataSource<QuestionarioNRS>(null),
    patologia: new MatTableDataSource<QuestionarioNRS>(null),
  }
  punteggioTotale: number | null = null
  disableSaveBtn = true
  dataViewsColumns = ['livello', 'domanda', 'pulsanti']

  constructor(
    public activateRoute: ActivatedRoute,
    private nrsHttp: MnaKarnowskyService
  ) {}

  ngOnInit() {
    this.activateRoute.params.subscribe(async (data: any) => {
      this.idPaziente = data.id

      this.loadNrs()
    })
  }

  //#region zajac
  /*
   * Funzione che carnica le domande del questionario e le risposte se esistono
   */
  async loadNrs() {
    this.domande = await firstValueFrom(
      this.nrsHttp.getDomandeQuestionario(Questionario.NRS.toString())
    )
    this.loadNrsPatient()
  }

  async loadNrsPatient() {
    const patientAnswers = await firstValueFrom(
      this.nrsHttp.getNrsPaziente(this.idPaziente)
    )
    // Se selezionato un prescreening richiamo le domande
    if (
      patientAnswers.rispostePrescreening &&
      patientAnswers.rispostePrescreening.length > 0
    ) {
      let count = 0
      for await (const item of patientAnswers.rispostePrescreening) {
        count++

        const selectedPre = _.findWhere(this.domande, { id: item })
        selectedPre.selected = true
      }
      if (count > 0) {
        this.checkSelected(patientAnswers)
      }
    }
  }
  /**
   * Prendo count risposte selezionate se datasource è pieno se no richiamo Api
   */
  async checkSelected(patientAnswer: NrsPatientAnswers = null) {
    this.showTable = _.where(this.domande, { selected: true }).length > 0 ? true : false

    //** Se selezionato e non c'e' dataSource faccio la chiamata  */
    if (
      this.showTable &&
      !this.nrsQuestion.statoNutrizionale.data &&
      !this.nrsQuestion.patologia.data
    ) {
      const response: NutritionalRiskScreening = await firstValueFrom(
        this.nrsHttp.getNutritionalRiskScreening()
      )
      this.nrsQuestion.statoNutrizionale.data = response.statoNutrizionale
      this.nrsQuestion.patologia.data = response.patologia
    }
    if (patientAnswer) {
     const x =  _.findWhere(this.nrsQuestion.statoNutrizionale.data, {
        id: patientAnswer.idRispostaNRS_StatoNutrizionale,
      })
      x?x.selected = true:null;
      const y =_.findWhere(this.nrsQuestion.patologia.data, {
        id: patientAnswer.idRispostaNRS_Patologia,
      })
      y?y.selected = true: null;

      this.punteggioTotale = patientAnswer.punteggioTotale
    }
  }

  /**
   * Parte quando faccio check su checkbox
   * @param item - selezionata risposta del prescreening
   * @param $event - valore della selezione true/false
   */
  selectAnswer(item, $event) {
    item.selected = $event.checked
    this.checkSelected()
  }

  /**
   *
   * @param dataType - valori 1 - statoNutrizionale ,2-  patologia nel this.nrsQuestion
   * @param item - riga selezionata
   * @param $event - selezionato true/false
   */
  async selectStatoNutrizionale(dataType: number, item: QuestionarioNRS, $event) {
    let _dataSet = null

    switch (dataType) {
      case 1:
        _dataSet = this.nrsQuestion.statoNutrizionale.data
        break
      case 2:
        _dataSet = this.nrsQuestion.patologia.data
        break
      default:
        break
    }
    // tolgo la selezione a tutti selezionati ( dovrebbe essere sempre 1 )
    for await (const x of _.where(_dataSet, { selected: true })) {
      x.selected = false
    }
    // selezionato elemento  ( dovrebbe essere sempre 1 )
    for await (const x of _.where(_dataSet, { id: item.id })) {
      x.selected = $event.checked
    }
    // check se posso abilitare il pulsante o no
    this.checkSaveBtn()
  }

  /**
   * Funzione che verifica se abbiamo selezionato una risposta per ogni tipo di tabella se no pulsante salva disabilitato
   */
  checkSaveBtn() {
    if (
      _.where(this.nrsQuestion.statoNutrizionale.data, { selected: true }).length > 0 &&
      _.where(this.nrsQuestion.patologia.data, { selected: true }).length > 0
    ) {
      this.disableSaveBtn = false
    } else {
      this.disableSaveBtn = true
    }
  }

  /**
   * Salvataggio del Nrs
   */
  async saveNewNRS() {
    try {
      // prendo le risposte preScreening
      const preScreeningAnswers = _.where(this.domande, { selected: true }).map((x) => {
        return x.id
      })
      // stato nutrizionale
      const statoNutrizionalAnswerse = _.where(this.nrsQuestion.statoNutrizionale.data, {
        selected: true,
      })[0].id
      // parte delle patologie
      const patologiaAnswer = _.where(this.nrsQuestion.patologia.data, {
        selected: true,
      })[0].id

      const nrsAnswers = new NrsToDTO(
        this.idPaziente,
        statoNutrizionalAnswerse,
        patologiaAnswer,
        preScreeningAnswers
      )
      // invio al API
      this.punteggioTotale = await firstValueFrom(this.nrsHttp.postNrs(nrsAnswers))
    } catch (error) {
     console.error(error)
    }
  }

  //#endregion
}
