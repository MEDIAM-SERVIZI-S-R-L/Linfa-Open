import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, map } from 'rxjs'
import { environment } from 'src/environments/environment'

import { IFiltroTipoProdottiToDTO } from '../_dtos/out'
import { IProdottoDettaglioDTO, IProdottoEasyDTO, IProprietaProdottoDTO, ITipoProdottiDTO } from '../_dtos/in'
import { ProdottoAlternativo, ProdottoDettaglio, ProdottoEasy, ProprietaProdotto, TipoProdotti } from '../_models/prodotti'
import { AnalisiPaziente } from '../_models/paziente'
import levenshtein from 'fast-levenshtein';

@Injectable({
  providedIn: 'root',
})
export class ProdottiService {
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
    }else{
      return item
    }

  }

  getTipoProdotti(_prodottiType: IFiltroTipoProdottiToDTO): Observable<any> {
    try {

      return this.http.post<ITipoProdottiDTO[]>(`${this.apiUrlV2}tipo-prodotti`, _prodottiType).pipe(
        map((data) => {

          const responsApi: ITipoProdottiDTO[] = this.resultData(data)
           // trasformo DTO al oggetto desiderato
           const response: TipoProdotti[] = []

           responsApi.forEach((i) => {
             response.push(new TipoProdotti(i))
           })

           return response
        })
      )
    } catch (error) {
      console.error(error)
    }
  }


//#region prodotti nel piani nutrizionali


getAllProdotti():Observable<ProdottoEasy[]>{
  return this.http.post<IProdottoEasyDTO[]>(`${this.apiUrl}listaprodottieasy`, {}).pipe(
    map((data) => {
      const resultData :IProdottoEasyDTO[] = this.resultData(data);
      const response :ProdottoEasy[] = [];
      resultData.forEach((item) => {
        response.push(new ProdottoEasy(item));
      })
      return response;
    })
  )
}

getProdotto(_idProdotto: number):Observable<ProdottoDettaglio>{
  return this.http.get<IProdottoDettaglioDTO>(`${this.apiUrl}getprodotto/` + _idProdotto).pipe(
    map((data) => {
      const resultData :IProdottoDettaglioDTO = this.resultData(data);
      const response :ProdottoDettaglio = new ProdottoDettaglio(resultData);
      return response
    })
  )
}

getProdottoEasy(_idProdotto: number):Observable<ProdottoDettaglio>{
  return this.http.get<IProdottoDettaglioDTO>(`${this.apiUrl}getprodottoeasy/` + _idProdotto).pipe(
    map((data) => {
      const resultData :IProdottoDettaglioDTO = this.resultData(data);
      const response :ProdottoDettaglio = new ProdottoDettaglio(resultData);
      return response
    })
  )
}


conversioneXProdottoAlternativo(_idProdotto: number, _kcalProdotto: number):Observable<ProprietaProdotto>{
  let obj = {
    idProdotto : _idProdotto,
    kcal : _kcalProdotto
  }
  return this.http.post<any>(`${this.apiUrl}prodottoalternativo`, obj).pipe(
    map((data) => {
      const resultData: IProprietaProdottoDTO = this.resultData(data);
      const response: ProprietaProdotto = new ProprietaProdotto(resultData);
      return response
    })
  )
  
}

/**
 * Server per cancellare tutti i prodotti nel piano nutrizionale per la visita naturale se sono tornato dietro
 * @param _idVisita - hash visita
 * @returns boolean - se andato tutto ok
 */
deletePianoNelVisitaNaturale(_idVisita:string):Observable<boolean>{
  return this.http.get<boolean>(`${this.apiUrl}eliminaprodottinaturale/${_idVisita}`)
}

/**
 *  Il metodo che ci permette di cancellare x prodotti dal piano nutrizionale
 * @param _idProdottoPiano - lista del id che ha singola righa nella tabella prodotto x nutrizione , non è id del prodotto. La lista di prodotti da cancellare
 * @returns
 */
deleteProdottiDalPiano(_idProdottoPiano:number[]):Observable<boolean>{
  return this.http.post<boolean>(`${this.apiUrl}eliminaprodottixpiano`,_idProdottoPiano)
}
//#endregion  prodotti nel piani nutrizionali


//#region gara

getConfezioniGara(_item:any): Observable<any[]>
{
  return this.http.post<any[]>(`${this.apiUrl}getConfezioniGare`,_item)
}


//#endregion gara
}
