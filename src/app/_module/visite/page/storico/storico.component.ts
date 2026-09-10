import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-storico',
  templateUrl: './storico.component.html',
  styleUrls: ['./storico.component.scss']
})
export class StoricoComponent implements OnInit {

  ricercaParam;

  constructor(private router: Router,
    private appGen: AppGeneralService
  ) { }

  ngOnInit() {
    var retrievedObjectFromCalendario = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!(retrievedObjectFromCalendario == null || retrievedObjectFromCalendario == undefined || retrievedObjectFromCalendario == '')) {
      this.ricercaParam = JSON.parse(retrievedObjectFromCalendario);
    }
  }

  backToPrevious() {

    if (!this.appGen.isNullOrUndefined(this.ricercaParam)) {
      if (this.ricercaParam.fromStorico) {

        this.router.navigate(['app/visite']);
      }
    } else {
      this.router.navigate(['app/pazienti']);

    }
  }

}
