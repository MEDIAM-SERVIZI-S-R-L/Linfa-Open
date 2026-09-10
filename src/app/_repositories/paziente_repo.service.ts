import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, concatMap, firstValueFrom, map } from 'rxjs'
import { environment } from 'src/environments/environment'

import { IAnalisiPazienteDTO, IAnalisiPazienteDettaglioDTO, ICategoriaAnalisiDTO, IPazienteBoxDTO, IPazienteEsternoDTO, IPazienteInternoDTO, IProprietaAnalisiDTO, IComuneDto } from '../_dtos/in'
import { AnalisiToDTO, IBoxInfoParamsToDTO, PazienteEsternoToDto } from '../_dtos/out'
import { FiltroRicercaPaziente } from '../_models/common'
import { AnalisiPaziente, BoxPaziente, CategoriaAnalisi, Comune, IModelImpegnativaCupModel, PazienteNuovaRichiesta, ProprietaAnalisi } from '../_models/paziente'
import { ModalEditProprietaComponent } from '../_module/configurazioni/component/kcal-proprieta/modal-edit-proprieta/modal-edit-proprieta.component'

@Injectable({
  providedIn: 'root'
})
export class PazienteService {

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


  //*
  getBoxInfoPaziente(obj:IBoxInfoParamsToDTO): Observable<BoxPaziente> {
    try {

      return this.http.post<IPazienteBoxDTO>(`${this.apiUrl}getPazienteVisita`,obj).pipe(
        map((data) => {

          const x: IPazienteBoxDTO =data

            return new BoxPaziente(x)
        })
      )
    } catch (error) {
      console.error(error)
    }

  }


//#region analisi paziente


public getAnalisiPaziente(_param: string): Observable<AnalisiPaziente[]> {
  return this.http

    .get<IAnalisiPazienteDTO[]>(`${this.apiUrl}getesamixpaziente/${_param}`
    ).pipe(
      map((data) => {
        const obj: AnalisiPaziente[] = [];
        data.forEach((item) => {
          obj.push(new AnalisiPaziente(item));
        });
        return obj;
      })
    );

}



public getAnalisiDettaglio(_idAnalisi: string): Observable<AnalisiPaziente> {
  return this.http
    .get<IAnalisiPazienteDettaglioDTO>(

      `${this.apiUrl}getesame/${_idAnalisi}`
    )
    .pipe(
      map((item) => {
      //  let obj: any = new Esame(data);
        return new AnalisiPaziente(item);
      })
    );
}



/**
 * Torna lista delle proprieta per tipo analisi. Se non passo niente torna tutte le proprieta.
 * Per inserimento meglio usare tutte le proprieta
 * @param _idCate
 * @returns
 */
public getProprietaAnalisi(_idCat=0): Observable<ProprietaAnalisi[]> {
  return this.http
    .get<IProprietaAnalisiDTO[]>(

      `${this.apiUrl}getxvaloriesami/${_idCat}`
    )
    .pipe(
      map((data) => {
        const obj: ProprietaAnalisi[] = [];
        data.forEach((item) => {
          obj.push(new ProprietaAnalisi(item));
        });

        return obj;
      })
    );
}

/**
 * Invia dati analisi per un singolo paziente
 * @param _json passa dati raw dal form di inserimento
 * @returns
 */
public saveAnalisiPaziente(_json:AnalisiToDTO): Observable<any>{

return this.http.post<AnalisiToDTO>(
  `${this.apiUrl}manageesame/`,
    _json,{responseType:'text' as 'json'}
  );
}




//#endregion analisi paziente
//#region ricerca paziente Interna e Esterna

public listaPazientiInterni(_json:FiltroRicercaPaziente): Observable<PazienteNuovaRichiesta[]>{
  return this.http.post<IPazienteInternoDTO[]>(`${this.apiUrl}listapazienti`,_json).pipe(
  map((data) => {
    const _data = this.resultData(data)
    const obj: PazienteNuovaRichiesta[] = [];
    _data?.listaPazienti.forEach((item) => {
      obj.push(new PazienteNuovaRichiesta(item));
    });

    return obj;
  })

);

}



  public listaPazientiEsterni(_json:FiltroRicercaPaziente): Observable<PazienteNuovaRichiesta[]>{
const _paziente= new PazienteEsternoToDto(_json)

    return this.http.post<IPazienteEsternoDTO[]>(`${this.apiUrl}listapazientiesterni`,_paziente).pipe(
      map((data) => {

        const obj: PazienteNuovaRichiesta[] = [];
        data.forEach((item) => {
          obj.push(new PazienteNuovaRichiesta(item));
        });

        return obj;
      })

    );
    }


//#endregion ricerca paziente Interna e Esterna

/**
 * Chiamata per la ricerca dei comuni basata sul nome del comune.
 * @param _json Stringa di ricerca
 * @returns ritorna una lista di comuni che contengono la stringa di ricerca
 */
public ricercaComuneByDescrizione(_json: string): Observable<Comune[]>{
  return this.http.get<any[]>(`${this.apiUrl}comunidescr/` + _json).pipe(
    map((data) =>{
      const comuni : IComuneDto[] = this.resultData(data);
      const obj : Comune[] = [];

      comuni.forEach(item => {
        obj.push(new Comune(item))
      });
      return obj;
      })
    )
  }

  setNumeroImpegnativa(_json: IModelImpegnativaCupModel):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}setNumeroImpegnativa` , _json)
  }
}




