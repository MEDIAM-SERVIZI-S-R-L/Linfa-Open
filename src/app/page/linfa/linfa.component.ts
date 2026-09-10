import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { Permessi, ValiditaPassword } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { SnackBarBox } from 'src/app/_dtos/dto_old'
import { ModalPasswordComponent } from 'src/app/shared/modal/modal-password/modal-password.component';
import { ModalNotePazienteComponent } from 'src/app/shared/note-paziente/modal-note-paziente/modal-note-paziente.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-linfa',
  templateUrl: './linfa.component.html',
  styleUrls: ['./linfa.component.scss'],

})
export class LinfaComponent implements OnInit {
  opened = true;
  notificationList: SnackBarBox[] = [];
  mobileQuery: MediaQueryList;
  @ViewChild(MatSidenav, { static: true }) snav: MatSidenav;
  theClock = new Date();

  Environment = environment;
  constructor(
    public snackBar: MatSnackBar,
    public appGen: AppGeneralService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    public authGuard: AuthGuard,
    private router: Router,
    private service: HttpSharedService,

    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {
    this.appGen.username = this.authGuard.getUserName();

    this.getConfigurazioniLinfa();


    this.mobileQuery = media.matchMedia('(max-width: 992px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    setInterval(() => {
      this.theClock = new Date();
    }, 1000);
  }



  ngOnInit() {

    if (this.authGuard.canAccess(this.appGen.permesso.ControlloPasswordScaduta)) {
      this.checkPasswordExpired()
    }

  }

  ngOnChanges(changes) {

    if (!this.appGen.isNullOrUndefined(changes.user)) {
      this.appGen.username = changes.user.currentValue;
    }
  }

  async checkPasswordExpired() {
    await this.service.getCallRequest({ action: 'CheckPasswordExpired' }).then(data => {

      if (data.resultData == ValiditaPassword.InScadenza || data.resultData == ValiditaPassword.Scaduta) {


        this.dialog.open(ModalPasswordComponent, {
          data: data,
          panelClass: "modal-custom",
          disableClose: true,
          autoFocus: true
        });
      }


    });
  }

  async getConfigurazioniLinfa() {
    await this.service.getCallRequest({ action: 'getConfigurazioniLinfa' }).then(data => {
      this.appGen.configurazioniObj = data;
      this.appGen.setConfigLinfa();
      //debugger;
    });
  }

  goToHome() {
    if (this.authGuard.canAccess(Permessi.ModuloDashboard)) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.router.navigate(['/app/visite']);
    }
  }

  private _mobileQueryListener: () => void;


  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  closeMenuOnClick() {
    if (this.appGen.isMobile) {
      // this.opened = false;
      this.snav.close();

    }
  }

  @HostListener('window:resize')

  ngAfterViewInit(): void {

    if (window.innerWidth <= 992) {
      this.opened = false;
      this.snav.close();
    }
    if (window.innerWidth >= 992) {
      this.opened = true;
      this.snav.open();
    }
    this.cd.detectChanges();
    // this.appGen.getPermessi()
  }


  onActivate(e, outlet) {
    outlet.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }


  insertNote() {
    this.dialog.open(ModalNotePazienteComponent, {
      panelClass: "modal-note"
    });

  }

  nuovaRichiesta(){
    if (this.authGuard.canRole(this.appGen.ruolo.Distretto)) {
      this.router.navigate(['/app/richieste/nuova-distrettuale'])
    }else if(this.authGuard.canRole(this.appGen.ruolo.Reparto)){
      this.router.navigate(['/app/richieste/nuova-orderentry'])
    }
  }
}
