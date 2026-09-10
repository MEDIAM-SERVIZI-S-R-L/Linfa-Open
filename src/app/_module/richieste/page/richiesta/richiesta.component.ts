import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-richiesta',
  templateUrl: './richiesta.component.html',
  styleUrls: ['./richiesta.component.css']
})
export class RichiestaComponent {

  constructor(private backPreviousPage: Location) { }

  backToPrevious() {
    this.backPreviousPage.back();
  }
}
