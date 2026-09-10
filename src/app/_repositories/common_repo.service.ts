import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, map } from 'rxjs'
import { environment } from 'src/environments/environment'

import { Ruoli } from '../_core/helpers/enums'
import { IUtenteBaseDTO } from '../_dtos/in'
import { UtenteMedico } from '../_models/common'

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  constructor(private http: HttpClient) {}

  resultData(item: any) {
    return item.resultData
  }

  //#region Utenti


/**
 * Prende la lista del medici e del dietisti. Si deve passare il ruolo ad tornare
 * @param _ruolo
 * @returns
 */
  listaMedici(_ruolo:Ruoli): Observable<UtenteMedico[]> {
    const obj = {
      tipoUtente:_ruolo,
    }

    return this.http.post<IUtenteBaseDTO>(`${this.apiUrl}getUtenti`, obj).pipe(
      map((data) => {
        const responsApi: IUtenteBaseDTO[] = this.resultData(data)
           // trasformo DTO al oggetto desiderato
           const response: UtenteMedico[] = []

           if (responsApi?.length > 0) {
              responsApi.forEach((i) => {
                response.push(new UtenteMedico(i))
            })
 
            return response
           }
      })
    )
  }

  //#endregion Utenti
}
