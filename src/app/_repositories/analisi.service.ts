/* eslint-disable no-irregular-whitespace */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICategoriaAnalisiDTO, IDettaglioRangeDTO, IProprietaAnalisiDTO } from '../_dtos/in';
import { DettaglioRangeToDTO, ProprietaAnalisiToDTO } from '../_dtos/out';
import { CategoriaAnalisi, DettaglioRange, ProprietaAnalisi } from '../_models/paziente';

@Injectable({
  providedIn: 'root'
})
export class AnalisiService {
  apiUrl: string = environment.apiUrl + 'Linfa/'
  apiUrlDizionario: string = environment.apiUrl + 'dizionari/'


  constructor(private http: HttpClient, private route: ActivatedRoute) { }

    /** * Funzione che dall' oggetto generico con la risposta ritorna solo la risposta  * @param item - risposta generica data da API  * @returns - solo valore della proprietà .resultData  */
    resultData(item: any) {
      return item.resultData;
    }

  getCategoriaEsami(): Observable<CategoriaAnalisi[]>{
    return this.http
    .get<ICategoriaAnalisiDTO[]>(
      `${this.apiUrl}getcategorieesami`
    )
    .pipe(
      map((data) => {
        const obj: CategoriaAnalisi[] = [];
        data.forEach((item) => {
          obj.push(new CategoriaAnalisi(item));
        });
        return obj;
      })
    )
  }


  getXValoriEsami(categoria: number) :Observable<ProprietaAnalisi[]>{
    return this.http
    .get<IProprietaAnalisiDTO[]>(
      `${this.apiUrl}getxvaloriesami/` + categoria
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

  getRangeXValoreEsame2(_param: number): Observable<any[]> {
    return this.http.get<IDettaglioRangeDTO[]>(
      `${this.apiUrl}getxrangeesami/` + _param
    )}

  getRangeXValoreEsame(_param: number): Observable<DettaglioRange[]> {
    return this.http.get<IDettaglioRangeDTO[]>(
      `${this.apiUrl}getxrangeesami/` + _param
    ).pipe(
      map((data) => {
        const obj: DettaglioRange[] = [];
        data.forEach((item) => {
          obj.push(new DettaglioRange(item));
        });

        return obj;
      })
    );
  }


  getUnitaMisura(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}unitamisura/`)
      .pipe(
        map((data) => {
          return this.resultData(data);
        })
      );
  }

  manageXValoriEsame(_json: ProprietaAnalisiToDTO) :Observable<any[]>{ 
    return this.http.post<any[]>(`${this.apiUrl}managexvaloriesame/`, [_json]);
  }


  manageRangeXValoreEsame(_json: DettaglioRangeToDTO): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}managexrangeesame/`,
      [_json]
    );
  }

  checkvaloreesame(id: number):Observable<any>{
    return this.http.get<any>(`${this.apiUrl}checkvaloreesame/` + id);
  }


}
