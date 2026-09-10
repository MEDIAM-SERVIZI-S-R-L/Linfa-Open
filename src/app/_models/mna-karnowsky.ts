import {
  IQuestionarioBaseDTO,
  INrsQuestion,
  INutritionalRiskScreeningDTO,
  INrsAnswersDTO,
  IPrescreeningAnswer,
} from '../_dtos/in'

interface IQuestionarioDomandeBase {
  id: number
  domanda: string
  orderNum: number
  selected: boolean
  fe?: boolean
}

/**
 * Classe base per la gestione generica del Questionario
 */
export class QuestionarioDomandeBase implements IQuestionarioDomandeBase {
  id: number
  //  idQuestionario: number
  domanda: string
  orderNum: number
  selected = false
  fe?: boolean

  /**
   * Construisco nuovo obj dal DTO
   */
  constructor(item: IQuestionarioBaseDTO) {
    this.domanda = item.domanda
    this.id = item.id
    // this.idQuestionario= item.idQuestionario;
    this.orderNum = item.orderNum
  }
}
/**
 * Interfaccia che espande IQuestionarioDomandeBase ma senza proprietà orderNum
 */
interface IQuestionarioNRS extends Omit<IQuestionarioDomandeBase, 'orderNum'> {
  punteggio: number
  livello: string
}

/**
 * Oggetto usato per creazione della tabella contiene le domande e il punteggio per tutte le due tipi di tabelle
 */
export class QuestionarioNRS implements IQuestionarioNRS {
  punteggio: number
  livello: string
  id: number
  domanda: string
  selected = false
  fe?: boolean

  /**
   * Construisco nuovo obj dal DTO
   */
  constructor(item: INrsQuestion) {
    this.domanda = item.descrizione
    this.id = item.id
    this.livello = item.livello
    this.punteggio = item.punteggio
  }
}
interface INutritionalRiskScreening {
  statoNutrizionale: QuestionarioNRS[]
  patologia: QuestionarioNRS[]
}


/** Oggetto datasource ce contiene array di valori per tue tabelle  */
export class NutritionalRiskScreening implements INutritionalRiskScreening {
  statoNutrizionale: QuestionarioNRS[]
  patologia: QuestionarioNRS[]

  constructor(item: INutritionalRiskScreeningDTO) {
    this.statoNutrizionale=[];
    this.patologia= [];
    const x = item as INutritionalRiskScreeningDTO

    x.statoNutrizionale?.forEach((item) => {
      this.statoNutrizionale?.push(new QuestionarioNRS(item))
    })

    x.patologia?.forEach((item) => {
      this.patologia?.push(new QuestionarioNRS(item))
    })
  }
}


 interface INrsPatientAnswers {

  idRispostaNRS_StatoNutrizionale: number
  idRispostaNRS_Patologia: number| null
  rispostePrescreening: number[]
  punteggioTotale: number,

}

/**
 * Risposte del paziente salvate nel DB (prende dal API)
 */

export class NrsPatientAnswers implements INrsPatientAnswers{

  idRispostaNRS_StatoNutrizionale: number
  idRispostaNRS_Patologia: number | null
  rispostePrescreening: number[]
  punteggioTotale: number

  constructor(item: INrsAnswersDTO){
   this.rispostePrescreening= [];
   this.idRispostaNRS_Patologia=item.nrs?item.nrs.idNutritionalScreeningPatologia: null;
   this.idRispostaNRS_StatoNutrizionale=item.nrs?item.nrs.idNutritionalScreeningStatoNutrizionale: null
   this.punteggioTotale= item.nrs?item.nrs.punteggioTotale: null


   item.preScreening?.forEach((item) => {
     this.rispostePrescreening.push(item.idDomanda)
   })
  }

}
