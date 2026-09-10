import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// servizio per loader
import { LoaderService, SnackBarService } from 'src/app/_core/services/loader.service'
import * as env from 'src/environments/environment'
import { AppGeneralService } from 'src/app/_core/services/app-general.service';


@Injectable({
  providedIn: 'root'
})
export class HttpStatisticheService {

  urlBackend = env.environment.apiUrl + env.environment.requestPath;

  constructor(private http: HttpClient,
    private loader: LoaderService,
    private appGen: AppGeneralService,
    private notificate: SnackBarService) { }

  // Http Options
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      //'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Accept',
    })
  };

  async getAnamanesiPatologicheProssime(obj) {
    // this.loader.start();

    const options = { headers: this.httpOptions.headers };

    return await this.http.post<any>(this.urlBackend + 'anamanesiPatologicheProssime', obj, options).toPromise()
      .then(data => {
        return data.resultData;
      })
      .finally(() => {
        this.loader.stop();
      });
  }


  async getUtenti(obj) {
    let options = { headers: this.httpOptions.headers };

    return await this.http.post<any>(this.urlBackend + 'getUtenti', obj, options).toPromise()
      .then(data => {
        return data.resultData;
      })
      .finally(() => {
        this.appGen.loadingPanel.hide();
      });
  }

  async getListaAmbulatori() {
    return await this.http.get<any>(this.urlBackend + 'ambulatori').toPromise().then(data => {
      return data;
    })
  }

  async getDettaglioMacroPatologia(obj) {
    // this.loader.start();

    let options = { headers: this.httpOptions.headers };

    return await this.http.post<any>(this.urlBackend + 'getDettaglioMacroPatologia', obj, options).toPromise()
      .then(data => {
        return data.resultData;
      })
      .finally(() => {
        this.loader.stop();
      });
  }



  async getEtaPazienti(obj) {
    // this.loader.start();
    let options = { headers: this.httpOptions.headers };

    return await this.http.post<any>(this.urlBackend + 'getEtaPazienti', obj, options).toPromise()
      .then(data => {
        return data.resultData;
      })
      .finally(() => {
        this.loader.stop();
      });
  }

  async getTipoVisite(obj) {
    // this.loader.start();
    let options = { headers: this.httpOptions.headers };

    return await this.http.post<any>(this.urlBackend + 'GetTipoVisite', obj, options).toPromise()
      .then(data => {
        return data.resultData;
      })
      .finally(() => {
        this.loader.stop();
      });
  }



}
