/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, firstValueFrom, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { FiltroProdottiService } from 'src/app/_core/services/prodotti.service';
import { gestioneConfezionamentiGareToDTO, IgestioneConfezionamentiGareToDTO } from 'src/app/_dtos/out';
import { IconfezionamentoGare, IgestioneConfezionamentiGare} from 'src/app/_models/confezionamenti';
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service';
import _ from 'underscore';

@Component({
  selector: 'app-modal-confezionamento-gara',
  templateUrl: './modal-confezionamento-gara.component.html',
  styleUrls: ['./modal-confezionamento-gara.component.scss'],
})
export class ModalConfezionamentoGaraComponent implements OnInit, AfterViewInit{
  idTipoProdotto: number
  confezionamento: any
  idGara
  dataSource = new MatTableDataSource()
  displayedColumns: string[] = ['quantita', 'prezzo', 'disponibile', 'dataCreazione', 
  // 'dataModifica',
   'check' ]

  confezioneAssociata: boolean;

  confezionamentiSelezionati: number[] = [];
  confezionamentiNonSelezionati: number[] = [];
  listaIdConfezionamenti : number[] = [];

  nomeProdotto = 'Ricerca prodotto';

  confezionamentoDaPassare: IgestioneConfezionamentiGareToDTO;

  listaProdotti:  any = [];
  public listaProdottiFiltrata : ReplaySubject<[]> = new ReplaySubject<[]>(1);
  protected _onDestroy = new Subject<void>()

  filtroConfezionamenti = new FormControl('');

  listaTipiAlimentazioneArtificiale = [];

  idProdotto: number;

  selectVisibile = true;

  prodottoSelezionabile = true;

  confezionamentiAssenti = false;

