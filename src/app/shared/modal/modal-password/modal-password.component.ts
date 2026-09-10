import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ValiditaPassword } from 'src/app/_core/helpers/enums';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}

@Component({
  selector: 'app-modal-password',
  templateUrl: './modal-password.component.html',
  styleUrls: ['./modal-password.component.scss']
})
export class ModalPasswordComponent implements OnInit {

  message;
  showCambiaPassword = false;
  showBtnCambiaPassword = false;
  matcher = new MyErrorStateMatcher();
  showChiudi = false;
  form: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public appGen: AppGeneralService,
    private service: HttpSharedService,
    public dialogRef: MatDialogRef<ModalPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {


    if (!this.appGen.isNullOrUndefined(data)) {


      this.message = data.message;

      switch (data.resultData) {

        case ValiditaPassword.InScadenza:
          this.showChiudi = true;
          break;
        case ValiditaPassword.Scaduta:

          break;

        default:
          break;
      }
      this.showBtnCambiaPassword = true;

    } else {
      this.showCambiaPassword = true;
      this.showChiudi = true;
    }

  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      passwordNuova: ['', [Validators.required]],
      confermaPassword: ['', [Validators.required]],
      passwordAttuale: ['', [Validators.required]],
    }, { validators: this.checkPasswords })
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    const password = group.get('passwordNuova').value;
    const confirmPassword = group.get('confermaPassword').value;

    return password === confirmPassword ? null : { notSame: true }
  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      return;
    }


    let obj = new Object();
    obj = {
      passwordNuova: this.form.get('passwordNuova').value,
      passwordAttuale: this.form.get('passwordAttuale').value
    };

    // await this.service.cambiaPassword(obj).then(data => {
    //   this.onDismiss()
    // });

    await this.service.postCallRequest({ action: 'CambiaPassword', param: obj }).then(data => {
      this.onDismiss()
    });
  }
}
