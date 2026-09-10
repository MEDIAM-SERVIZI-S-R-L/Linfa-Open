import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import levenshtein from 'fast-levenshtein';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FiltroProdottiService {

  constructor(private http: HttpClient) { }


  filtroProdotti(search_string: string, listaProdotti: any[]){
    // trasformo la stringa di ricerca in input con una regexp che non tiene conto della posizione delle parole contenute nella stringa di ricerca
    const regex_search_string = new RegExp(`(?=.*${search_string.replace(' ', ')(?=.*')})`, 'i');   
    // oggetto temporaneo dove mi salverò i risultati della scelta
    const temp_results_array = [];
  
        // per ogni elemento contenuto nella lista dei prodotti faccio un match con la regexp strutturata poco fa
      // se il match avviene, il prodotto viene caricato nell'oggetto temporaneo json_results_array, con abbinata la distanza di Levenshtein corrispondente
      // che viene calcolata solo nel caso in cui ci sia il match, per motivi di ottimizzazione
      // successivamente riordino gli oggetti contenuti nel JSON in questo modo:
      // - se il primo token della stringa di ricerca corrisponde all'inizio della stringa del prodotto, allora questo avrà priorità di ordine maggiore 
      //   e andrà in cima. Verrà poi ordinato in base alla sua Levenshtein distance
      // - se non c'è il match, allora avrà priorità di ordine minore e andrà in fondo. Verrà poi ordinato in base alla sua Levenshtein distance tra quelli che
      //   non hanno rispettato il matching
  
    listaProdotti.forEach(element => {
      if (element['prodotto'].match(regex_search_string)){   // match sul 
         temp_results_array.push({"prodotto": element, "lev_distance": levenshtein.get(`/${search_string}/i`, element['prodotto'])});
         temp_results_array.sort(function(a,b) {
             // estraggo il primo token dalla stringa di ricerca, nel caso sia una stringa con più parole
             if(/\s/g.test(search_string)){
                 search_string = search_string.split(' ').shift();
             }
             const regexp = new RegExp('^' + search_string, 'i');  // regexp per il matching del token, lo metto case insensitive
             // var aa  = a.prodotto.prodotto; // variabile di controllo
             // var bb = b.prodotto.prodotto; // variabile di controllo
  
             const aStarts = regexp.test(a.prodotto.prodotto);     //check per capire se la stringa a inizia con il token estratto prima
             const bStarts = regexp.test(b.prodotto.prodotto);     //check per capire se la stringa b inizia con il token estratto prima
             
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
  
  temp_results_array.forEach(element => json_results_array.push(element.prodotto));
  //json_results_array.forEach(element => console.log(element.prodotto));
  // mostro i risultati del json
  
  //json_results_array.forEach(element => console.log(element.prodotto.prodotto));
  return json_results_array;
  }



  filtroComuni(search_string: string, listaComuni: any[]){

    // trasformo la stringa di ricerca in input con una regexp che non tiene conto della posizione delle parole contenute nella stringa di ricerca
    const regex_search_string = new RegExp(`(?=.*${search_string.replace(' ', ')(?=.*')})`, 'i');   
    // oggetto temporaneo dove mi salverò i risultati della scelta
    const temp_results_array = [];
    
      listaComuni.forEach(element => {       

      if (element['comune'].match(regex_search_string)){   // match sul 
        
         temp_results_array.push({"comune": element, "lev_distance": levenshtein.get(`/${search_string}/i`, element['comune'])});
         temp_results_array.sort(function(a,b) {
             // estraggo il primo token dalla stringa di ricerca, nel caso sia una stringa con più parole
             if(/\s/g.test(search_string)){
                 search_string = search_string.split(' ').shift();
             }
             const regexp = new RegExp('^' + search_string, 'i');  // regexp per il matching del token, lo metto case insensitive

             //debugger
             const aStarts = regexp.test(a.comune.comune);     //check per capire se la stringa a inizia con il token estratto prima
             const bStarts = regexp.test(b.comune.comune);     //check per capire se la stringa b inizia con il token estratto prima     
             
             
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
  
  temp_results_array.forEach(element => json_results_array.push(element.comune));
  //json_results_array.forEach(element => console.log(element.prodotto));
  // mostro i risultati del json
  
  //json_results_array.forEach(element => console.log(element.prodotto.prodotto));
  return json_results_array;
  }
}
