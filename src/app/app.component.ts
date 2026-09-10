import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { SnackBarBox } from './_dtos/dto_old';
import { LoaderService, SnackBarService } from './_core/services/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppGeneralService } from './_core/services/app-general.service';
import { HttpSharedService } from './_core/services/http-shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Linfa';
  opened = true;
  showLoader = false; // numero di richieste in essequzione
  notificationList: SnackBarBox[] = [];

  constructor(
    private loader: LoaderService,
    public dialog: MatDialog,
    private notificate: SnackBarService,
    private cdRef: ChangeDetectorRef,
    public snackBar: MatSnackBar,
    public appGen: AppGeneralService,
    public service: HttpSharedService,
  ) {
  }

  ngOnInit() {

    this.appGen.isMobile = this.appGen.getIsMobile();
    window.onresize = () => {
      this.appGen.isMobile = this.appGen.getIsMobile();
    };
    this.appGen.loadingPanel.Setup();
  }

  closeMenuOnClick() {
    if (this.appGen.isMobile) {
      this.opened = false;
    }
  }


  @HostListener('window:resize')

  ngAfterViewInit(): void {

    this.notificate.run.subscribe(item => {
      this.notificationList.push(item)
      if (this.notificationList.length == 1) {
        this.openSnackBar(this.notificationList[0])
      }
    })
    this.loader.run.subscribe(item => {
      if (item > 0) {
        this.appGen.loadingPanel.show();
      } else {
        this.appGen.loadingPanel.hide();
      }
      this.cdRef.detectChanges();

    })
  }


  openSnackBar(snack: SnackBarBox) {

    this.snackBar.open(snack.messaggio, null, {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: snack.tipo,
    }).afterDismissed().subscribe(() => {
      this.notificationList.shift();
      if (this.notificationList.length > 0) {
        this.openSnackBar(this.notificationList[0]);
      }
    });

  }
}
