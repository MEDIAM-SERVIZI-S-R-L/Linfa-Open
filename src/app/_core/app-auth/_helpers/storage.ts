import * as env from 'src/environments/environment'
import jwt_decode from "jwt-decode";
import { Ruoli } from '../../helpers/enums';
export class Storage {
  get storageType() {

    let _storage: globalThis.Storage
    switch (env.environment.saveIn) {
      case "sessionStorage":
        _storage = sessionStorage;
        break;
      case "localStorage":
        _storage = localStorage;
        break;
      default:
        _storage = localStorage;
        break;
    }
    return _storage
  }

  logout() {
    const _storage = this.storageType;
    _storage.removeItem(env.environment.tokenName)
    window.location.reload();
  }

  get roles() {
    const _storage = this.storageType;
    let _user: any

    if (_storage.getItem(env.environment.tokenName)) {
      _user = jwt_decode(_storage.getItem(env.environment.tokenName));

      let Role = _user.Role.map(i => Number(i))


      Role = undefined;
      if (!Role || Role.lenght == 0) {
        Role = Ruoli.Guest;
      }

    }
    return _user.Role
  }

  get isAdm() {
    let _is = false;
    const _storage = this.storageType;
    if (_storage.getItem(env.environment.tokenName)) {
      const _user: any = jwt_decode(_storage.getItem(env.environment.tokenName));

      const Role = _user.Role.map(i => Number(i))

      _is = Role.includes(Ruoli.Administrator);


    }
    return _is
  }

  get username() {
    const _storage = this.storageType;
    let _user: any
    if (_storage.getItem(env.environment.tokenName)) {
      _user = jwt_decode(_storage.getItem(env.environment.tokenName));
    }
    return _user.Utente
  }

  get user() {
    const _storage = this.storageType;
    let _user: any

    if (_storage.getItem(env.environment.tokenName)) {
      _user = jwt_decode(_storage.getItem(env.environment.tokenName));
    }
    return _user
  }
}
