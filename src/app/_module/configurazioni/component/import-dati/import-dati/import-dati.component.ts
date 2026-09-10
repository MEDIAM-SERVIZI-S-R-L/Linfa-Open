import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'process';
import { debounceTime, firstValueFrom, Subject, takeLast, takeUntil } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { DefaultData, ManageDefaultData } from 'src/app/_models/configurazione';
import { ImportDatiService } from 'src/app/_repositories/import-dati.service';
import Swal from 'sweetalert2';
import _ from 'underscore';

@Component({
  selector: 'app-import-dati',
  templateUrl: './import-dati.component.html',
  styleUrls: ['./import-dati.component.scss']
})
export class ImportDatiComponent implements OnInit{

  listaConfig: DefaultData[] = [];
  backupListaConfig : DefaultData[] = [];
  listaConfigurazioniSelezionate : DefaultData[] = [];
  listaConfigurazioniErrore : ManageDefaultData[] = [];
  allConfigSelected = false;
  dataSource = new MatTableDataSource();
  displayedColumns : string[] = ['nomeTabella', 'button'];
  displayedColumnsSelected : string[] = ['configurazione'];

  filtroConfigurazioni = new FormControl('');
  protected _onDestroy = new Subject<void>()


  @ViewChild(MatPaginator, {static: false})
   set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  
  constructor(
    private appGen: AppGeneralService,
    private importService: ImportDatiService,
    private notificate: SnackBarService
    ) { }



  ngOnInit(): void {
    this.defaultDataList();
    this.setFiltri();
  }
  

  /**
   * Tira giù la lista delle tabelle importabili da selezionare con la checkbox se si vogliono importare
   */
  async defaultDataList(){
    try {
      this.appGen.loadingPanel.show();
      this.listaConfig = await firstValueFrom(this.importService.defaultDataList());
      this.backupListaConfig = this.listaConfig;
      this.dataSource.data = this.listaConfig;  
      this.appGen.loadingPanel.hide();
    } catch (error) {
      console.error(error);
      this.appGen.loadingPanel.hide();
    }
  }


  /**
   * Verica lo stato della checkbox (SELEZIONA TUTTI)
   * @param element check della tabella
   */
  statusConfigCheck(element : DefaultData){
    element.check = !element.check;
    const listaConfigurazioniNonSelezionate = _.findWhere(this.listaConfig, {check : false});
    if (this.appGen.isNullOrUndefined(listaConfigurazioniNonSelezionate)) {
      this.allConfigSelected = true;
    } else{
      this.allConfigSelected = false;
    }

    if (element.check) {
      this.listaConfigurazioniSelezionate.push(element);
    } else if(!element.check){
      this.listaConfigurazioniSelezionate = _.reject(this.listaConfigurazioniSelezionate, element);
    }
  }


  /**
   * Seleziona tutte le checkbox/ se sono tutte selezionate le deseleziona tutte
   */
  selectAll(){
    if (!this.allConfigSelected) {
      for (const configurazione of this.listaConfig) {
        configurazione.check = true;
      }
      this.listaConfigurazioniSelezionate = this.listaConfig;
      this.allConfigSelected = true;
    } else if(this.allConfigSelected){
      for (const configurazione of this.listaConfig) {
        configurazione.check = false;
      }
      this.listaConfigurazioniSelezionate = [];
      this.allConfigSelected = false;
    }
  }



