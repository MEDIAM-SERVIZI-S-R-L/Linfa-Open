import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Ruoli } from 'src/app/_core/helpers/enums';
import { HttpStatisticheService } from 'src/app/_module/statistiche/service/http-statistiche.service';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  formFiltri: FormGroup;
  listaMedici
  listaAmbulatori
  dataFineModel
  dataInizioModel
  obj

  isExpanded = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    public appGen: AppGeneralService,
    private router: Router,
    private formBuilder: FormBuilder,
    private service: HttpStatisticheService,

  ) {

  }

  ngOnInit() {

    this.getListaAmbulatori();
    this.getListaMedici();

    // this.formFiltri = this.formBuilder.group({
    //   dataInizio: new FormControl(''),
    //   dataFine: new FormControl(''),
    //   medico: new FormControl(''),
    //   ambulatorio: new FormControl(''),
    // });
    this.impostaData()


  }

  changeData() {
    // this.obj = {
    //   dataInizio: this.formFiltri.get('dataInizio').value,
    //   dataFine: this.formFiltri.get('dataFine').value,
    //   medico: this.formFiltri.get('medico').value,
    //   ambulatorio: this.formFiltri.get('ambulatorio').value,
    // }

    // this.anamnesiProssima.getPatologiaDettaglio(1)
    // this.tipoPrestazioneComponent.getTipoVisite();
    // this.pazientiComponent.getEtaPazienti();
  }

  resizeIframe(frame) {
    frame.style.height = document.getElementById("idIframe");
    frame.style.height = frame.contentWindow.document.body.scrollHeight + 'px';
  }

  async getListaAmbulatori() {
    await this.service.getListaAmbulatori().then(data => {
      this.listaAmbulatori = data;
    });
  }
  async getListaMedici() {
    let obj = {
      tipoUtente: Ruoli.Medico
    }

    await this.service.getUtenti(obj).then(data => {
      this.listaMedici = data;
    });
  }
  impostaData() {
    this.dataInizioModel = new Date();
    this.dataInizioModel.setDate(this.dataInizioModel.getDate() - 30);
    this.dataFineModel = new Date()
  }

  resetta() {
    this.impostaData();
  }

  expandCollapseAll() {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      this.accordion.openAll();
    } else {
      this.accordion.closeAll();
    }
  }
}
