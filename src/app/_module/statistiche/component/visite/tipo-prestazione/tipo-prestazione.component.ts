import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChartType } from 'chart.js';
//import { Colors } from 'ng2-charts';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { HttpStatisticheService } from 'src/app/_module/statistiche/service/http-statistiche.service';

@Component({
  selector: 'app-tipo-prestazione',
  templateUrl: './tipo-prestazione.component.html',
  styleUrls: ['./tipo-prestazione.component.scss']
})
export class TipoPrestazioneComponent implements OnInit {

  datasource: any;
  datasourceDettaglioMacroPatologia: any;
  selectedValBtn;
  ChartOptions: any = {
    legend: {
      display: true,
      position: 'left',
      // align:'start',


      labels: {
        fontColor: 'black',
        fontSize: 14,
        // usePointStyle:true
      }
    }
  }
  //ChartColor: Colors[] = []
  //ChartColorDettaglio: Colors[] = []
  ChartType: ChartType = 'doughnut';
  ChartPlugins = [];
  public lineChartPlugins = [pluginAnnotations];
  public ChartLabels: string[] = [];
  public ChartData = [];


  @Input() dataInizio
  @Input() dataFine

  constructor(
    private service: HttpStatisticheService,
    public appGen: AppGeneralService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    /** La rilevazione di default */
    setTimeout(() => {

      this.getTipoVisite()
    }, 1000);
  }

  ngOnChanges(changes) {

    if (!this.appGen.isNullOrUndefined(changes.dataFine)) {
      this.dataFine = changes.dataFine.currentValue;
      this.getTipoVisite()
    }

    if (!this.appGen.isNullOrUndefined(changes.dataInizio)) {

      this.dataInizio = changes.dataInizio.currentValue;
      this.getTipoVisite()
    }
  }

  async getTipoVisite() {

    let obj = {

      DataInizio: this.dataInizio,
      DataFine: this.dataFine
    }

    let res = await this.service.getTipoVisite(obj);

    if (!this.appGen.isNullOrUndefined(res)) {


      //svuoto ogni volta
      this.datasource = [];
      this.ChartLabels = [];
      this.ChartData = [];

      this.datasource = res;

      this.datasource.forEach(element => {

        this.ChartLabels.push(element.tipoPrestazione)
        this.ChartData.push(element.visite)
      });




    }


  }

  getRandomColor(data) {
    var res = [];
    while (res.length !== data.length) {
      var number = Math.floor(0x1000000 * Math.random()).toString(16);
      let color = '#' + ('000000' + number).slice(-6);

      if (res.indexOf(color) == -1) {

        res.push(color)
      }



    }
    return res;
  }

  /** serve per cambiare i dati se la data è stata cambiata  */
  changeData() {
  }


}

