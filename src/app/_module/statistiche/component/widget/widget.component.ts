import { Component, Input, OnInit } from '@angular/core'
import { ChartData as Stats, WidgetStats } from 'src/app/_models/statistiche'
import { ChartConfiguration, ChartType, ChartData } from 'chart.js'
import { ChartTypeName, ChartTypes } from 'src/app/_core/helpers/enums'
import zoomPlugin from 'chartjs-plugin-zoom'
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import Swal from "sweetalert2";
@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent implements OnInit {
  dataset
  showChart = true
  @Input() widget: WidgetStats
  labels: string[] = []
  count:string;
  data: number[] = []
  ChartTypeName = ChartTypeName

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
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
      },
    },
  }
  public pieChartData

  pieChartType: ChartType
  public pieChartPlugins = [DatalabelsPlugin]

  constructor() {}

  ngOnInit() {


    this.chartData()
  }

  chartData() {

    const _chart = this.widget.chartData

    if (this.widget.widgetType != ChartTypeName.Test) {
      switch (this.widget.widgetType) {
        case ChartTypeName.Label:

          this.count = this.widget.chart.datasets[0].data[0] ? this.widget.chart.datasets[0].data[0].toString() : "-";
          break
          this.widget.widgetType
        default:



          this.pieChartType =this.widget.widgetType.toString().toLowerCase() as ChartType

          break
      }

      this.showChart = true
    }
  }

  openHelp(testo:string){
    Swal.fire({
      icon: "info",
      title: testo,

    });
  }

  //[type]="dataset[i]?.chartType" [options]="barChartOptions "
}
