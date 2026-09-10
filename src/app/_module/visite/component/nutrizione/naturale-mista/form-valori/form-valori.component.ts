import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-form-valori',
  templateUrl: './form-valori.component.html',
  styleUrls: ['./form-valori.component.scss']
})
export class FormValoriComponent implements OnInit {
  formValoriDieta: FormGroup;
  idVisita;
  @Input() editProdotti;
  @Input() isRiepilogoVisita


  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
  ) { }

  ngOnInit() {
    this.formValoriDieta = this.formBuilder.group({
      kcal: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }, Validators.required),
      azoto: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }, Validators.required),
      proteine: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }, Validators.required),
      apportoIdrico: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }, Validators.required),
      carboidrati: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }, Validators.required),
      lipidi: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }, Validators.required),
      diagnosi: new FormControl({ value: '', disabled: !this.editProdotti || this.isRiepilogoVisita }),
    });

    this.activateRoute.queryParams.subscribe(params => {
      if (!(this.appGen.isNullOrUndefined(params.vnutr))) {
        this.idVisita = params.visit;
        if (!(this.appGen.isNullOrUndefined(this.idVisita))) {
          this.getDatiNutizioneNaturale();
        }
      }
    });

  }

  async getDatiNutizioneNaturale() {
    await this.service.getCallRequest({ action: 'getNutrizionePrecompiled', param: this.idVisita }).then((data) => {
      this.formValoriDieta.get('kcal').setValue(data.kcal);
      this.formValoriDieta.get('proteine').setValue(Math.round(data.proteine));
      this.formValoriDieta.get('azoto').setValue(Math.round(data.azoto));
      this.formValoriDieta.get('apportoIdrico').setValue(data.apportoIdrico);
      this.formValoriDieta.get('carboidrati').setValue(Math.round(data.carboidrati));
      this.formValoriDieta.get('lipidi').setValue(Math.round(data.lipidi));
      this.formValoriDieta.get('diagnosi').setValue(data.diagnosi);
    })
  }

  ngOnChanges(changes) {
    this.editProdotti = changes.editProdotti.currentValue;
    this.isRiepilogoVisita = this.appGen.isNullOrUndefined(changes.isRiepilogoVisita) ? false : changes.isRiepilogoVisita.currentValue;
  }

  async onSubmit() {
    let obj = {
      Kcal: this.formValoriDieta.get('kcal').value,
      Proteine: this.formValoriDieta.get('proteine').value,
      Azoto: this.formValoriDieta.get('azoto').value,
      ApportoIdrico: this.formValoriDieta.get('apportoIdrico').value,
      Diagnosi: this.formValoriDieta.get('diagnosi').value,
    }

    await this.service.postCallRequest({ action: 'updateAlimentazioneNaturale', param: obj });
  }
}
