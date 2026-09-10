import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import levenshtein from 'fast-levenshtein';
import { Observable } from 'rxjs';
import { Icd9 } from 'src/app/_models/interventi';

@Injectable({
  providedIn: 'root'
})
export class FiltroICD9Service {

  constructor(private http: HttpClient) { }

    /**
   *  Funzione ch dal oggetto generico con la risposta ritorna solo la risposta
   * @param item - risposta generica data da API
   * @returns - solo valore della proprietà .resultData
   */
    filtraICD9(search_string: string, listaIcd9: Icd9[]){

      // trasformo la stringa di ricerca in input con una regexp che non tiene conto della posizione delle parole contenute nella stringa di ricerca
      const regex_search_string = new RegExp(`(?=.*${search_string.replace(' ', ')(?=.*')})`, 'i');   
      // oggetto temporaneo dove mi salverò i risultati della scelta
      const temp_results_array = [];
      
      listaIcd9.forEach(element => {       
  
        if (element['descrizione'].match(regex_search_string)){   // match sul           
           temp_results_array.push({"icd9": element, "lev_distance": levenshtein.get(`/${search_string}/i`, element['descrizione'])});
           temp_results_array.sort(function(a,b) {
               // estraggo il primo token dalla stringa di ricerca, nel caso sia una stringa con più parole
               if(/\s/g.test(search_string)){
                   search_string = search_string.split(' ').shift();
               }
               const regexp = new RegExp('^' + search_string, 'i');  // regexp per il matching del token, lo metto case insensitive
  
               //debugger
               const aStarts = regexp.test(a.icd9.descrizione);     //check per capire se la stringa a inizia con il token estratto prima
               const bStarts = regexp.test(b.icd9.descrizione);     //check per capire se la stringa b inizia con il token estratto prima     
               
               
               // algoritmo di ordinamento
               // se entrambe iniziano con il token, le ordino in base alla Levenshtein distance
               if (aStarts && bStarts) {
                   if(a.lev_distance > b.lev_distance) return 1;
                   if(a.lev_distance < b.lev_distance) return -1;
               }
               else if (aStarts && !bStarts) return -1;    // se a inizia con il token allora ha priorità di ordinamento maggiore
               else if (!aStarts && bStarts) return 1;     // se b inizia con il token allora ha priorità di ordinamento maggiore
               else {  // se entrambe non iniziano con il token, le ordino in base alla Levenshtein distance (ma staranno in basso rispetto a quelle che iniziano col token)
                   if(a.lev_distance > b.lev_distance) return 1;
                   if(a.lev_distance < b.lev_distance) return -1;
               }
               });
       }
    });
    
    const json_results_array = [];
    
    temp_results_array.forEach(element => json_results_array.push(element.icd9));
    //json_results_array.forEach(element => console.log(element.prodotto));
    // mostro i risultati del json
    
    //json_results_array.forEach(element => console.log(element.prodotto.prodotto));
    return json_results_array;
    }
  
}
