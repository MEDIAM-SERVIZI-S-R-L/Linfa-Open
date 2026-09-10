import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-route',
  templateUrl: './page-route.component.html',
  styleUrls: ['./page-route.component.scss']
})
export class PageRouteComponent implements OnInit {

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

  ngOnChanges(changes: { showBackBtn: { currentValue: boolean; }; }) {
    if (!this.appGen.isNullOrUndefined(changes.showBackBtn)) {
      this.showBackBtn = changes.showBackBtn.currentValue;
    }
  }
}
