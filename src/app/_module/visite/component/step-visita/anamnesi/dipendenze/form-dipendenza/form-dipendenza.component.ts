import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-dipendenza',
  templateUrl: './form-dipendenza.component.html',
  styleUrls: ['./form-dipendenza.component.scss']
})
export class FormDipendenzaComponent implements OnInit {

  formDipendenza: FormGroup;
  idPaziente;
  listaDipendenze;
  isRiepilogo = false;
  idDipendenza;
  listaMisura;
  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private backPreviousPage: Location) { }

  ngOnInit() {
    sessionStorage.setItem('box', 'dipendenze');

    this.idPaziente = this.activateRoute.snapshot.paramMap.get('idpaziente');


    this.idDipendenza = this.activateRoute.snapshot.paramMap.get('id');
    if (!(this.idDipendenza == null || this.idDipendenza == undefined || this.idDipendenza <= '')) {
      this.riepilogoForm(this.idDipendenza);
    }

    this.formDipendenza = this.formBuilder.group({
      dipendenza: new FormControl('', Validators.required),
      descrizione: new FormControl(''),
      quantita: new FormControl('', [Validators.min(0), Validators.max(9999)]),
      misura: new FormControl(''),
      dal: new FormControl(''),
      al: new FormControl(''),
      note: new FormControl(''),
    });

    this.getListaDipendenze();
    this.getlistaMisura();
  }



  clearDate(event: { stopPropagation: () => void; }, from) {
    event.stopPropagation();
    if (from == 1) {
      this.formDipendenza.get('dal').reset();
    }
    if (from == 2) {
      this.formDipendenza.get('al').reset();
    }

  }


  async getListaDipendenze() {
    await this.service.getCallRequest({ action: 'dipendenze' }).then(data => {
      this.listaDipendenze = data;
    });
  }
  async getlistaMisura() {
    await this.service.getCallRequest({ action: 'unitamisura' }).then(data => {
      this.listaMisura = data;
    });
  }

  async onSubmit(exit) {
    if (this.formDipendenza.invalid) {
      this.appGen.validateAllFormFields(this.formDipendenza);
      return;
    }

    let dipendenza = new Object();


    dipendenza = {
      Quantita: this.formDipendenza.get("quantita").value,
      Dal: this.formDipendenza.get("dal").value,
      Al: this.formDipendenza.get("al").value,
      IdDipendenza: this.formDipendenza.get("dipendenza").value,
      IdUnitaMisura: this.formDipendenza.get("misura").value,
      Descrizione: this.formDipendenza.get("descrizione").value,
      Id: (this.idDipendenza === undefined || this.idDipendenza === null) ? 0 : this.idDipendenza

    }

    const obj = {
      Dipendenza: dipendenza,
      IdPaziente: this.idPaziente
    }

    await this.service.postCallRequest({ action: 'insertUpdateDipendenza', param: obj }).then(() => {
      if (exit) {
        this.backPreviousPage.back()
      } else {
        this.formDipendenza.reset()
      }
    });


  }

  required = false;
  selectDipendenza(val) {

    //ricerco la dipendenza specifica anzichè mettere secco l'id per evitare che in installazioni diversi le dipendenze vengano caricate in ordine diverso quindi avendo ID diverse
    const dipendenza = this.listaDipendenze.filter(c => c.id == val)[0];

    if (!this.appGen.isNullOrUndefined(dipendenza) && dipendenza.dipendenza.toLowerCase() === 'altro') {
      this.formDipendenza.controls.descrizione.setValidators([Validators.required])
      this.required = true;
    } else {
      this.formDipendenza.controls.descrizione.clearValidators()
      this.required = false;
    }
    this.formDipendenza.updateValueAndValidity();
  }

  riepilogoForm(idDipendenza) {
    this.isRiepilogo = true;

    this.service.getCallRequest({ action: 'getDipendenza', param: idDipendenza }).then(data => {
      this.setValueForm(data).then(async () => {

        this.getListaDipendenze()
      });
    });
  }
  async setValueForm(data) {
    this.formDipendenza.controls.quantita.setValue(data.quantita)
    this.formDipendenza.controls.dipendenza.setValue(data.idDipendenza)
    this.formDipendenza.controls.dal.setValue(data.dal)
    this.formDipendenza.controls.al.setValue(data.al)
    this.formDipendenza.controls.misura.setValue(data.idUnitaMisura)
    this.formDipendenza.controls.descrizione.setValue(data.descrizione)
  }
}
