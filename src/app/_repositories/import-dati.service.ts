import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IManageDefaultDataDTO } from '../_dtos/in';
import { DefaultData, ManageDefaultData } from '../_models/configurazione';

@Injectable({
  providedIn: 'root'
})
export class ImportDatiService {

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  apiUrl: string = environment.apiUrl + 'Linfa/'


  // manageDefaultData() :Observable<ManageDefaultData[]>{
  //   return this.http.get<IManageDefaultDataDTO[]>(`${this.apiUrl}managedefaultdata`)
  //   .pipe(
  //     map((data) => {
  //       const obj : ManageDefaultData[] = [];
  //       data.forEach((item)  => {
  //         obj.push(new ManageDefaultData(item));
  //       });
  //       return obj
  //     })
  //   )
  // }

  defaultDataList():Observable<DefaultData[]>{
    return this.http.get<string[]>(`${this.apiUrl}defaultdatalist`)
    .pipe(
      map((data) =>{
        const obj : DefaultData[] = [];
        data.forEach((item) => {
          obj.push ( new DefaultData(item))
        });
        return obj
      })
    )
  }


  manageDefaultData(_array: string[]) :Observable<ManageDefaultData[]>{
    // const httpOptions: { headers; observe; } = {
    //   headers: new HttpHeaders({
    //     'Content-Type':  'application/json'
    //   }),
    //   observe: 'response'
    // };
    return this.http.post<IManageDefaultDataDTO[]>(`${this.apiUrl}managedefaultdata`, _array)
    .pipe(
          map((data) => {

            const obj : ManageDefaultData[] = [];
            data.forEach((item)  => {
              obj.push(new ManageDefaultData(item));
            });
            return obj
          })
        )
  }


  

}
