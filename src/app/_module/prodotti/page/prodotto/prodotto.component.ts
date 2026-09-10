import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prodotto',
  templateUrl: './prodotto.component.html',
  styleUrls: ['./prodotto.component.scss']
})
export class ProdottoComponent {

  constructor(
    private backPreviousPage: Location) { }


  backToPrevious(): void {
    this.backPreviousPage.back()
  }
}
