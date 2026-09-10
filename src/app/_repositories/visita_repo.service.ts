import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, concatMap, firstValueFrom, map } from 'rxjs'
import { environment } from 'src/environments/environment'

import { AppGeneralService } from '../_core/services/app-general.service'
import { IConclusioni, IIcd9DTO, IMacroPrecompiledDTO, IProdottoDettaglioAnamnesiDTO, IStatoVisitaDTO } from '../_dtos/in'
import { ProdottiPianoToDTO, SaveDiagnosiToDTO } from '../_dtos/out'
import { Icd9 } from '../_models/interventi'
import { MacroPrecompiled } from '../_models/paziente'
import { OggettoAnamnesiAlimentare, OggettoPianoNutrizionale, ProdottoDettaglio } from '../_models/prodotti'

@Injectable({
  providedIn: 'root',
})
export class VisitaRepoService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlV2: string = environment.apiUrlV2 + 'Statistica/'
  constructor(private http: HttpClient,
    private appGen: AppGeneralService) {}

  /**
   *  Funzione ch dal oggetto generico con la risposta ritorna solo la risposta
   * @param item - risposta generica data da API
   * @returns - solo valore della proprietà .resultData
   */
  resultData(item) {
    return item.resultData
  }

  /**
   *  Torna oggetto con id e descrizione dell stato della visita
   * @param _idVisita - hash della id visita
   * @returns IStatoVisitaDTO
   */
  getVisitState(_idVisita: string): Observable<IStatoVisitaDTO> {
    return this.http.get<IStatoVisitaDTO>(
      `${this.apiUrl}verificastatovisita/${_idVisita}`
    )
  }

  /**
   *
   * @param _obj oggetto {
   * idVisita: number,
   * note: string
   * }
   * salva le note corrispondenti alla visita
   * @returns
   */
  salvaNoteDietista(_obj: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}salvaNoteDietista/`, _obj)
  }

  /**
   *
   * @param _idVisita : number
   * @returns le note corrispondenti alla visita
   */
  checkNoteDietistaCompilate(_idVisita: string) {
    return this.http
      .get<any>(`${this.apiUrl}checkNoteDietistaCompilate/` + _idVisita)
      .pipe(
        map((data) => {
          return this.resultData(data)
        })
      )
  }

  getICD9(_json: string): Observable<Icd9[]> {
    const objSearchString = {
      Descrizione: _json,
    }
    return this.http.post<IIcd9DTO[]>(`${this.apiUrl}icd9/`, objSearchString).pipe(
      map((data) => {
        const obj: Icd9[] = []
        data.forEach((item) => {
          obj.push(new Icd9(item))
        })
        return obj
      })
    )
  }

  /** Invio segnalazione che deve partire la sincronizazione tramite Mirth per la visita _idVisita */
  sendToMirth(_idVisita: string) {
    return this.http.get<any>(`${this.apiUrl}inviorefertimirth/` + _idVisita).pipe(
      map((data) => {
        return data
        //  return this.resultData(data)
      })
    )
  }

  getDettaglioAnamnesi(_idVisita: any, dis=false): Observable<OggettoAnamnesiAlimentare> {
    return this.http.get<any>(`${this.apiUrl}getDettaglioAnamnesi/` + _idVisita).pipe(
      map((data) => {
        const resultData = this.resultData(data);
        let obj : OggettoAnamnesiAlimentare = new OggettoAnamnesiAlimentare();
        obj.anamnesi = resultData.anamnesi;
        const prodotti: ProdottoDettaglio[] = []
        if (resultData.exist) {
          const array: any = resultData.categorie.prodotti
          for (const pasto of array) {
            pasto?.prodotti.forEach((element) => {
              prodotti.push(new ProdottoDettaglio(element,dis))
            })
          }
        }
        obj.prodotti = prodotti;
        return obj
      })
    )
  }

  getNutrizionePrecompiled(_idVisita):Observable<IMacroPrecompiledDTO>{
    return this.http.get<MacroPrecompiled>(`${this.apiUrl}getNutrizionePrecompiled/` + _idVisita).pipe(
      map((data)=> {
        const resultData = this.resultData(data);
        let obj : MacroPrecompiled = new MacroPrecompiled(resultData);
        return obj;
      })
    )
  }

  getAnamnesiAlimentarePrecedente(_idPaziente: string, dis = false) :Observable<any>{
    return this.http.get<any>(`${this.apiUrl}prodottixanamnesi/` + _idPaziente).pipe(
      map((data) =>{
        const resultData = this.resultData(data);
        if (!this.appGen.isNullOrUndefined(resultData)) {
          const array : any[] = resultData.categorie.prodotti;
          const productArray : ProdottoDettaglio[] = [];
          for (const pasto of array) {
            pasto.prodotti.forEach(element => {
              productArray.push(new ProdottoDettaglio(element, dis))
            });
          }
          return productArray;
        }
      })
    )
  }

  getPianoNutrizionalePrecedente(_idPaziente: string, dis=false) :Observable<any>{
    return this.http.get<any>(`${this.apiUrl}prodottixpianoesistente/` + _idPaziente).pipe(
      map((data) =>{
        const resultData = this.resultData(data);
        if (!this.appGen.isNullOrUndefined(resultData)) {
          const array : any[] = resultData.categorie.prodotti;
          const obj : OggettoPianoNutrizionale = new OggettoPianoNutrizionale();
          obj.diagnosi = resultData.diagnosi;
          obj.noteDietista = resultData.noteDietista;
          obj.notePianoNutrizionale = resultData.notePianoNutr;
          obj.prodotti = []
          const productArray : ProdottoDettaglio[] = [];
          for (const pasto of array) {
            pasto?.prodotti.forEach((element) => {
              productArray.push(new ProdottoDettaglio(element,dis))
            })
          }
          obj.prodotti = productArray;
          return obj;
        }
      })
    )
  }

  // getVisitaNaturalePaziente(_obj: any):Observable<OggettoPianoNutrizionale>{
  //   return this.http.post<any>(`${this.apiUrl}getVisitaNaturalePaziente/`, _obj )
  //   .pipe(
  //     map((data) =>{
  //       const resultData = this.resultData(data);
  //       if (!this.appGen.isNullOrUndefined(resultData)) {
  //         const array : any[] = resultData.categorie.prodotti;
  //         const obj : OggettoPianoNutrizionale = new OggettoPianoNutrizionale();
  //         obj.diagnosi = resultData.diagnosi;
  //         obj.noteDietista = resultData.noteDietista;
  //         obj.notePianoNutrizionale = resultData.notePianoNutr;
  //         obj.prodotti = []
  //         const productArray : ProdottoDettaglio[] = [];
  //         for (const pasto of array) {
  //           pasto?.prodotti.forEach((element) => {
  //             productArray.push(new ProdottoDettaglio(element))
  //           })
  //         }
  //         obj.prodotti = productArray;
  //         return obj;
  //       }
  //     })
  //   )
  // }

  getListaNotePredefinite():Observable<any>{
    return this.http.get<any>(`${this.apiUrl}getListConclusioniPredefinite/` + 'note')
  }

  getPianoNutrizionaleVisita(_idPiano:string):Observable<any[]>{
    return this.http.get<any>(`${this.apiUrl}getDettaglioPianoNutrizionale/` + _idPiano)
  }
  // getDettaglioAnamnesi(_idVisita:any) :Observable<ProdottoDettaglio[]>{
  //   return this.http.get<any>(`${this.apiUrl}getDettaglioAnamnesi/` + _idVisita);
  // }

  matchtiporichiesta(_idVisita: number):Observable<any>{
    return this.http.get<any>(`${this.apiUrl}matchtiporichiesta/` + _idVisita)
  }

  getListaConclusioniPredefinite():Observable<IConclusioni[]>{
    return this.http.get<IConclusioni[]>(`${this.apiUrl}getListConclusioniPredefinite/` + 'conclusioni').pipe(
      map((data) =>{
        const resultData = this.resultData(data) as IConclusioni[];
        if (!this.appGen.isNullOrUndefined(resultData)) {



          return resultData;
        }
      })
    )
  }

  postSaveUpdateDiagnosi(saveDiagnosi:SaveDiagnosiToDTO):Observable<any>{

    return this.http.post(`${this.apiUrl}aggiornadiagnosi/`, saveDiagnosi)
  }


}