  tuttiIConfezionamentiAssociati = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
    private confService: ConfezionamentiService,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalConfezionamentoGaraComponent>,
    private notificate: SnackBarService,
    private prodServ : FiltroProdottiService,
    public appGen: AppGeneralService,
    private router: Router
  ) 
  {
    this.appGen.loadingPanel.show();
    if (this.data.idProdotto) {
      this.idProdotto = this.data.idProdotto;
    } 
    
    if (this.data.idGara) {
    this.idGara = this.data.idGara;
  }else{
    this.idGara = this.data;
  }
}

  ngOnInit(): void {
    this.getTipiAlimientazioneArtificiale();
    if (this.data.idProdotto) {
      this.getProdottoFromId(null);
      this.selectVisibile = false;
    }
    this.setFiltroRicercaConfezionamenti();
    this.appGen.loadingPanel.hide();    
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  ///FUNZIONE CHE VIENE RICHIAMATA PER RECUPERARE I TIPI DI ALIMENTAZIONE ARTIFICIALE
  async getTipiAlimientazioneArtificiale(){
    let x = await firstValueFrom(this.confService.getTipoAlimentazioneArtificiale());
    this.listaTipiAlimentazioneArtificiale = x.resultData;
   }


   ///FUNZIONE CHE RECUPERA I PRODOTTI UNA VOLTA SELEZIONATA IL TIPO DI ALIMENTAZIONE ARTIFICIALE
  async getListaProdotti(idArtificiale: number){
    let x = await firstValueFrom(this.confService.getConfezioniGarePerTipoArtificiale(this.idGara, idArtificiale))
    this.listaProdotti = x.resultData.lista;
    for (const prodotto of this.listaProdotti) {
      let x = _.where(prodotto.confezionamenti, {abilitatoXGara: true})
      if (x.length > 0) {
        prodotto.abilitatoXGara = false;
      }else if(x.length <= 0){
        prodotto.abilitatoXGara = true;
      }
    }    

    this.listaProdottiFiltrata.next(this.listaProdotti.slice());
  }


  setFiltroRicercaConfezionamenti(){
    this.filtroConfezionamenti.valueChanges
    .pipe(
      debounceTime(500),
      takeUntil(this._onDestroy))
     .subscribe((item : string) => {
     this.setConfezioni(item);
     })
  }

  setConfezioni(confezionamentoCercato: string){
    if (confezionamentoCercato.length >= 2) {
      let listaProvvisoria : any = [];
      listaProvvisoria = this.prodServ.filtroProdotti(confezionamentoCercato, this.listaProdotti);
      this.listaProdottiFiltrata.next(listaProvvisoria.slice());
    } else if (confezionamentoCercato.length < 2){
      this.listaProdottiFiltrata.next(this.listaProdotti.slice());
    }
  }

  ///FUNZIONE CHE MANDA ALLA PAGINA RELATIVA AL PRODOTTO PER INSERIRE O MODIFICARE RELATIVI CONFEZIONAMENTI
  goToMiscela() {
    this.dialog.closeAll();
    this.router.navigate(['/app/prodotti/dettaglio/prodotto', this.idProdotto], { queryParams: { type: 'miscele' } });
  }


  ///FUNZIONE CHE VIENE RICHIAMTA NELL'ONINIT IN CASO NEL COMPONENTE LISTA-PRODOTTI VENGA RICHIAMATA LA MODALE TRAMITE EDIT,
  ///VIENE INVECE RICHIAMATA, NEL CASO IN CUI LA MODALE VENGA RICHIAMATA COME NUOVA AGGIUNTA, AL MOMENTO IN CUI VIENE SELEZIONATO IL PRODOTTO DALLA SELECT.
  async getProdottoFromId(idProdotto) { 

    if (!this.data.idProdotto) {
      this.idProdotto = idProdotto;
    }

    const oggettoProdotto = await firstValueFrom(
      this.confService.getProdottoById(this.idProdotto)
    )
    const prodotto = oggettoProdotto.resultData;  

    const prodottoSpecifico = prodotto.prodotto;

    this.idTipoProdotto = prodottoSpecifico.idTipoProdotto;
    
    this.nomeProdotto = prodottoSpecifico.prodotto;

    if (this.idTipoProdotto === 2) {
      this.confezionamento = prodotto.confezionamenti;
      this.dataSource.data = this.confezionamento;    
    }

    if (this.dataSource.data.length <= 0) {
      this.confezionamentiAssenti = true;
    }else if(this.dataSource.data.length > 0){
      this.confezionamentiAssenti = false;
    }
    this.importaDatiModale();

    this.appGen.loadingPanel.hide();
  }

  ///FUNZIONE CHE IMPORTA I DATI PER LA TABELLA
  importaDatiModale() {
    if (this.confezionamento != undefined) {
      for (const confezionamento of this.confezionamento) {
        const lista = confezionamento.listaGare;
        this.listaIdConfezionamenti.push(confezionamento.id);
        const x = lista.includes(this.idGara)
        confezionamento.associato = x;
        if (confezionamento.associato) {
          this.confezionamentiSelezionati.push(confezionamento.id);
        } else if(!confezionamento.associato){
          this.confezionamentiNonSelezionati.push(confezionamento.id);
        }       
      }
    }else{
      alert('no conf');
    }
   
  }

  ///FUNZIONE SULLA CHECKBOX RELATIVA A OGNI CONFEZIONE, DOVE CAMBIA LO STATUS DI ASSOCIAZIONE SUL CONFEZIONAMENTO IN QUESTIONE
  async cambiaAssocia(element) {
    
    let arrayConfezioni : IconfezionamentoGare[] = [];
    let confezionamentoSelezionato : IconfezionamentoGare;
    let confezionamentoNonSelezionato : IconfezionamentoGare;
    let confezionamentoXGara: IgestioneConfezionamentiGare;


    if (element.associato === true) {
      element.associato = false;
      this.confezionamentiNonSelezionati.push(element.id);
      this.confezionamentiSelezionati = _.difference(this.listaIdConfezionamenti, this.confezionamentiNonSelezionati);
      
    } else if (element.associato === false) {
      element.associato = true;
      this.confezionamentiSelezionati.push(element.id);
      this.confezionamentiNonSelezionati = _.difference(this.listaIdConfezionamenti, this.confezionamentiSelezionati);

    }

    this.confezionamentiSelezionati.forEach(element => {
      confezionamentoSelezionato = {
        idConfezionamento : element,
        recordEliminato : false
      }
      arrayConfezioni.push(confezionamentoSelezionato);
    });

    this.confezionamentiNonSelezionati.forEach(element => {
      confezionamentoNonSelezionato = {
        idConfezionamento : element,
        recordEliminato: true
      }
      arrayConfezioni.push(confezionamentoNonSelezionato);
    });


    confezionamentoXGara = {
      idGara : this.idGara,
      confezionamentiGare: arrayConfezioni
    }
     this.confezionamentoDaPassare = new gestioneConfezionamentiGareToDTO(confezionamentoXGara);
  }


  ///FUNZIONE LEGATA ALLA CHECKBOX "ASSOCIA TUTTI", ASSOCIA E DISSOCIA TUTTE LE CONFEZIONI PRESENTI NELLA TABELLA.
  associaTutti(){
    let arrayConfezioni : IconfezionamentoGare[] = [];
    let confezionamentoSelezionato : IconfezionamentoGare;
    let confezionamentoNonSelezionato : IconfezionamentoGare;
    let confezionamentoXGara: IgestioneConfezionamentiGare;

    if (this.confezionamentiNonSelezionati.length > 0) {
  
      for (const confezionamento of this.confezionamento) {
        
        confezionamento.associato = true;
        this.confezionamentiSelezionati.push(confezionamento.id);
        this.confezionamentiNonSelezionati = _.difference(this.listaIdConfezionamenti, this.confezionamentiSelezionati);
      }    
  
      this.confezionamentiSelezionati.forEach(element => {
        confezionamentoSelezionato = {
          idConfezionamento : element,
          recordEliminato : false
        }
        arrayConfezioni.push(confezionamentoSelezionato);
      });
  
      confezionamentoXGara = {
        idGara : this.idGara,
        confezionamentiGare: arrayConfezioni
      }
       this.confezionamentoDaPassare = new gestioneConfezionamentiGareToDTO(confezionamentoXGara);

    } else if (this.confezionamentiNonSelezionati.length <= 0){
      for (const confezionamento of this.confezionamento) {
        
        confezionamento.associato = false;
        this.confezionamentiNonSelezionati.push(confezionamento.id);
        this.confezionamentiSelezionati = _.difference(this.listaIdConfezionamenti, this.confezionamentiSelezionati);
      }  

      this.confezionamentiNonSelezionati.forEach(element => {
        confezionamentoNonSelezionato = {
          idConfezionamento : element,
          recordEliminato: true
        }
        arrayConfezioni.push(confezionamentoNonSelezionato);
      });
  
      confezionamentoXGara = {
        idGara : this.idGara,
        confezionamentiGare: arrayConfezioni
      }
       this.confezionamentoDaPassare = new gestioneConfezionamentiGareToDTO(confezionamentoXGara);
    }

  }


  async save(){
    await firstValueFrom(this.confService.gestisciConfezionamentiXGara(this.confezionamentoDaPassare))
    this.dialogRef.close(true);
  }


  ///FUNZIONE CHE CHIUDE LA DIALOG SENZA SALVARE NULLA
  closeDialog() {
    this.dialog.closeAll();
  }

}
