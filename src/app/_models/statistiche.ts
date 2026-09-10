import {IStatsPazienteDTO} from '../_dtos/in'
/* eslint-disable no-prototype-builtins */
interface IGenericWidgetTab {
  descrizione: string
  fe: boolean | null
}

interface IWidget extends IGenericWidgetTab {
  titolo: string
  sottotitolo: string
}

interface IWidgetStats extends IWidget {
  chart: IChartData2
  idXTipiGrafici: number
  descrXTipiGrafici: string
}

export interface ITabStats extends IGenericWidgetTab {
  widgets: IWidgetStats[]
}

/**
 *
 * Widget con stats
 */
export class WidgetStats implements IWidgetStats {
  titolo: string
  sottotitolo: string
  descrizione: string
  chart: IChartData2
  idXTipiGrafici: number
  descrXTipiGrafici: string
  fe: boolean
  /**
   *
   */
  constructor(item: IWidgetStats | IWidgetDTO) {
    // super();
    if (!item.hasOwnProperty('fe')) {
      const x = item as IWidgetDTO

      this.descrizione = x.descr
      this.titolo = x.titolo
      this.idXTipiGrafici = x.idXTipiGrafici
      this.descrXTipiGrafici = x.descrXTipiGrafici
      this.sottotitolo = x.sottoTitolo
      this.chart = new ChartData2(x.statisticObj)


    }
  }

  get widgetType() {
    switch (this.idXTipiGrafici) {
      case 1:
        return ChartTypeName.Pie
        break

      case 2:
        return ChartTypeName.Label
        break

        case 3:
        return ChartTypeName.Doughnut
        break
      case 101:
        return ChartTypeName.Line
        break
      case 102:
        return ChartTypeName.Bar
        break
      case 103:
        return ChartTypeName.Radar
        break
      case 104:
        return ChartTypeName.Polar
        break


      case 1000:
        return ChartTypeName.Test
        break
      default:
        return ChartTypes.Pie
        break
    }
  }

  get chartData() {
    const _label = []
    const _count = []


    return {
      label: _label,
      count: _count,
    }
  }
}

/**
 * Tab con widget e stats
 */
export class TabStats implements ITabStats {
  widgets: WidgetStats[]
  titolo: string
  descrizione: string
  fe: boolean | null

  /**
   *
   */
  constructor(item: ITabStats | ITabDTO) {
    if (!item.hasOwnProperty('fe')) {
      const x = item as ITabDTO
      this.descrizione = x.descr
      this.widgets = []

      x.widgetobj?.forEach((item) => {
        this.widgets?.push(new WidgetStats(item))
      })

      this.fe = null
    }
  }
}

interface IChartData {
  label: string
  count: number
  fe?: boolean | null
}

interface IChartData2{
  labels: string[],
  datasets:IChartDataset[]
}

interface IChartDataset{
  label: string ,
  data: string[] | number[]
}

export class ChartDataset implements IChartDataset{
  label: string
  data: string[] | number[]
/**
 *
 */
constructor(item:IChartDataset | IGenericStatisticDatasetDTO) {
 // super();
  this.data= item.data;
  this.label= item.label
}
}



export  class ChartData2 implements IChartData2{
  labels: string[]
  datasets: IChartDataset[]
  /**
   *
   */
  constructor(item: IChartData2 | IGenericStatisticDTO) {

   this.labels= item.labels;
   this.datasets= item.datasets;


  }
}

export class ChartData implements IChartData {
  label: string
  count: number
  fe?: boolean | null
  /**
   *
   */
  constructor(item: IChartData | IGenericStatisticDTO) {

  }
}
import { ChartTypeName, ChartTypes } from '../_core/helpers/enums'

/******************************** */

import {
  IQuestionarioBaseDTO,
  INrsQuestion,
  INutritionalRiskScreeningDTO,
  INrsAnswersDTO,
  IPrescreeningAnswer,
  ITabDTO,
  IWidgetDTO,
  IGenericStatisticDTO,
  IGenericStatisticDatasetDTO,
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





export class StatsPaziente implements IStatsPazienteDTO{
  pesoattuale: number
  pesoottimale: number
  bmiattuale: number
  bmiottimale: number
  dataVisita: Date

  constructor(item:StatsPaziente | IStatsPazienteDTO){
    this.pesoattuale;
    this.pesoottimale;
    this.bmiattuale;
    this.bmiottimale;
    this.dataVisita;
  }

  //get()

}


