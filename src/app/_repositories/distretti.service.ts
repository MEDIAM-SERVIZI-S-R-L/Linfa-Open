import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TipoEnti } from '../_core/helpers/enums';
import { IDistrettoDTO, IEnteDTO, IEntiXUtenteDTO, IMedicoXDistrettoDTO, IOspedaleDTO, IRepartoDTO, IUtenteBaseDTO } from '../_dtos/in';
import { DatMediciDistrettoToDTO, DistrettoToDTO, IUtenteDaAssociareToDTO, OspedaleToDTO, RepartoToDTO, UtenteDaAssociareToDTO } from '../_dtos/out';
import { UtenteMedico } from '../_models/common';
import { Distretto, Ente, EntiXUtente, MedicoXDistretto, Ospedale, Reparto } from '../_models/configurazione';


@Injectable({
  providedIn: 'root'
})
export class DistrettiService {

  constructor(private http: HttpClient, private route: ActivatedRoute) {}


  apiUrl: string = environment.apiUrl + 'Linfa/';

  resultData(item: any) {
    return item.resultData
  }


  
  ///FUNZIONE CHE RESTITUISCE L'ARRAY DI TUTTI I DISTRETTI
  public getListaDistretti():Observable<Distretto[]>{
    return this.http.get<IDistrettoDTO[]>(`${this.apiUrl}getlistadistretti/`)
    .pipe(
      map((data) =>{
        const obj: Distretto[] = [];
        data.forEach((item) =>{
          obj.push(new Distretto(item));
        });
        return obj;
      })
    )
  }


  checkDistretto(idDistretto: number): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}checkrichiestedistretti/` + idDistretto)
  }


  ///FUNZIONE CHE PERMETTE DI AGGIUNGERE, MODIFICARE O ELIMINARE UN DISTRETTO
  addDistretto(_json: DistrettoToDTO):Observable<number>{
    return this.http.post<number>(`${this.apiUrl}insertupdatedistretto/`,
    _json);
  }


  getListaOspedali(): Observable<Ospedale[]>{
    return this.http.get<IOspedaleDTO[]>(`${this.apiUrl}getlistaospedali/`)
    .pipe(
      map((data) =>{
        const obj: Ospedale[] = [];
        data.forEach((item) =>{
          obj.push(new Ospedale(item))
        });
        return obj;
      })
    )
  }


  checkOspedale(idOspedale: number): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}checkrichiesteospedale/` + idOspedale)
  }


  addOspedale(_json: OspedaleToDTO):Observable<any>{
    return this.http.post<IOspedaleDTO[]>(`${this.apiUrl}insertupdateospedale/`,
    _json);
  }


  getListaReparti(id: number) :Observable<Reparto[]>{
    return this.http.get<IRepartoDTO[]>(`${this.apiUrl}getlistareparti/`+ id)
    .pipe(
      map((data) =>{
        const obj: Reparto[] = [];
        data.forEach((item) =>{
          obj.push(new Reparto(item))
        });
        return obj;
      })
    )
  }

  checkReparto(idReparto: number): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}checkrichiestereparti/` + idReparto)
  }


  addReparto(_json: RepartoToDTO):Observable<any>{
    return this.http.post<any[]>(`${this.apiUrl}insertupdatereparto/`,
    _json);
  }


  getListaTipoEnti():Observable<any>{
    return this.http.get<IEnteDTO[]>(`${this.apiUrl}getlistatipoenti/`)
    .pipe(
      map((data)=>{
        const obj: Ente[] = [];
        data.forEach((item)=>{
          obj.push(new Ente(item))
        });
        return obj;
      })
    )
  }

    getEntiXUtente(idUtente: string, idEnte: number):Observable<any>{
    return this.http.get<IEntiXUtenteDTO[]>(`${this.apiUrl}entixutente_all/`+ idUtente + '/' + idEnte)
    .pipe(
      map((data)=>{
        const obj: EntiXUtente[] = [];
        data.forEach((item)=>{
          obj.push(new EntiXUtente(item))
        });
        return obj;
      })
    )
  }

  cambiaAssociazioneXUtente(_json: UtenteDaAssociareToDTO):Observable<any>{
    return this.http.post<IUtenteDaAssociareToDTO[]>(`${this.apiUrl}InsertUpdateUtenteEnte/`,
    [_json]);
  }

  getMediciXDistretto(_idDistretto: number): Observable<MedicoXDistretto[]>{
    return this.http.get<IMedicoXDistrettoDTO[]>(`${this.apiUrl}getMediciXDistretto/` + _idDistretto)
    .pipe(
      map((data) => {
        const obj : MedicoXDistretto[] = [];
        data.forEach( (element) => {
          obj.push(new MedicoXDistretto(element))
      });
      return obj
    })
    )
  }


  manageMediciDistretti(_json: DatMediciDistrettoToDTO[]) :Observable<any>{
    return this.http.post<any>(`${this.apiUrl}managemedicidistretti/`, _json);
  }

  getMediciXDistrettoXRichiesta(tipoEnte : TipoEnti) :Observable<UtenteMedico[]>{
    const obj = {
      tipoUtente : tipoEnte
    }
    return this.http.post<any>(`${this.apiUrl}getMediciXDistrettoXRichiesta/`, obj)
    .pipe(
      map((data) => {
        const responsApi: IUtenteBaseDTO[] = this.resultData(data)
           // trasformo DTO al oggetto desiderato
           const response: UtenteMedico[] = []

           responsApi.forEach((i) => {
             response.push(new UtenteMedico(i))
           })
           return response
      })
    )
   }
}



