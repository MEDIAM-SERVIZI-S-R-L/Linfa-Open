import { Component, OnInit, ViewChild } from '@angular/core';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { FormPermessiComponent } from '../../component/form-permessi/form-permessi.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {



  @ViewChild('accordionPanel') accordionPanel;
  @ViewChild(FormPermessiComponent, { static: false }) public FormPermessiComponent: FormPermessiComponent;


  constructor(
    public appGen: AppGeneralService,

  ) { }
}
