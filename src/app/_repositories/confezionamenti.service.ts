import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, map } from 'rxjs'
import { environment } from 'src/environments/environment'

import { IGaraDTO } from '../_dtos/in'
import {
  ConfezionamentoToDTO,
  IGestioneGareConfezionamentiToDTO,
  gestioneConfezionamentiGareToDTO,
} from '../_dtos/out'
import {
  Confezionamento,
  Gara,
  IDettaglioConfezionamenti,
  IGestioneGareConfezionamenti,
} from '../_models/confezionamenti'

@Injectable({
  providedIn: 'root',
})
export class ConfezionamentiService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlDizionario: string = environment.apiUrl + 'dizionari/'
//  apiUrlConfigurazione: string = environment.apiUrl + 'Configurazione/'

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  resultData(item: any) {
    return item.resultData
  }

  getUnitaMisura(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlDizionario}unitamisura`).pipe(
      map((data) => {
        return this.resultData(data)
      })
    )
  }

  getProdottoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getprodotto/` + id)
  }

  addConfezionamento(_json: ConfezionamentoToDTO): Observable<any> {
    return this.http.post<ConfezionamentoToDTO[]>(
      `${this.apiUrl}insertUpdateConfezionamenti/`,
      _json
    )
  }

  getListaGare(): Observable<Gara[]> {
    return this.http.get<IGaraDTO[]>(`${this.apiUrl}getlistagare/`).pipe(
      map((data) => {
        const obj: Gara[] = []
        data.forEach((item) => {
          obj.push(new Gara(item))
        })
        return obj
      })
    )
  }

  gestisciConfezionamentiXGara(_json: gestioneConfezionamentiGareToDTO) {
    return this.http.post<any>(`${this.apiUrl}gestisciConfezionamentiXGara/`, _json)
  }

  getConfezioniXProdotto(_json: IDettaglioConfezionamenti): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}getConfezioniXProdotto/`, _json)
  }

  getConfezioniXProdottoDisponibili(_json: IDettaglioConfezionamenti): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}getConfezioniXProdottoDisponibili/`, _json)
  }

  gestisciGareXConfezionamento(
    _json: IGestioneGareConfezionamentiToDTO
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}gestisciGareXConfezionamento/`, _json)
  }

  getConfezioniGare(_params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}getConfezioniGare/`, _params)
  }

  getConfezioniXProdottoSenzaGara(idProdotto: any): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}getConfezioniXProdottoSenzaGara/` + idProdotto)
  }

  getConfezionamentoById(_id: number){
    return this.http.get<any>(`${this.apiUrl}getConfezionamento/` + _id )
  }

  cancellaconfezionamentixgara(idGara: number, idProdotto: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}cancellaconfezionamentixgara/` + idGara + '/' + idProdotto
    )
  }

  // getAllProdottiGare(idGara: number): Observable<any> {
  //   const params = {
  //     sort: 'desc',
  //     columnSort: 'date',
  //     page: 0,
  //     elementForPage: 10000,
  //     idGara: idGara,
  //     idArtificiale: '',
  //     prodotto: '',
  //     abilitato: '',
  //   }
  //   return this.http.post<any>(`${this.apiUrl}getProdottiGare/`, params)
  // }

  getTipoAlimentazioneArtificiale(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getTipoAlimentazioneArtificiale/`)
  }

  getConfezioniGarePerTipoArtificiale(idGara: number, idArtificiale: number) {
    const params = {
      page: 0,
      elementForPage: 1000,
      sort: 'desc',
      columnSort: 'date',
      idArtificiale: idArtificiale,
      abilitato: '',
      idGara: idGara,
    }
    return this.http.post<any>(
      `${this.apiUrl}getConfezioniGarePerTipoArtificiale/`,
      params
    )
  }
}
