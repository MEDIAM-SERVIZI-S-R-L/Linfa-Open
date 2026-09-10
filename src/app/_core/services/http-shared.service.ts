import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import FileSaver from 'file-saver';
import { Observable, fromEvent } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import * as env from 'src/environments/environment'

import { AppGeneralService } from './app-general.service';

@Injectable({
  providedIn: 'root'
})
export class HttpSharedService {


  urlBackend = env.environment.apiUrl + env.environment.requestPath;
  urlFirmaDigitale = env.environment.urlApiFirmaDigitale + env.environment.requestPathFirmaDigitale;

  constructor(private http: HttpClient,
    private appGen: AppGeneralService,
  ) { }

  // Http Options
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Accept'

    })
  };

  /**
   *
   * @param NomeMetodo
   * @param param
   * @returns
   */
  async getCallRequest(obj) {
    this.appGen.loadingPanel.show();

    let method = this.urlBackend + obj.action;

    if (!this.appGen.isNullOrUndefined(obj.param)) {
      method += '/' + obj.param
    }
    if (!this.appGen.isNullOrUndefined(obj.param2)) {
      method += '/' + obj.param2
    }

    return this.http.get<any>(method).toPromise()
      .then(data => {
        return this.returnResult(data)
      })
      .finally(() => {
        this.removeLoadignPanel()
      });
  }

  /**
 *
 * @param NomeMetodo
 * @param param
 * @returns
 */
  async postCallRequest(obj) {
    //Metto la possibilità di fare chiamate senza utilizzare il loading panel nel caso utilizziamo chiamate rapide e vogliamo vedere subito l'effetto senza caricamento
    if (this.appGen.isNullOrUndefined(obj.loadingPanel) || obj.loadingPanel) {

      this.appGen.loadingPanel.show();
    }

    const method = this.urlBackend + obj.action;


    const options = { headers: this.httpOptions.headers };
    return this.http.post<any>(method, obj.param, options).toPromise()
      .then(data => {
        return this.returnResult(data)
      })
      .finally(() => {
        this.removeLoadignPanel()

      });
  }




  /**
 *
 * @param NomeMetodo
 * @param param
 * @returns
 */
  async putCallRequest(obj) {
    this.appGen.loadingPanel.show();

    let method = this.urlBackend + obj.action;
    if (!this.appGen.isNullOrUndefined(obj.param)) {
      method += '/' + obj.param
    }


    const options = { headers: this.httpOptions.headers };
    return this.http.put<any>(method, obj.json, options).toPromise()
      .then(data => {
        return this.returnResult(data)
      })
      .finally(() => {
        this.removeLoadignPanel()

      });
  }


  /**
   *
   * @param NomeMetodo
   * @param param
   * @returns
   */
  async deleteCallRequest(obj) {
    this.appGen.loadingPanel.show();

    let method = this.urlBackend + obj.action;

    if (!this.appGen.isNullOrUndefined(obj.param)) {
      method += '/' + obj.param
    }

    return this.http.delete<any>(method).toPromise()
      .then(data => {
        return this.returnResult(data)
      })
      .finally(() => {
        this.removeLoadignPanel()
      });
  }

  returnResult(data) {
    if (!this.appGen.isNullOrUndefined(data.resultData)) {
      return data.resultData;
    }
  }

  removeLoadignPanel() {
    setTimeout(() => {

      this.appGen.loadingPanel.hide();
    }, 500);
  }

  async impersonifica(obj) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      }),
      observe: "response" as "body"
    };
    return this.http.post<any>(this.urlBackend + 'impersonificaUtente', obj, httpOptions).toPromise()
      .finally(() => {
        this.removeLoadignPanel()
      });
  }

  //SAPIO
  async AccessExternal(obj) {
    this.appGen.loadingPanel.show();

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      }),
      observe: "response" as "body"
    };
    return this.http.post<any>(this.urlBackend + 'AccessExternal', obj, httpOptions).toPromise()
      .finally(() => {
        this.removeLoadignPanel()
      })
  }


  //DOCUMENTI, FILE, IMMAGINI
  async getpdf(nomepdf) {

    window.open(this.urlBackend + 'getpdf/' + nomepdf);
  }

  async downloadFileSelected(obj) {
    this.appGen.loadingPanel.show();
    const options = { headers: this.httpOptions.headers };

    return this.http.post<any>(this.urlBackend + 'downloadFileSelected', obj, options).toPromise().then(() => {
      window.open(this.urlBackend + 'getfilezip/' + obj.idVisita);
    }).finally(() => {
      this.removeLoadignPanel()
    })
  }

  getImageHeader(): Observable<any> {
    return this.http.get(this.urlBackend + 'GetImmagineHeader', { responseType: 'blob' }).pipe(
      mergeMap((response: any) => {
        return this.returnFileReader(response)
      })
    );

  }

  getImage(id): Observable<any> {


    return this.http.get(this.urlBackend + 'GetImmagineProdotto/' + id, { responseType: 'blob' }).pipe(
      mergeMap((response: any) => {
        return this.returnFileReader(response)
      })
    );
  }

  returnFileReader(response) {
    const reader = new FileReader();
    if (response) { reader.readAsDataURL(response); }
    return fromEvent(reader, 'load').pipe(map(() => reader.result));
  }
  async GetFileName(obj) {

    this.appGen.loadingPanel.show();

    const options = { headers: this.httpOptions.headers };

    return this.http.post<any>(this.urlBackend + 'getfiledownload', obj, options).toPromise()
      .then(data => {

        return this.returnBlob(obj.idVisita, data.resultData);

      })
      .finally(() => { this.removeLoadignPanel() });
  }

  async returnBlob(idvisita, nome) {
    this.appGen.loadingPanel.show();

    const httpOptions = {
      responseType: 'blob' as 'json',

    };

    return this.http.get<any>(this.urlBackend + 'downloadFile/' + idvisita + '/' + nome, httpOptions).toPromise().then(data => {
      // var blob = new Blob([(data)], { type: "application/octet-stream" });
      const blob = new Blob([(data)], { type: "application/pdf" });
      
      return blob
      window.URL.createObjectURL(data);

      FileSaver.saveAs(blob, decodeURIComponent(nome));
    }).finally(() => {
      this.appGen.loadingPanel.hide();
    })
  }

  async downloadFile(blob, nome) {
    // var blob = new Blob([(data)], { type: "application/octet-stream" });
    // var blob = new Blob([(data)], { type: "application/pdf" });

    window.URL.createObjectURL(blob);

    FileSaver.saveAs(blob, decodeURIComponent(nome));
  }



  //FIRMA DIGITALE

  async getListaDispositiviDiFirma() {
    return this.http.get<any>(this.urlFirmaDigitale + 'listOfReaders').toPromise().then(data => {
      return data;
    })
  }

  async firmaRefertoDigitale(obj) {
    this.appGen.loadingPanel.show();
    const options = { headers: this.httpOptions.headers };
    return this.http.post<any>(this.urlFirmaDigitale + 'SignDocument', obj, options).toPromise()
      .then(async (data) => {
        return data;
      })
      .finally(() => {
        this.removeLoadignPanel()
      });
  }


  genericPost(obj:any): Observable<any> {
    try {

      const method = this.urlBackend + obj.action;
      const options = { headers: this.httpOptions.headers };
      return this.http.post<any>(method,obj.param,options)
    } catch (error) {
      console.error(error)
    }

  }




}
