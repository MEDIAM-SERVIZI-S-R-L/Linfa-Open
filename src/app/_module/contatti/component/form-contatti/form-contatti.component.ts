import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { Router } from '@angular/router';
import { ModalConfirmComponent, ConfirmDialogModel } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-form-contatti',
  templateUrl: './form-contatti.component.html',
  styleUrls: ['./form-contatti.component.css']
})
export class FormContattiComponent implements OnInit {

  formContatti: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private router: Router,
    public dialog: MatDialog,
    private service: HttpSharedService

  ) { }

  ngOnInit() {
    this.formContatti = this.formBuilder.group({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      mail: new FormControl('', Validators.required),
      messaggio: new FormControl('', Validators.required),
      oggetto: new FormControl('', Validators.required),
    });

  }
  get formContattiControls() { return this.formContatti.controls; }



  async onSubmit() {
    if (this.formContatti.invalid) {
      this.appGen.validateAllFormFields(this.formContatti);
      return;
    }


    let obj = new Object();
    obj = {
      nome: this.formContatti.get('nome').value,
      cognome: this.formContatti.get('cognome').value,
      mittente: this.formContatti.get('mail').value,
      contenuto: this.formContatti.get('messaggio').value,
      oggetto: this.formContatti.get('oggetto').value,
      tipo: "SUPPORTO"
    };

    //insert nuovo contatti
    await this.service.postCallRequest({ action: 'supportoMail', param: obj }).then(() => {
      this.formContatti.reset();
    });
  }

}
