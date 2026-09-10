import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { concatMap, firstValueFrom, map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { IStatsPazienteDTO, ITabDTO } from '../_dtos/in'
import { ITabStats, TabStats } from '../_models/statistiche'
import { IStatPazienteFilterToDTO } from '../_dtos/out'

@Injectable({
  providedIn: 'root',
})
export class StatisticheService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlV2: string = environment.apiUrlV2 + 'Statistica/'
  constructor(private http: HttpClient) {}

  /**
   *  Funzione ch dal oggetto generico con la risposta ritorna solo la risposta
   * @param item - risposta generica data da API
   * @returns - solo valore della proprietà .resultData
   */
  resultData(item) {
    return item.resultData
  }

  getTabsWidgets(): Observable<TabStats[]> {
    return this.http.get<ITabDTO[]>(`${this.apiUrl}gettabwidgetslist/`).pipe(
      map((data) => {
        const responsApi: ITabDTO[] = this.resultData(data)

        // trasformo DTO al oggetto desiderato
        const response: TabStats[] = []

        responsApi.forEach((i) => {
          response.push(new TabStats(i))
        })

        return response
      })
    )
  }

  getStatPaziente(_nrs: IStatPazienteFilterToDTO): Observable<any> {
    return this.http
      .post<IStatPazienteFilterToDTO[]>(`${this.apiUrl}stats-paziente`, _nrs)
      .pipe(
        map((data) => {
          //const responsApi: IStatsPazienteDTO[] = this.resultData(data)
//data[0].DataVisita
          return data
        })
      )
  }
}
