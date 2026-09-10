import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router'
import jwt_decode from 'jwt-decode'
import * as env from 'src/environments/environment'
import { Storage } from '../_helpers/storage'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { Ruoli, StatoVisita } from '../../helpers/enums'
import { AuthService } from './auth.service'
import { firstValueFrom } from 'rxjs'
import _ from 'underscore'
import Swal from 'sweetalert2'
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  _storage: Storage = new Storage()
  constructor(private notificate: SnackBarService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const _storage = this._storage.storageType
    if (_storage.getItem(env.environment.tokenName)) {
      const _user: any = jwt_decode(_storage.getItem(env.environment.tokenName))
      //**! Attivazione role guest **/

      if (!_user.Role) {
        _user.Role = Ruoli.Guest
      }

      if (_user.Permessi === undefined || _user.Permessi === '') {
        return false
      }

      const permessi = _user.Permessi.map((i) => Number(i))

      if (!_user.Permessi) {
        return false
      }

      if (!permessi.includes(route.data.permesso)) {
        this.notificate.error('Accesso negato')
        return
        this.router.navigate(['/'])
      }

      return true
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
  }

  getUserName() {
    return this._storage.username
  }

  getUser() {
    return this._storage.user
  }

  /**
   * Controllo se ha il permesso
   */
  canAccess(permesso) {
    const _storage = this._storage.storageType
    if (_storage.getItem(env.environment.tokenName)) {
      const _user: any = jwt_decode(_storage.getItem(env.environment.tokenName))

      if (_user.Permessi === undefined || _user.Permessi === '') {
        return false
      }

      const permessi = _user.Permessi.map((i) => Number(i))

      if (!_user.Permessi) {
        return false
      }

      if (!permessi.includes(permesso)) {
        return false
      }
      return true
    }
  }

  havePermissions() {
    const _storage = this._storage.storageType
    if (_storage.getItem(env.environment.tokenName)) {
      const _user: any = jwt_decode(_storage.getItem(env.environment.tokenName))
      if (_user.Permessi === undefined || _user.Permessi === '') {
        return false
      }

      if (!_user.Permessi) {
        return false
      }

      return true
    }
  }

  /**
   * Controllo se il ruolo può accedere
   */
  canRole(ruolo) {
    const _storage = this._storage.storageType
    if (_storage.getItem(env.environment.tokenName)) {
      const _user: any = jwt_decode(_storage.getItem(env.environment.tokenName))

      const ruoli = _user.Role.map((i) => Number(i))

      if (!_user.Role) {
        return false
      }

      if (!ruoli.includes(ruolo)) {
        return false
      }
      return true
    }
  }
}

/**
 * Guard che deve verificare il stato della visita facendo la chiamata al server
 */
@Injectable()
export class StatoVisitaCheckGuard implements CanActivate {

  constructor(
    private http: AuthService,
     private router: Router
     ) {
    //super();
  }
/**
 *
 * @param route Verifica su CanAcrivate per route
 * @param state
 * @returns
 */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    try {
      /**
     * Se la visita ha uno dei seguenti stati il path non puo essere aperto : Cancellata,Terminata, Firmata
     */
    const statiBloccanti = [
      StatoVisita.Cancellata,
      StatoVisita.Terminata,
      StatoVisita.Firmata,
    ]
    // prendo id della visita pa query string se non c'e' finisco sul Dashboard
    const idVisita = route.queryParams.visit || null

    if(idVisita)
    {
      // prendo stato della visita
    const statoVisita = await firstValueFrom(this.http.getVisitState(idVisita))
    // confronto stato con i stati blocandi. Se c'e' mostro alert e faccio redirect
    if (_.contains(statiBloccanti, statoVisita.idStatoVisita)) {
      Swal.fire({
        icon: 'error',
        title: 'La visita è stata terminata e non puo essere modificata',
        // html:"ss",
        didClose: ()=>{

          this.router.navigate(['app/dashboard'],)
        }
      })

      return false
    } else {
      return true
    }
  }else{
// non c'e' redirect vado su dashboard
      //alert(1)
    this.router.navigate(['app/dashboard'],)
    return false;
  }
    } catch (error) {
      // error redirect vado su dashboard
      //alert(2)
      console.error();
      this.router.navigate(['app/dashboard'],)
    }

  }
}