      /**
   * Esegue l'import delle tabelle selezionate
   */
      importaDati(){
        try {
          const lista = [];
          for (const configurazione of this.listaConfig) {
            if (configurazione.check) {
              lista.push(configurazione);
            }
          }
          if (lista.length <= 0) {
            ////Se non è selezionata nessuna tabella;
            this.notificate.warning('Selezionare almeno una configurazione');
          }
          else if (this.appGen.ruolo.Administrator && lista.length > 0) {
            Swal.fire({
                      title: 'Sei sicuro?',
                      html: `
                      <div>Così facendo le segguenti configurazioni verranno imporate</div>` +
                      `<div style="max-height: 360px; overflow-y: auto;"> ` +
                        this.generaLista(this.listaConfigurazioniSelezionate) + 
                        `</div>` +
                      `<div>
                      <span style="font-weight: 600; color: #00afa6;">ATTENZIONE: </span>
                      <span>L'operazione potrebbe richiedere alcuni minuti</span>
                      </div>
                      `,
                      icon: 'warning',
                      showCancelButton: true,
                      showConfirmButton: true,
                      confirmButtonColor: '#00afa6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Sì, voglio procedere',
                      cancelButtonText: 'No, annulla'
                    })
                      .then(async (result)=>{
                        if(result.isConfirmed){
                          ///Se tutte le configurazioni sono selezionate allora passo [];
                          let counter = 0;
                          Swal.fire({
                            html: `
                            Operazione in corso...
                            `
                            + counter + `/` + this.listaConfigurazioniSelezionate.length ,
                            showConfirmButton : false,
                            allowOutsideClick : false,
                            allowEscapeKey: false,
                          })
                          Swal.showLoading();
  
                            for (const configurazione of this.listaConfigurazioniSelezionate) {
                              if (configurazione.check) {
                                Swal.update({
                                  html: `
                                  Operazione in corso...
                                  `
                                  + counter + `/` + this.listaConfigurazioniSelezionate.length 
                                  + `<div> <span>Sto importando: </span>` + `<span style="font-weight: 600; color: #00afa6;">` + configurazione.nomeTabella + `</span> </div>` 
                                  ,
                                  allowOutsideClick : false,
                                  allowEscapeKey: false,              
                                })   
                                Swal.showLoading();

                                const response : ManageDefaultData[]  = await firstValueFrom(this.importService.manageDefaultData([configurazione.nomeTabella]));

                                for (const x of response) {
                                  if (!x.stato) {
                                    this.listaConfigurazioniErrore.push(x);
                                  }
                                }
                              }
                              counter++;   
                            }
                            this.alertXStatusImport(this.listaConfigurazioniErrore);
                            this.defaultDataList();
                            this.listaConfigurazioniSelezionate = [];
                            this.filtroConfigurazioni.setValue('');
                        }
                      })  
                  }
                  ////Se non è amministratore la funzione non parte; 
                  else if (!this.appGen.ruolo.Administrator) {
                    this.notificate.error("Utente non abilitato a effettuare tale operazione");
                  }
        } catch (error) {
          console.error(error);
          this.appGen.loadingPanel.hide();
        }
      }  
  


  /**
   * Alert che comunica se sia stato effettuato correttamente l'import oppure se ha avuto qualche variazione;
   * in caso di errore viene comunicato
   * @param listaConfigurazioniImportate lista delle configurazioni importate/aventi errori di importazione
   */
  alertXStatusImport(listaConfigurazioniImportate: ManageDefaultData[]){
    const x = _.where(listaConfigurazioniImportate, {stato : false});
    ///NON SONO PRESENTI ERRORI DURANTE IL PASSAGGIO
    if(this.appGen.isNullOrUndefined(x) || x.length <= 0){
      Swal.fire({
        title: 'Import avvenuto con successo!',
        text: "Non sono stati riscontrati errori durante l'import",
        icon: 'success',
      })
    } else if (x.length > 0) {
      //Compila il messaggio con la lista degli import falliti
      Swal.fire({
        title: "Sono stati riscontrati errori durante l'import.",
        html: `
        <div > 
        È stato eseguito l'import, le seguenti configurazioni non sono state importate:
          <ul style="max-height: 360px; overflow-y: auto;">` 
          + this.generaLista(x) + 
          `
          </ul>
        </div>`,
        icon: 'info',
      })
    }
  }

