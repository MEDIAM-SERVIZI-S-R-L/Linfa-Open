import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, concatMap, firstValueFrom, map, throwError } from 'rxjs'
import { environment } from 'src/environments/environment'

import { IDatiAntropometriciDTO, INotificheRefertiDTO, IRefertoNomeDTO, IRefertoVisitaDTO, ISignedLocalDocument } from '../_dtos/in'
import { FirmaLocalmenteToDTO, InvioMailXPianoToDTO, ToSignDTO, ToSignMultipleDTO } from '../_dtos/out'
import { NotificheReferti } from '../_models/documenti'
import { RefertoVisita } from '../_models/paziente'

@Injectable({
  providedIn: 'root',
})
export class DocumentiService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlV2: string = environment.apiUrlV2 + 'Statistica/'
  localSignUrl: string = environment.urlApiFirmaDigitale + environment.requestPathFirmaDigitale;
  constructor(private http: HttpClient) {}

  /**
   *  Funzione ch dal oggetto generico con la risposta ritorna solo la risposta
   * @param item - risposta generica data da API
   * @returns - solo valore della proprietà .resultData
   */
  resultData(item) {
    return item.resultData
  }

  donwloadFileBase64(_idDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getfile_base64/${_idDocumento}`, {
      responseType: 'text' as 'json',
    })
  }

  //** Chiamata per la firma remota multipla */
  multipleRemoteSign(_tosignArray: ToSignMultipleDTO): Observable<any> {
    try {
      return this.http.post<ToSignMultipleDTO>(
        `${this.apiUrl}multipledigitalsign`,
        _tosignArray
      )
    } catch (error) {
      console.error(error)
    }
  }
  // chiamata per la firma remota singolare
  signleRemoteSing(_tosign: ToSignDTO): Observable<any> {
    try {
      return this.http.post<ToSignDTO>(`${this.apiUrl}digitalsign`, _tosign, {
        responseType: 'text' as 'json',
      })
    } catch (error) {
      console.error(error)
    }
  }

/**
 * Crea o aggiorna il nome e id del referto
 * @param idVisita - hash id Visita
 * @returns
 */
  createNomeReferto(idVisita:string):Observable<IRefertoNomeDTO>{
    return   this.http.get<IRefertoNomeDTO>(`${this.apiUrl}GetCreaNomeReferto/${idVisita}`).pipe(
      map((data) => {
        return this.resultData(data)
      })
    )
  }


/**
 * Verifica se file esiste
 * @param idFile - hash del file da verificare
 * @returns
 */
  checkFileExist(idFile:string):Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}checkFileExist/${idFile}`).pipe(
      map((data) => {

        return this.resultData(data)
      })
    )
  }

  storicoinvioreferti(_idVisita:string):Observable<NotificheReferti[]>{
    return this.http.get<INotificheRefertiDTO[]>(`${this.apiUrl}storicoinvioreferti/${_idVisita}` ).pipe(
      map((data)=> {
        const array : NotificheReferti[] = [];
        data.forEach(element => {
          let obj : NotificheReferti = new NotificheReferti(element);
          array.push(obj);
        });
        return array
      })
    )
  }


/**
 * Funzione deve ritornare il CF del utente logato
 * @returns stringa con CF
 */

getCfUtente():Observable<any>{
  return this.http.get<any>(`${this.apiUrl}checkUtenteLoggatoCF`).pipe(
    map((data) => {

      return this.resultData(data)
    })
  )
}

/**
 * Firma locale. invio Base64 non firmato al servizio locale 8 installato sul PC del medico per la firma
 * @param obj
 * @returns
 */
 singleLocalSign(obj:FirmaLocalmenteToDTO): Observable<ISignedLocalDocument>{
  return this.http.post<ISignedLocalDocument>(this.localSignUrl + 'SignDocument', obj)
}

/**
 * Aggiorna stato del documento e lo segnla come firmato
 * @param idVisita
 * @returns
 */
updateDocumentAsSignet(idVisita:string):  Observable<any>{
  return this.http.put<any>(`${this.apiUrl}updateDocumentoFirmato/${idVisita}`,null)
}





  // generic json per test
  genericJson(): Observable<any> {
    const x = [
      { newReportName: 'Referto_00000905.pdf', idVisita: 'MbX', errorSign: null },
      { newReportName: 'Referto_00000906.pdf', idVisita: 'r7g', errorSign: null },
    ]
    //return throwError("d/*upa");
    return this.http.post<any>(`${this.apiUrl}genericjson`, x)
  }


  invioMail(_json: InvioMailXPianoToDTO):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}sendemail`, _json)
  }

  checkOtp():Observable<boolean>{
    return this.http.get<boolean>(`${this.apiUrl}checkotp`);
  } 

  richiestaOtp():Observable<any>{
    return this.http.get<boolean>(`${this.apiUrl}richiestaotp`);
  }

  getRefertoVisita(_idVisita: any):Observable<RefertoVisita>{
    return this.http.get<any>(`${this.apiUrl}GetRefertoVisita/${_idVisita}`).pipe(
      map((data) => {
        const resultData : IRefertoVisitaDTO = this.resultData(data);
        const X : RefertoVisita = new RefertoVisita(resultData);
        return X;
      })
    )
  }


}
