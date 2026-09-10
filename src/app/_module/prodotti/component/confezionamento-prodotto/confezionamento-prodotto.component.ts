/* eslint-disable prefer-const */
import { AfterViewInit, Component, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { ModalBristolChartComponent } from 'src/app/shared/modal/modal-bristol-chart/modal-bristol-chart.component';
import { TipoProdotto } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { SnackBarService } from 'src/app/_core/services/loader.service';
import { IConfezionamentoDTO } from 'src/app/_dtos/in';
import { ConfezionamentoToDTO } from 'src/app/_dtos/out';
import { Confezionamento, IConfezionamento, IGara } from 'src/app/_models/confezionamenti';
import { TipoProdotti } from 'src/app/_models/prodotti';
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service';
import Swal from 'sweetalert2';
import _ from 'underscore';
import { ModalConfezionamentoComponent } from '../modal-confezionamento/modal-confezionamento.component';

@Component({
  selector: 'app-confezionamento-prodotto',
  templateUrl: './confezionamento-prodotto.component.html',
  styleUrls: ['./confezionamento-prodotto.component.scss'],
})
export class ConfezionamentoProdottoComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource()
  displayedColumns: string[] = [
    'quantita',
    'disponibile',
    'prezzo',
    'listaGare',
    'dataCreazione',
    //'dataModifica',
    'button',
  ]

  @Input() idProdotto: number;
  @Input() idUnitaMisura: number

  prodotto?: any
  prodottoSpecifico: any
  confezionamento?: any
  idTipoProdotto: number

  listaGare: IGara[]

  listaProva = []

  nuovoConfezionamento!: ConfezionamentoToDTO

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    private confService: ConfezionamentiService,
    public appGen: AppGeneralService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IConfezionamento,
    public dialog: MatDialog,
    private notificate: SnackBarService
  ) {}

  ngOnInit(): void {
    if (!this.appGen.isNullOrUndefined(this.idProdotto)) {
      this.getProdottoFromId();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }



  ///LA CREAZIONE DELLA TABELLA VIENE FATTA SOLAMENTE SE È DI TIPO NUTRIZIONE ARTIFICIALE, IDTIPOPRODOTTO === 2.
  async getProdottoFromId() {
    const oggettoProdotto = await firstValueFrom(
      this.confService.getProdottoById(this.idProdotto)
    )

    this.listaGare = await firstValueFrom(this.confService.getListaGare())

    this.prodotto = oggettoProdotto.resultData

    this.prodottoSpecifico = this.prodotto.prodotto;   

    this.idTipoProdotto = this.prodottoSpecifico.idTipoProdotto

    if (this.idTipoProdotto === TipoProdotto.NutrizioneArtificiale) {
      this.confezionamento = this.prodotto.confezionamenti;
      
      //   this.dataSource.data = this.confezionamento

      for (const conf of this.confezionamento) {
        let arrayNomeGare = []
        let listaGareAssociateXConfezionamento = conf.listaGare;

        if (listaGareAssociateXConfezionamento.length > 0) {
          for (const gara of listaGareAssociateXConfezionamento) {
            let x = _.findWhere(this.listaGare, { idGara: gara });
            arrayNomeGare.push(x.gara);
          }
        }
        conf.nomeGara = arrayNomeGare;
      }
      this.dataSource.data = this.confezionamento;     
    }
  }

  addConf(prodotto: any) {   
    const element: IConfezionamento = {
      idProdotto: prodotto.id,
      disponibile: true,
      listaGare: [],
    }    

    const dialogRef = this.dialog.open(ModalConfezionamentoComponent, {
      data: element,
      panelClass: 'modal-custom',
    })

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getProdottoFromId()
      }
    })
  }

  editConf(element: IConfezionamentoDTO) {
    /// DA PRENDERE DIRETTAMENTE DAL PRODOTTO PERCHÈ NON VIENE PASSATO INIZIALMENTE///
    element.idProdotto = this.prodottoSpecifico.id;    
    const confezionamento = new Confezionamento(element)

    const dialogRef = this.dialog.open(ModalConfezionamentoComponent, {
      data: confezionamento,
      panelClass: 'modal-custom',
    })

    

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {
        this.getProdottoFromId()
      }
    })
  }

  async deleteConf(element: IConfezionamentoDTO) {    
    const confezionamento = new Confezionamento(element);    

      if (element.nPianiCoinvolti > 0) {
        Swal.fire({
          title: 'Impossibile eliminare il confezionamento poichè presente in n° ' + element.nPianiCoinvolti +' piani',
          text: 'Si vuole disabilitare il confezionamento?',
          icon: 'warning',
          iconColor: '#d33',
          showCancelButton: true,
          confirmButtonColor: '#00afa6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sì, voglio disabilitarlo!',
          cancelButtonText: 'No, annulla',
        }).then(async (result) => {
          if (result.isConfirmed) {
            const conf: IConfezionamento = {
              id: element.id? element.id : null,
              idProdotto: this.prodottoSpecifico.id,
              idUnitaMisura: confezionamento.idUnitaMisura as number,
              quantita: confezionamento.quantita as number,
              recordEliminato: false,
              disponibile: false,
              prezzo: confezionamento.prezzo as number,
              listaGare: element.listaGare,
            }
            //POST PER LA ELIMINAZIONE DEL CONFEZIONAMENTO//
            this.nuovoConfezionamento = new ConfezionamentoToDTO(conf)
            await firstValueFrom(
              this.confService.addConfezionamento(this.nuovoConfezionamento)
            )
            this.getProdottoFromId()
            this.notificate.ok('Confezionamento disabilitato con successo')
          }
        })
      }else{
      Swal.fire({
        title: 'Sei sicuro?',
        text: 'Così facendo cancellerai il confezionamento e non sarà recuperabile',
        icon: 'warning',
        iconColor: '#d33',
        showCancelButton: true,
        confirmButtonColor: '#00afa6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sì, voglio cancellarlo!',
        cancelButtonText: 'No, annulla',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const conf: IConfezionamento = {
            id: element.id? element.id : null,
            idProdotto: this.prodottoSpecifico.id,
            idUnitaMisura: confezionamento.idUnitaMisura as number,
            quantita: confezionamento.quantita as number,
            recordEliminato: true,
            disponibile: confezionamento.disponibile,
            prezzo: confezionamento.prezzo as number,
            listaGare: element.listaGare,
          }
          //POST PER LA ELIMINAZIONE DEL CONFEZIONAMENTO//
          this.nuovoConfezionamento = new ConfezionamentoToDTO(conf)
          await firstValueFrom(
            this.confService.addConfezionamento(this.nuovoConfezionamento)
          )
          this.getProdottoFromId()
          this.notificate.ok('Confezionamento cancellato con successo')
        }
      })
    }
  }
}
