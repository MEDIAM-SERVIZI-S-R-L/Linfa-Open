import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as User from 'src/app/_core/app-auth/model/users/users'
import { Storage } from 'src/app/_core/app-auth/_helpers/storage'
import * as env from 'src/environments/environment'
import { Router } from '@angular/router';
import jwt_decode from "jwt-decode";
import { Observable } from 'rxjs';
import { IstatoVisitaDTO } from 'src/app/_core/app-auth/model/users/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  _storage: Storage = new Storage;
  constructor(private http: HttpClient, private router: Router) {

  }

  async login(json: User.Login) {
    try {
      const _storage = this._storage.storageType;
      // remove token for Interceptor
      _storage.removeItem(env.environment.tokenName);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',

        }),
        observe: "response" as "body"
      };

      const token = await this.http.post<any>(env.environment.apiUrl + 'Token/', JSON.stringify(json), httpOptions).toPromise()
      // insert

      _storage.setItem(env.environment.tokenName, token.headers.get(env.environment.tokenName))

      if (token.headers.get(env.environment.tokenName)) {
        return null;
      }
    } catch (error) {
      return new Error(error.error.message);
    }
  }


  async refreshToken() {
    try {
      const _storage = this._storage.storageType;

      const _user: any = jwt_decode(_storage.getItem(env.environment.tokenName));

      // remove token for Interceptor
      _storage.removeItem(env.environment.tokenName);


      await this.http.get<any>(env.environment.apiUrl + 'Token/RefreshToken/' + _user.HashId).toPromise()

      if (_storage.getItem(env.environment.tokenName)) {
        return null;
      }
    } catch (error) {
      return new Error(error.error.message);
    }
  }


  externalAccess(token) {
    const _storage = this._storage.storageType;
    // remove token for Interceptor
    _storage.removeItem(env.environment.tokenName);
    _storage.setItem(env.environment.tokenName, token.headers.get(env.environment.tokenName))

    if (token.headers.get(env.environment.tokenName)) {
      return null;
    }
  }

  clearSession() {
    const _storage = this._storage.storageType;
    // remove token for Interceptor
    _storage.removeItem(env.environment.tokenName);
  }



  getVisitState(_idVisita:string): Observable<IstatoVisitaDTO>
  {
    return this.http.get<IstatoVisitaDTO>(`${env.environment.apiUrl + 'Linfa/'}verificastatovisita/${_idVisita}`)
  }

}
