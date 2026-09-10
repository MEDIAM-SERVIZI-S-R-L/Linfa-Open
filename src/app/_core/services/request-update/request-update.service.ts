/*
This service will by used to pass updated Element name. This will be uset to
recall data request when element will be changed on another componetn
*/

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'

import { GenericObj } from '../../../_models/common'

@Injectable({
  providedIn: 'root'
})

export class RequestUpdateService {

  private elementName = new Subject<GenericObj>();
  updatedElementName = this.elementName.asObservable();


  /**
   * Server per disabilitare o abilitare la modificabilita della visita
   * @param isEnabled - true false
   */
  enableVisita(isEnabled= false){
    const _x: GenericObj = new GenericObj;
    _x.objName = "VisitaModificabile";
    _x.objValue = isEnabled;
    this.elementName.next(_x)
  }

  /**
   * Serve per comunicare se un campo è stato compilato o no. Per le verifiche nome della sottoscrizione è nome del campo + isCompiled
   * @param nomeCampo  - nome del campo da verificare
   * @param isCompiled - valore true se compilato
   */
  isCampoCompiled(nomeCampo:string, isCompiled: boolean){
    const _x: GenericObj = new GenericObj;
    _x.objName = nomeCampo+"isCompiled";
    _x.objValue = isCompiled;
    this.elementName.next(_x)
  }
}
