import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatTableDataSource } from '@angular/material/table';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-last-followup',
  templateUrl: './last-followup.component.html',
  Urls: ['./last-followup.component.scss']
})
export class LastFollowupComponent implements OnInit {

  formLastFollowUp: FormGroup;
  @Input() idVisita;
  prodottiSelezionatiLastFollowUp;

  prodottiDataSource = new MatTableDataSource<any>();
  prodottiViewsColumns = ["prodotto", "quantita", "kcal", "proteine", "azoto", "percentuale"]

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
  ) { }

  ngOnInit() {
    this.formLastFollowUp = this.formBuilder.group({
      al: new FormControl(this.appGen.today),
      peso: new FormControl(''),
      kcal: new FormControl(''),
      azoto: new FormControl(''),
      proteine: new FormControl(''),
      velocitaSomministrazione: new FormControl(''),
      apportoIdrico: new FormControl(''),
      pesoOttimale: new FormControl(''),
      bmiOttimale: new FormControl(''),
      dataFollowup: new FormControl(''),
    });

    this.getLastFollowUpInitial();
  }


  get formLast() { return this.formLastFollowUp.controls; }

  async searchFollowup(evt) {
    //
    let obj = {
      idVisita: this.idVisita,
      DataFollowUp: this.appGen.convertToLocaleDate(evt)
    };
    this.appGen.loadingPanel.show();
    await this.service.postCallRequest({ action: 'lastfollowup', param: obj }).then(data => {
      this.setForm(data);
      this.appGen.loadingPanel.hide();
    });
  }

  async getLastFollowUpInitial() {
    let obj = {
      IdVisita: this.idVisita
    };

    await this.service.postCallRequest({ action: 'lastfollowup', param: obj }).then(data => {
      this.setForm(data);
    });
  }

  setForm(data) {
    this.formLastFollowUp.get("bmiOttimale").setValue(data.bmi);
    this.formLastFollowUp.get("dataFollowup").setValue(data.data);
    this.formLastFollowUp.get("peso").setValue(data.peso);
    this.formLastFollowUp.get("kcal").setValue(data.kcal);
    this.formLastFollowUp.get('azoto').setValue(data.azoto);
    this.formLastFollowUp.get('proteine').setValue(data.proteine);
    this.formLastFollowUp.get('apportoIdrico').setValue(data.apportoIdrico);
    this.formLastFollowUp.get('velocitaSomministrazione').setValue(data.velocitaSomministrazione);
    this.prodottiSelezionatiLastFollowUp = data.prodotti;
  }

}
