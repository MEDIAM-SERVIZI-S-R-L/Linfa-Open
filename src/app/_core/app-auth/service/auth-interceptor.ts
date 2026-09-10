/** JWT AUTH INTERCEPTOR */
import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http'
import * as env from 'src/environments/environment'
import { Storage } from '../_helpers/storage'
import { Observable, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    storage: Storage = new Storage;

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //read jwt token from localstorage
        const _storage = this.storage.storageType;
        if (_storage.getItem(env.environment.tokenName)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${_storage.getItem(env.environment.tokenName)}`
                }
            });



        }

        return next.handle(request).pipe(
            tap(evt => {


                //** controllo la risposta, se ho token vienie sovrascritto ( nuovo nel login o prima della scadenza)  */
                if (evt instanceof HttpResponse) {
                    if (evt.headers.get(env.environment.tokenName)) {

                        _storage.setItem(env.environment.tokenName, evt.headers.get(env.environment.tokenName))
                    }
                    // this.toasterService.success(evt.body.success.message, evt.body.success.title, { positionClass: 'toast-bottom-center' });
                }
            }),
            catchError(err => {
                //      console.log('caught mapping error and rethrowing', err);
                if (err.status === 401) {
                    //** Se arriva errore 401 = non sono piu autorizzato quindi logout */
                    this.storage.logout();

                }
                return throwError(err);
            }),
        );
    }
}
