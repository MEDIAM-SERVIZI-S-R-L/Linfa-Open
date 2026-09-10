import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ChartType } from 'chart.js';
//import { Colors } from 'ng2-charts';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpStatisticheService } from 'src/app/_module/statistiche/service/http-statistiche.service';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-anamnesi-patologica-prossima',
  templateUrl: './anamnesi-patologica-prossima.component.html',
  styleUrls: ['./anamnesi-patologica-prossima.component.scss']
})
export class AnamnesiPatologicaProssimaComponent implements OnInit {

  datasource: any;
  datasourceDettaglioMacroPatologia: any;
  selectedValBtn;
  ChartOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
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
  // ChartLabels: Label[] = []
  //ChartColor: Colors[] = []
  //ChartColorDettaglio: Colors[] = []
  ChartType: ChartType = 'doughnut';
  ChartPlugins = [];
  public lineChartPlugins = [pluginAnnotations];
  public ChartLabels: string[] = [];
  public ChartData = [];
  public ChartLabelsDettaglio: string[] = [];
  public ChartDataDettaglio = [];

  formFiltri: FormGroup;

  @Input() objRequest
  @Input() dataInizio
  @Input() dataFine

  constructor(
    private service: HttpStatisticheService,
    public appGen: AppGeneralService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {

    // this.dataInizio = new Date();
    // this.dataInizio.setDate(this.dataInizio.getDate() - 14);
    // this.formFiltri = this.formBuilder.group({
    //   DataIniziale: new FormControl(this.dataInizio),
    //   DataFinale: new FormControl(this.appGen.today),
    // });

    /** La rilevazione di default */
    this.selectedValBtn = 1;
    setTimeout(() => {

      this.setMacroPatologie()
      this.getPatologiaDettaglio(this.selectedValBtn)
    }, 1000);
  }

  ngOnChanges(changes) {

    if (!this.appGen.isNullOrUndefined(changes.dataFine)) {
      this.dataFine = changes.dataFine.currentValue;
      this.getPatologiaDettaglio(1)
    }

    if (!this.appGen.isNullOrUndefined(changes.dataInizio)) {

      this.dataInizio = changes.dataInizio.currentValue;
      this.getPatologiaDettaglio(1)
    }

    if (!this.appGen.isNullOrUndefined(changes.objRequest)) {

      this.objRequest = changes.objRequest.currentValue;
      this.getPatologiaDettaglio(1)
    }


  }

  async setMacroPatologie() {

    let json = {
      DataInizio: this.dataInizio,
      DataFine: this.dataFine
    }


    let res = await this.service.getAnamanesiPatologicheProssime(json);
    if (!this.appGen.isNullOrUndefined(res)) {


      //svuoto ogni volta
      this.datasource = [];
      this.ChartLabels = [];
      this.ChartData = [];

      this.datasource = res;

      this.datasource.forEach(element => {
        this.ChartLabels.push(element.macroPatologia)
        this.ChartData.push(element.dataMacro)
      });




    }


  }


  async getPatologiaDettaglio(id) {

    this.selectedValBtn = id
    let json = {
      IdMacroPatologia: id,
      DataInizio: this.dataInizio,
      DataFine: this.dataFine,
      // Medico: this.objRequest.medico,
      // Ambulatorio: this.objRequest.ambulatorio
    }


    let res = await this.service.getDettaglioMacroPatologia(json);

    if (!this.appGen.isNullOrUndefined(res)) {

      this.datasourceDettaglioMacroPatologia = [];
      this.ChartLabelsDettaglio = [];
      this.ChartDataDettaglio = [];

      this.datasourceDettaglioMacroPatologia = res;

      this.datasourceDettaglioMacroPatologia.forEach(element => {
        this.ChartLabelsDettaglio.push(this.appGen.isNullOrUndefined(element.patologia) ? element.altro : element.patologia)
        this.ChartDataDettaglio.push(element.dataMacro)
      });

     /* this.ChartColorDettaglio = [
        {

          backgroundColor:

            this.getRandomColor(this.ChartDataDettaglio)

        }
      ]*/
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




}

