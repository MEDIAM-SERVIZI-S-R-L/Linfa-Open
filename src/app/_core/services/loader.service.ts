import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private load = new Subject<any>();
  run = this.load.asObservable();

  start() {
    let _x: number = Number(sessionStorage.getItem("loaders")) || 0;

    _x = _x + 1;
    if (_x > 15) {
      _x = 15;
    }

    sessionStorage.setItem("loaders", (_x).toString())
    this.load.next(_x)

  }
  stop() {
    let _x: number = Number(sessionStorage.getItem("loaders")) || 0;
    _x = _x - 1;
    if (_x < 0) {
      _x = 0;
    }

    sessionStorage.setItem("loaders", (_x).toString())
    setTimeout(() => { this.load.next(_x) }, 1000)
  }
}

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private load = new Subject<any>();
  run = this.load.asObservable();


  actionButtonLabel = 'Chiudi';
  action = false;
  setAutoHide = true;
  autoHide = 2500;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  addExtraClass = false;

  constructor(public snackBar: MatSnackBar) { }

  ok(message: string) {
    const config = new MatSnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = this.setAutoHide ? this.autoHide : 0;
    config.panelClass = 'skOk';
    this.snackBar.open(message, this.action ? this.actionButtonLabel : undefined, config);
  }
  error(message: string) {
    const config = new MatSnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = this.setAutoHide ? this.autoHide : 0;
    config.panelClass = 'skError';
    this.snackBar.open(message, this.action ? this.actionButtonLabel : undefined, config);
  }


  warning(message: string, hidein?: number) {
    if (hidein != null) {
      this.autoHide = hidein
    }
    const config = new MatSnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = this.setAutoHide ? this.autoHide : 0;
    config.panelClass = 'skWarning';
    this.snackBar.open(message, this.action ? this.actionButtonLabel : undefined, config);
  }

}
