import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../service/auth.service'
import { Login } from '../../model/users/users'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { AuthGuard } from '../../service/auth.guard';
import { MatDialog } from '@angular/material/dialog';
import { DispositivoMedicoComponent } from 'src/app/shared/dispositivo-medico/dispositivo-medico.component';
@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent implements OnInit {
  user: Login = new Login;
  loginForm: FormGroup;
  returnUrl: string;
  loading = false;
  showPassword = false;
  capsOn: any;

  @ViewChild('password') password: { type: string; };

  constructor(
    private getAuth: AuthService,
    private dialog: MatDialog,
    private appGen: AppGeneralService,
    private formBuilder: FormBuilder,
    private authGuard: AuthGuard
  ) { }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })

  }

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.password.type = this.showPassword ? 'text' : 'password';
  }

  openDispositivo() {
    this.dialog.open(DispositivoMedicoComponent, {
      panelClass: "modal-custom"
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.appGen.validateAllFormFields(this.loginForm);
      return;
    }
    this.appGen.loadingPanel.show();

    this.user.nomeUtente = this.f.username.value;
    this.user.password = this.f.password.value;
    const err = await this.getAuth.login(this.user);
    if (err == null) {
      this.appGen.user = this.authGuard.getUser();

      if (!this.authGuard.havePermissions()) {
        this.appGen.loadingPanel.hide();
        this.appGen.notificate.error("Accesso negato - verificare i permessi")
        return;
      }
      this.appGen.loadingPanel.hide();
      this.appGen.goToModule();
    }
  }

  get f() {
    return this.loginForm.controls;
  }

}
