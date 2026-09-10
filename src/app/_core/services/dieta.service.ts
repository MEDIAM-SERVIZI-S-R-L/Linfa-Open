import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProdottiAnamnesiToDTO, ProdottiPianoToDTO } from 'src/app/_dtos/out';
import { OggettoDieta, OggettoPianoNutrizionale, ProdottoDettaglio } from 'src/app/_models/prodotti';
import { SalvaDietaRequest } from 'src/app/_module/visite/_dto-visite/dto-visite';
import { environment } from 'src/environments/environment';
import { result } from 'underscore';
import { AppGeneralService } from './app-general.service';

@Injectable({
  providedIn: 'root'
})
export class DietaService {

  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlV2: string = environment.apiUrlV2 + 'Statistica/'
  
  constructor(
    private http: HttpClient,
    private appGen: AppGeneralService) {}

  resultData(item) {
    return item.resultData;
  }

  //#region ANAMNESI ALIMENTARE
  salvaAnamnesi(obj: ProdottiAnamnesiToDTO) :Observable<any>{
    return this.http.post<any>(`${this.apiUrl}salvaAnamnesi`, obj)
  }
  //#endregion 

  //#region DIETA PREDEFINITA
  getDietaPredefinita(_idDieta: string): Observable<OggettoDieta>{
    return this.http.get<any>(`${this.apiUrl}dieta/` + _idDieta)
    .pipe(
      map((data) => {
        const resultData = this.resultData(data);
        if (!this.appGen.isNullOrUndefined(resultData)) {
          const oggDieta : OggettoDieta = {
            dieta : resultData.dieta,
            prodotti : []
          }
          const array: any[] = resultData.categorie.prodotti;
          const obj: ProdottoDettaglio[] = [];
          for (const pasto of array) {
            pasto?.prodotti.forEach((element) => {
              obj.push(new ProdottoDettaglio(element))
            })
          }
          oggDieta.prodotti = obj;
          return oggDieta;
        }
      })
    )
  }



  salvaDietaPredefinita(obj: SalvaDietaRequest){
    return this.http.post<any>(`${this.apiUrl}salvadieta/`, obj);
  }
  //#endregion


  //#region PIANO NUTRIZIONALE
  salvaNutrizioneNaturale(_obj: ProdottiPianoToDTO){
    return this.http.post(`${this.apiUrl}salvanutrizionenaturale/`, _obj );
  }

  getVisitaNaturalePaziente(_obj: any, dis=false):Observable<OggettoPianoNutrizionale>{
    return this.http.post<any>(`${this.apiUrl}getVisitaNaturalePaziente/`, _obj )
    .pipe(
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
    //#endregion 


}
