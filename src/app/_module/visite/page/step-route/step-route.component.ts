import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-step-route',
  templateUrl: './step-route.component.html',
  styleUrls: ['./step-route.component.scss']
})
export class StepRouteComponent implements OnInit {

  showBackBtn = false;

  constructor(
    public appGen: AppGeneralService,
    private backPreviousPage: Location,
    private route: ActivatedRoute) { }

  ngOnInit() {

    this.showBackBtn = this.route.snapshot.data['showBackBtn'];

  }
  backToPrevious() {
    this.backPreviousPage.back()
  }

  ngOnChanges(changes) {
    if (!this.appGen.isNullOrUndefined(changes.showBackBtn)) {
      this.showBackBtn = changes.showBackBtn.currentValue;
    }
  }
}
