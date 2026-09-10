import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
//import { ChartType, ChartDataSets } from 'chart.js';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import moment from 'moment';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
//import { Label, Colors } from 'ng2-charts';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { firstValueFrom } from 'rxjs';
import { DocumentiService } from 'src/app/_repositories/documenti_repo.service';


@Component({
  selector: 'app-chart-followup',
  templateUrl: './chart-followup.component.html',
  styleUrls: ['./chart-followup.component.scss']
})
export class ChartFollowupComponent implements OnInit {

  datasource: any;
  selectedValBtn: string;
  followUpChartOptions: any = {
    legend: { display: true, labels: { fontColor: 'black' } }
  }

  followUpChartPlugins = [];
  public lineChartPlugins = [pluginAnnotations];





  formFiltriFollowUp: FormGroup;
  dataInizio;
  dataFine;

  @Input() idVisita;

  @ViewChild("theCanvas") theCanvas


  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private formBuilder: FormBuilder,
    private report: ReportService,
    private documentHttp: DocumentiService
  ) { }

  ngOnInit() {

    this.dataInizio = new Date();
    this.dataInizio.setDate(this.dataInizio.getDate() - 14);
    this.formFiltriFollowUp = this.formBuilder.group({
      DataIniziale: new FormControl(this.dataInizio),
      DataFinale: new FormControl(this.appGen.today),
    });

    /** La rilevazione di default */
    this.selectedValBtn = "PESO,Peso";
    setTimeout(() => {

      this.setProprieta(this.selectedValBtn)
    }, 1000);
  }


  async setProprieta(_property) {

    this.selectedValBtn = _property

    let _value = _property.split(",");

    let dalTmp = this.formFiltriFollowUp.get('DataIniziale').value;
    let alTmp = this.formFiltriFollowUp.get('DataFinale').value;

    let json = {
      "IdVisita": this.idVisita,
      "Dal": this.appGen.convertToLocaleDate(dalTmp),
      "Al": this.appGen.convertToLocaleDate(alTmp),
      "CodiceTipo": _value[0],
    }


    this.datasource = await this.service.postCallRequest({ action: 'followuprangedate', param: json });



    // per colori delle serie
    switch (_value[0]) {
      case 'BMI':
       // this.followUpChartColor = [{ borderColor: '#ff9347' }]

        this.followUpChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                max: 50,
                stepSize: 5,
              }
            }]
          },

        };

        break;

      case 'PESO':
       // this.followUpChartColor = [{ borderColor: '#ff2d2d' }]
        this.followUpChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                max: 120,
                stepSize: 10,
              }
            }]
          },

        };

        break;

      case 'KCAL':


        this.followUpChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                max: 3000,
                stepSize: 250,
              }
            }]
          },

        };

        break;


      default:

        break;
    }


  }
  /** serve per cambiare i dati se la data è stata cambiata  */
  changeData() {
    this.setProprieta(this.selectedValBtn)
  }
  async stampaReport() {
    let dalTmp = this.formFiltriFollowUp.get('DataIniziale').value;
    let alTmp = this.formFiltriFollowUp.get('DataFinale').value;

    let json = {
      IdVisita: this.idVisita,
    }

    const data = await firstValueFrom(this.documentHttp.getRefertoVisita(this.idVisita));

  }

}
function html2canvas(arg0: HTMLElement, arg1: { onrendered: (canvas: any) => void; }) {
  throw new Error('Function not implemented.');
}

