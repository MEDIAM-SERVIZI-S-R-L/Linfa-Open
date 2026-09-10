import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoaderService, SnackBarService } from 'src/app/_core/services/loader.service';
import { AppGeneralService } from '../services/app-general.service';
import { Router } from '@angular/router';
import * as env from 'src/environments/environment'

@Injectable()
export class HttpErrorInterceptor {// implements HttpInterceptor {
  constructor(
    private loader: LoaderService,
    private notificate: SnackBarService,
    private appGen: AppGeneralService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //Con la chiamata faccio partire il loader
    return next.handle(request)
      .pipe(

        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            //controllo gli status 200 quindi chiamate andate a buon fine, controllo se ho dei messaggi da dare
            if (event.status === 200 && event.body.warning) {
/**
 * *INFO: Disabilitato warnign per c'erti url:
 */
switch (true) {
  case event.url.indexOf('getListConclusioniPredefinite')!==-1:
    case event.url.indexOf('listapazienti')!==-1:
    console.log("non ci sono i predefinite controllare impostazioni Software")
    console.log("warning in lista pazienti")
    // non faccio niente
    break;

  default:
    this.notificate.warning(event.body.message);
    break;
}

            }

            if (event.status === 200 && !this.appGen.isNullOrUndefined(event.body.message) && !event.body.warning) {
              this.notificate.ok(event.body.message);
            }


          }
          // this.loader.stop();
          return event;
        }),
        // retry(0),
        catchError((error: HttpErrorResponse) => {

          this.loader.stop();
          let errorMessage = '';

          if (error.url.includes(env.environment.requestPathFirmaDigitale)) {
            this.notificate.warning('Non sono stati trovati lettori di smart card')
          } else {
            //In caso il server mi restituisca 401 allora vuol dire che la mia sessione è scaduta
            if (error.status === 401) {
              sessionStorage.removeItem(env.environment.tokenName)
              this.router.navigate(['login']);
              this.notificate.error("Sessione scaduta, effettuare la login")
              return throwError(errorMessage);
            }
            if (error.name === "HttpErrorResponse" && error.status === 0) {
              //this.appGen.loadingPanel.hide()
              this.loader.stop();
              this.notificate.error("E' stato riscontrato qualche problema, riprovare")
              return throwError(errorMessage);

            }

            if (error.error instanceof ErrorEvent) {
              // this.appGen.loadingPanel.hide()
              this.loader.stop();
              // client-side error
              errorMessage = `Error: ${error.error.message}`;
            } else {
              // this.appGen.loadingPanel.hide()
              this.loader.stop();
              // server-side error
              // errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
              if (error.error.message == null || error.error.message == undefined) {
                this.notificate.error("E' stato riscontrato qualche problema, riprovare")
                return throwError(errorMessage);
              }

              errorMessage = ` ${error.error.message}`;
            }

            this.notificate.error(errorMessage)
          }
          return throwError(errorMessage);
        })
      )
  }
}
