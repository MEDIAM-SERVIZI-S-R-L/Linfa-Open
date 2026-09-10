import { Component } from '@angular/core';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-piani-nutrizionali',
  templateUrl: './piani-nutrizionali.component.html',
  styleUrls: ['./piani-nutrizionali.component.scss']
})
export class PianiNutrizionaliComponent {

  constructor(
    public appGen: AppGeneralService,
    private backPreviousPage: Location,
  ) { }


  backToPrevious() {
    this.backPreviousPage.back()
  }

}
