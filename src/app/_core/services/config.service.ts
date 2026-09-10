import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { map, Observable } from 'rxjs'
import { ICategoriaConfigurazioneDTO,  IConfigurazioneDTO, IConfigurazioneEasyDTO } from 'src/app/_dtos/in'
import { CategoriaConfigurazioneToDTO, ConfigurazioneToDTO } from 'src/app/_dtos/out'
import { CategoriaConfigurazione,  Configurazione, ConfigurazioneEasy } from 'src/app/_models/configurazione'
import { environment } from 'src/environments/environment'
import { AppGeneralService } from './app-general.service'

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  apiUrl: string = environment.apiUrl + 'Linfa/'

  constructor(private http: HttpClient, private appGen: AppGeneralService) {}

  resultData(item) {
    return item.resultData
  }

  //#region Categorie config
  getCategorieConfigurazioni(): Observable<CategoriaConfigurazione[]> {
    return this.http.get<any>(`${this.apiUrl}getCategorieConfigurazioni`)
    .pipe(
      map((data) => {
        const resultData : ICategoriaConfigurazioneDTO[] = this.resultData(data);
        if (!this.appGen.isNullOrUndefined(resultData)) {
          const response : CategoriaConfigurazione[] = [];
          resultData.forEach(el => {
            response.push(new CategoriaConfigurazione(el))
          });
          return response
        }
      })
    )
  }

  getConfigurazioniXCategoria(_id: number):Observable<ConfigurazioneEasy[]>{
    return this.http.get<IConfigurazioneEasyDTO[]>(`${this.apiUrl}getConfigurazioniXCategoria/` + _id).pipe(
      map((data)=> {
        let response : ConfigurazioneEasy[] = [];
        data.forEach(el => {
          response.push(new ConfigurazioneEasy(el));
        });
        return response
      })
    )
  }

  insertUpdateCategoriaConfigurazione(_payload: CategoriaConfigurazioneToDTO): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}insertUpdateCategoriaConfigurazione`, _payload);
  }
  //#endregion

  insertUpdateConfigurazione(_payload: ConfigurazioneToDTO):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}insertUpdateConfigurazione`, _payload)
  }

  getConfigurazioniXCategorie(_payload: number[] = []):Observable<Configurazione[]>{
    return this.http.post<IConfigurazioneDTO[]>(`${this.apiUrl}getConfigurazioniXCategorie`, _payload)
    .pipe(
      map((data) => {
        if (!this.appGen.isNullOrUndefined(data) && data.length > 0) {
          const response : Configurazione[] = [];
          data.forEach(el => {
            response.push(new Configurazione(el))
          });
          return response
        }
      })
    )
  }
  
}
