import { Component, Input, OnInit, Optional } from '@angular/core'
import moment from 'moment'
import { firstValueFrom } from 'rxjs'
import { IStatPazienteFilterToDTO } from 'src/app/_dtos/out'
import { StatisticheService } from 'src/app/_repositories/statistiche_repo.service'
import _, { constant } from 'underscore'
import { ChartConfiguration, ChartType, ChartData } from 'chart.js'
import { ChartTypeName, ChartTypes } from 'src/app/_core/helpers/enums'
import zoomPlugin from 'chartjs-plugin-zoom'
import DatalabelsPlugin from 'chartjs-plugin-datalabels'
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'app-peso-bmi',
  templateUrl: './peso-bmi.component.html',
  styleUrls: ['./peso-bmi.component.scss'],
})
export class PesoBmiComponent implements OnInit {
  isBmi = false
  textInfo = 'Caricamento dei dati'
  chartData: any
  selected: any
  pazienteId: string
  paziente;
@Optional() @Input() mapToPazientId: string = null // parametro opzionale che viene passato da recall componente nel html , serve per mappare idPaziente che si chiama diversamente nel componente padre - piani nutrizionali

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    scales: {
      x: {
        offset: true
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return value
          }
        },
        align: 'top',
      },
    },
  }
  public pieChartData

  pieChartType: ChartType = 'line'
  public pieChartPlugins = [DatalabelsPlugin]

  constructor(
    private statsHttp: StatisticheService,
    public activateRoute: ActivatedRoute
  ) {}
  async ngOnInit() {
    if(this.mapToPazientId){
      this.pazienteId = this.mapToPazientId;
    }
    else{
      this.pazienteId= this.activateRoute.snapshot.params.id
    }
    this.selected = 'any';
    this.selectedPeriod()
    //const urlParam = await firstValueFrom(this.activateRoute.params)
   /* if (urlParam.id) {
      (this.pazienteId = urlParam.id), (this.selected = 'any')
      this.selectedPeriod()
    }*/
    // Seleziono periodo di default - dalla prima visita
  }

//** Carrico dati per utente e periodo selezionato  */
  async selectedPeriod() {
    this.textInfo = 'Caricamento dei dati'
    if (!this.pazienteId) {
      this.chartData = null
      this.textInfo = 'Dati non disponibili'
    }
    let _dalAl: any[] = []
    const _periodCode = this.selected;

    //** imposto periodo da inviare al BE */
    switch (_periodCode) {
      case 'any':
        _dalAl = [null, null]

        break

      case '30':
        _dalAl = [moment().subtract(29, 'days'), moment()]

        break

      case '60':
        _dalAl = [moment().subtract(89, 'days'), moment()]
        break

      case '90':
        _dalAl = [moment().subtract(89, 'days'), moment()]

        break
      case '180':
        _dalAl = [moment().subtract(179, 'days'), moment()]

        break

      case 'thismonth':
        _dalAl = [moment().startOf('month'), moment().endOf('month')]
        break

      case 'lastmonth':
        _dalAl = [
          moment().subtract(1, 'month').startOf('month'),
          moment().subtract(1, 'month').endOf('month'),
        ]
        break
    }
    const pazienteFilter: IStatPazienteFilterToDTO = {
      dal: _dalAl[0],
      al: _dalAl[1],
      idPaziente: this.pazienteId,
    }

    const _statsPaziente: any[] = await firstValueFrom(
      this.statsHttp.getStatPaziente(pazienteFilter)
    )

    //** Se non ci sono i risultati visualizo informazione  */
    if (!_statsPaziente || !(_statsPaziente.length > 0)) {
      this.chartData = null
      this.textInfo = 'Dati non disponibili'

      return null
    }
    const _pesoData = {
      datasets: [
        {
          label: 'Peso ottimale',
          data: _.pluck(_statsPaziente, 'pesoottimale'),
        },
        {
          label: 'Peso attuale',
          data: _.pluck(_statsPaziente, 'pesoattuale'),
        },
      ],
      labels: _.pluck(_statsPaziente, 'dataVisita'),
    }
    const _bmiData = {
      datasets: [
        {
          label: 'BMI ottimale',
          data: _.pluck(_statsPaziente, 'bmiottimale'),
        },
        {
          label: 'BMI attuale',
          data: _.pluck(_statsPaziente, 'bmiattuale'),
        },
      ],
      labels: _.pluck(_statsPaziente, 'dataVisita'),
    }

    this.chartData = this.isBmi ? _bmiData : _pesoData


  }

}