  /**
   * Compila la lista per essere inserita nell'alert
   * @param lista lista degli import falliti
   * @returns 
   */
  generaLista(lista: ManageDefaultData[]| DefaultData[]){
    let optionItems;
    lista.forEach(item =>{
      if (this.appGen.isNullOrUndefined(optionItems)) {
        optionItems = `<p>${item.nomeTabella}</p>`
      } else if (!this.appGen.isNullOrUndefined(optionItems)){
        optionItems += `<p>${item.nomeTabella}</p>`
      }
    })
    return optionItems
  }


  
  setFiltri(){
    this.filtroConfigurazioni.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
    .subscribe((item) =>{
      this.listaConfig = this.backupListaConfig;
      if (item.length > 0) {
        this.filtraConfigurazioni(item);
      } else if (item.length <=0){
        this.listaConfig = this.backupListaConfig;
        this.dataSource.data = this.listaConfig;
      }
    })
  }

  filtraConfigurazioni(item: string){
    this.listaConfig = _.filter(this.listaConfig, function(element){
      return element.nomeTabella.toLowerCase().includes(item.toLowerCase())});
    this.dataSource.data = this.listaConfig;
  }
    
  /**
   * Esegue l'import delle tabelle selezionate
   */
  // importaDati(){
  //   try {
  //     const lista = [];
  //     for (const configurazione of this.listaConfig) {
  //       if (configurazione.check) {
  //         lista.push(configurazione);
  //       }
  //     }
  //     if (lista.length <= 0) {
  //       ////Se non è selezionata nessuna tabella;
  //       this.notificate.warning('Selezionare almeno una configurazione');
  //     }
  //     else if (this.appGen.ruolo.Administrator && lista.length > 0) {
  //       Swal.fire({
  //                 title: 'Sei sicuro?',
  //                 html: `
  //                 <div>Così facendo tutte le configurazioni verranno imporate</div>
  //                 <div>
  //                 <span style="font-weight: 600; color: #00afa6;">ATTENZIONE: </span>
  //                 <span>L'operazione potrebbe richiedere alcuni minuti</span>
  //                 </div>
  //                 `,
  //                 icon: 'warning',
  //                 showCancelButton: true,
  //                 showConfirmButton: true,
  //                 confirmButtonColor: '#00afa6',
  //                 cancelButtonColor: '#d33',
  //                 confirmButtonText: 'Sì, voglio procedere',
  //                 cancelButtonText: 'No, annulla'
  //               })
  //                 .then(async (result)=>{
  //                   if(result.isConfirmed){
  //                     ///Se tutte le configurazioni sono selezionate allora passo [];
  //                     if (this.allConfigSelected) {
  //                       this.appGen.loadingPanel.show();
  //                       const response : ManageDefaultData[]  = await firstValueFrom(this.importService.manageDefaultData([]));
  
  //                       this.appGen.loadingPanel.hide();
  //                       for (const configurazione of this.listaConfig) {
  //                         configurazione.check = false;
  //                       }
  //                       this.allConfigSelected = false;

  //                       this.alertXStatusImport(response);


  //                     }
  //                     ///Se invece non lo sono tutte, veiene passato solo un array delle tabelle selezionate; 
  //                     else if(!this.allConfigSelected){
  //                       this.appGen.loadingPanel.show();
  //                       const listaConfigurazioniSelezionate : string[] = [];
                       
  //                       for (const configurazione of this.listaConfig) {
  //                         if (configurazione.check) {
  //                           listaConfigurazioniSelezionate.push(configurazione.nomeTabella);
  //                         }
  //                       }  
  //                       const response : ManageDefaultData[] = await firstValueFrom(this.importService.manageDefaultData(listaConfigurazioniSelezionate)); 

  //                       this.appGen.loadingPanel.hide();   
  //                       for (const configurazione of this.listaConfig) {
  //                         configurazione.check = false;
  //                       }
  //                       this.allConfigSelected = false;  
                        
  //                       this.alertXStatusImport(response);
  //                     }
  //                   }
  //                 })  
  //             }
  //             ////Se non è amministratore la funzione non parte; 
  //             else if (!this.appGen.ruolo.Administrator) {
  //               this.notificate.error("Utente non abilitato a effettuare tale operazione");
  //             }
  //   } catch (error) {
  //     console.error(error);
  //     this.appGen.loadingPanel.hide();
  //   }
  // }

}
