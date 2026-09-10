import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';

@Component({
  selector: 'app-modal-validita-piano-terapeutico',
  templateUrl: './modal-validita-piano-terapeutico.component.html',
  styleUrls: ['./modal-validita-piano-terapeutico.component.scss']
})
export class ModalValiditaPianoTerapeuticoComponent implements OnInit {

  public validita: FormControl = new FormControl();
  validitaEmit = new EventEmitter();
  listaAmbulatori
  form: FormGroup;
  prodottiIntegratori
  dataPrescrizioneModel

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) {


    const now = new Date();
    const mins = now.getMinutes();
    const quarterHours = Math.ceil(mins / 15);
    if (quarterHours == 4) {
      now.setHours(now.getHours() + 1);
    }
    var rounded = (quarterHours * 15) % 60;
    now.setSeconds(0);
    now.setMinutes(rounded);
    // this.dataPrescrizioneModel = now;

    this.getAmbulatori()

    this.prodottiIntegratori = data;

    this.form = this.formBuilder.group({
      validita: new FormControl('', Validators.required),
      dataProssimaPrescrizione: new FormControl(''),
      ambulatorio: new FormControl(''),
      integratori: new FormArray([]),
    });

    data.forEach(prodotto => {
      this.integratori.push(this.formBuilder.group({
        idProdotto: new FormControl(prodotto.id),
        prodotto: new FormControl(prodotto.prodotto),
        quantita: new FormControl(prodotto.quantita),
        confezioni: new FormControl('', Validators.required),
      }))
    });
  }

  ngOnInit() { }

  get f() { return this.form.controls; }
  get integratori() { return this.f.integratori as FormArray; }

  async getAmbulatori() {
    await this.service.getCallRequest({ action: 'ambulatori' }).then((data) => {
      this.listaAmbulatori = data;
    });
  }

  confirm() {

    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      return;
    }

    let obj = {
      integratori: this.integratori.value,
      validita: this.form.controls.validita.value,
      dataProssimaPrescrizione: this.appGen.convertToLocaleDate(this.form.controls.dataProssimaPrescrizione.value),
      ambulatorio: this.form.controls.ambulatorio.value
    }

    this.validitaEmit.emit(obj);
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}
