import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { environment } from 'src/environments/environment'

import {
  IAmbulatorioDTO,
  IPrioritaDTO,
  ITipiRichiestaDTO,
  ITipoPrestazioneDTO,
} from '../_dtos/in'
import { NuovaRichiestaMirthToDTO } from '../_dtos/out'
import {
  Ambulatorio,
  NuovaRichiestaDaInviare,
  Priorita,
  TipiRichiesta,
  TipoPrestazione,
} from '../_models/richieste'

@Injectable({
  providedIn: 'root',
})
export class RichiestaService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlV2: string = environment.apiUrlV2 + 'Linfa/'

  constructor(private http: HttpClient) {}

  /**
   *  Funzione ch dal oggetto generico con la risposta ritorna solo la risposta
   * @param item - risposta generica data da API
   * @returns - solo valore della proprietà .resultData
   */
  resultData(item) {
    if (item.hasOwnProperty('resultData')) {
      return item.resultData
    } else {
      return item
    }
  }

  /**
   * Prendo elenco delle priorita
   */
  getPriorita(): Observable<Priorita[]> {
    try {
      return this.http.get<IPrioritaDTO[]>(`${this.apiUrl}priorita`).pipe(
        map((data) => {
          const responsApi: IPrioritaDTO[] = this.resultData(data)
          // trasformo DTO al oggetto desiderato
          const response: Priorita[] = []

          responsApi.forEach((i) => {
            response.push(new Priorita(i))
          })

          return response
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  getTipiRichieste(): Observable<TipiRichiesta[]> {
    try {
      return this.http.get<ITipiRichiestaDTO[]>(`${this.apiUrl}tipirichiesta`).pipe(
        map((data) => {
          const responsApi: ITipiRichiestaDTO[] = this.resultData(data)
          // trasformo DTO al oggetto desiderato
          const response: TipiRichiesta[] = []
          responsApi.forEach((i) => {
            //** Disabilito  Cup per tutti */
            const _disabled = i.id === 1 ? true : false
            response.push(new TipiRichiesta(i, _disabled))
          })
          return response
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  getListaTipiPrestazione(): Observable<TipoPrestazione[]> {
    try {
      return this.http.get<ITipoPrestazioneDTO[]>(`${this.apiUrl}tipiprestazione`).pipe(
        map((data) => {
          const responsApi: ITipoPrestazioneDTO[] = this.resultData(data)
          // trasformo DTO al oggetto desiderato
          const response: TipoPrestazione[] = []
          responsApi.forEach((i) => {
            response.push(new TipoPrestazione(i))
          })
          return response
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  /**
   *Get lista ambulatori
   * @returns
   */
  getListaAmbulatori(): Observable<Ambulatorio[]> {
    try {
      return this.http.get<IAmbulatorioDTO[]>(`${this.apiUrl}ambulatori`).pipe(
        map((data) => {
          const responsApi: IAmbulatorioDTO[] = this.resultData(data)
          // trasformo DTO al oggetto desiderato
          const response: Ambulatorio[] = []
          responsApi.forEach((i) => {
            response.push(new Ambulatorio(i))
          })
          return response
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  postNuovaRichiesta(richiesta: NuovaRichiestaDaInviare): Observable<any> {
    try {
      const _json = {
        xml: btoa(JSON.stringify(richiesta)),
        json: JSON.stringify(new NuovaRichiestaMirthToDTO(richiesta)),
      }

      return this.http.post<any>(`${this.apiUrl}IntegrazioneRichiesteGeneric`, _json)
    } catch (error) {
      console.error(error)
    }
  }
}
