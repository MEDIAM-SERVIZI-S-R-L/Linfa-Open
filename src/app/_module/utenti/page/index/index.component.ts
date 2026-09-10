import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {

  constructor(
    private backPreviousPage: Location
  ) { }

  goBack() {
    this.backPreviousPage.back()
  }
}
