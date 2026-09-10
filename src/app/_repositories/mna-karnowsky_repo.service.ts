import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import {
  IBaseResponseDTO,
  INrsAnswersDTO,
  INutritionalRiskScreeningDTO,
  IQuestionarioBaseDTO,
} from '../_dtos/in'
import { NrsToDTO } from '../_dtos/out'
import {
  NrsPatientAnswers,
  NutritionalRiskScreening,
  QuestionarioDomandeBase,
} from '../_models/mna-karnowsky'
@Injectable({
  providedIn: 'root',
})
export class MnaKarnowskyService {
  apiUrl: string = environment.apiUrl + 'Linfa/'

  constructor(private http: HttpClient) {}

 /**
  *  Funzione ch dal oggetto generico con la risposta ritorna solo la risposta
  * @param item - risposta generica data da API
  * @returns - solo valore della proprietà .resultData
  */
  resultData(item) {
    return item.resultData
  }


/**
 *
 * @param idQestiornario -  id questionario
 * @returns - ritorna le domande per prescreening
 */
  getDomandeQuestionario(idQestiornario: string): Observable<QuestionarioDomandeBase[]> {
    return this.http
      .get<IBaseResponseDTO>(`${this.apiUrl}Questionario/${idQestiornario}`)
      .pipe(
        map((data) => {

          const responsApi: IQuestionarioBaseDTO[] = this.resultData(data).xDomande

    // trasformo DTO al oggetto desiderato
          const response: QuestionarioDomandeBase[] = []

          responsApi.forEach((i) => {
            response.push(new QuestionarioDomandeBase(i))
          })

          return response
        })
      )
  }
/**
 * Ritorna le domande che fanno parte della tabella divisa, domande con punteggio e livello di gravita
 * @returns
 */
  getNutritionalRiskScreening(): Observable<NutritionalRiskScreening> {
    return this.http
      .get<IBaseResponseDTO>(`${this.apiUrl}GetNutritionalRiskScreening`)
      .pipe(
        map((data) => {
          const x: INutritionalRiskScreeningDTO = this.resultData(data)

          return new NutritionalRiskScreening(x)
        })
      )
  }

  /**
   * Ritorna le risposte del signolo paziente per nrs con il punteggio
   * @param idPaziente - id paziente
   * @returns risposte del paziente per NRS
   */
  getNrsPaziente(idPaziente: string): Observable<NrsPatientAnswers> {
    return this.http
      .get<IBaseResponseDTO>(`${this.apiUrl}getNRSPaziente/${idPaziente}`)
      .pipe(
        map((data) => {
          const answer: INrsAnswersDTO = this.resultData(data)

          return new NrsPatientAnswers(answer)
        })
      )
  }

  /**
   * Invia nrs compilato da paziente e ritorna il punteggio
   * @param _nrs - nrs con le risposte da inserire
   * @returns - nuovo pnteggio
   */
  postNrs(_nrs: NrsToDTO): Observable<any> {
    return this.http.post<NrsToDTO>(
      `${this.apiUrl}SaveNutritionalRiskScreeningPaziente`,
      _nrs
    ).pipe(
      map((data) => {
        return this.resultData(data)


      })
    )
  }
}
