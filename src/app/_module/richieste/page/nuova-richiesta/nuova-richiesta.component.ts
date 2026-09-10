import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-nuova-richiesta',
  templateUrl: './nuova-richiesta.component.html',
  styleUrls: ['./nuova-richiesta.component.scss']
})
export class NuovaRichiestaComponent {

  calendarioRichieste = true;

  constructor(
    private router: Router
  ) { }

  backToPrevious() {
    this.router.navigate(['app/richieste']);
  }

}
