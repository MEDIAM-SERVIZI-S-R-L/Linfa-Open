import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { MatSelect } from '@angular/material/select'
import { MatTableDataSource } from '@angular/material/table'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { TipoProdotto } from 'src/app/_core/helpers/enums'
import { ModalInfoMiscelaComponent } from 'src/app/_module/prodotti/component/miscele/modal-info-miscela/modal-info-miscela.component'
import { ModalCreaSaccaComponent } from 'src/app/_module/prodotti/component/miscele/modal-crea-sacca/modal-crea-sacca.component'
import { ModalInfoProdottiComponent } from 'src/app/shared/modal/modal-info-prodotti/modal-info-prodotti.component'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import _ from 'underscore'
import { firstValueFrom } from 'rxjs'
import { confezionamentoGareToDTO } from 'src/app/_dtos/out'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import { Confezionamento } from 'src/app/_models/confezionamenti'
import moment from 'moment'
import { element } from 'protractor'
@Component({
  selector: 'app-tabella-prodotti',
  templateUrl: './tabella-prodotti.component.html',
  styleUrls: ['./tabella-prodotti.component.scss'],
})
export class TabellaProdottiComponent implements OnInit {
  prodottiDataSource = new MatTableDataSource<any>()
  //prodottiViewsColumns = ["nomeProdotto", "quantita", "velocitaSomministrazione", "kcal", "proteine", "azoto", "acqua", "pulsanti"]
  prodottiViewsColumns = [
    'nomeProdotto',
    'quantita',
    'confezionamenti',
    'velocitaSomministrazione',
    'kcal',
    'proteine',
    'acqua',
    'confezioni',
    // 'prezzoTot',
    'pulsanti',
  ]
  @Input() kcal
  @Input() proteine
  @Input() azoto
  @Input() apportoIdrico
  @Input() prodotti = []
  @Input() isRiepilogo
  @Input() stepVisita
  @Input() fromFollowUp
  @Input() notePianoNutr
  @Input() idGara
  @Input() isDettaglio
  @ViewChild('modalitaselect') modalitaselect: MatSelect

  tipoProdotto = TipoProdotto

  kcalTot = 0
  proteineTot = 0
  azotoTot = 0
  apportoIdricoTot = 0
  listametodoAssunzione
  showInputModalita = false
  @Input() dataPianoNutrizionale
  isDettaglioPianoNutrizionale = false

  listaConfezionamenti = []
  note = ''
  listaNotePredefinite
  form: FormGroup

  formConfezionamenti = new FormGroup({
    confezionamento: this.formBuilder.array([])
  });

  constructor(
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private confService: ConfezionamentiService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      notePredefinite: new FormControl(''),
    })
    this.getMetodoAssunzione()
    this.getListNotePredefinite()

    // this.prodottiDataSource = new MatTableDataSource<any>();
    // this.prodottiDataSource.data = this.prodotti;

    //Se sono nel dettaglio di un piano nutrizionale
    if (!this.appGen.isNullOrUndefined(this.dataPianoNutrizionale)) {
      this.prodotti = this.dataPianoNutrizionale.prodotti
      this.isRiepilogo = true
      this.isDettaglioPianoNutrizionale = true

      //se esiste la nutrizione, prendo i dati della visita riguardanti a di kcal, prot, azoto e acqua calcolati dalla visita
      if (
        !this.appGen.isNullOrUndefined(this.dataPianoNutrizionale.nutrizioneArtificiale)
      ) {
        this.kcal = this.dataPianoNutrizionale.nutrizioneArtificiale.kcal
        this.proteine = this.dataPianoNutrizionale.nutrizioneArtificiale.proteine
        this.azoto = this.dataPianoNutrizionale.nutrizioneArtificiale.azoto
        this.apportoIdrico =
          this.dataPianoNutrizionale.nutrizioneArtificiale.apportoIdrico
        this.notePianoNutr =
          this.dataPianoNutrizionale.nutrizioneArtificiale.notePianoNutr
      }

      this.generateTable()
      this.refreshTable()
    } else {
      this.generateTable()
    }
  }

  ngOnChanges(changes) {
    if (!this.appGen.isNullOrUndefined(changes.isRiepilogo)) {
      this.isRiepilogo = changes.isRiepilogo.currentValue
      this.stepVisita = true
    }
    if (!this.appGen.isNullOrUndefined(changes.notePianoNutr)) {
      if (!this.appGen.isNullOrUndefined(changes.notePianoNutr.currentValue)) {
        this.note = changes.notePianoNutr.currentValue
      }
    }

    //this.getListaConfezionamenti();
  }

  /**
   * Funzione che viene richiamata ogni volta che viene generata e refreshata la tabella;
   * La chiamata parte solo se l'id è di tipo nutrizione artificiale;
   */
  async getListaConfezionamenti() {
    try {
      for (const prodotto of this.prodotti) {
        prodotto.confezionamenti = []

        if (
          prodotto.idTipoProdotto === TipoProdotto.NutrizioneArtificiale &&
          !this.appGen.isNullOrUndefined(this.idGara) &&
          !this.isDettaglio
        ) {
          const objConfezionamento: any = {
            idProdotto: prodotto.idProdotto,
            idGara: this.idGara,
          }

          ///LISTA DI TUTTE LE CONFEZIONI X PRODOTTO
          let arrayConfezioni = []
          arrayConfezioni = await firstValueFrom(
            this.confService.getConfezioniXProdottoDisponibili(objConfezionamento)
          )

          for (const confezionamento of arrayConfezioni) {
            confezionamento.dc = moment(confezionamento.dataCreazione).format(
              'DD/MM/YYYY'
            )
            if (confezionamento.abilitatoXGara === true) {
              ///SE LA CONFEZIONE È ABILITATA ALLA GARA ALLORA VIENE PUSHATO NELLE CONFEZIONI DEL PRODOTTO
              ///RICHIAMATO NELL'HTML
              prodotto.confezionamenti.push(confezionamento)
            }
          }
          if (prodotto.confezionamenti.length > 0) {
            this.sceltaConfezionamento(prodotto);
            
            const formArray = this.formConfezionamenti.controls.confezionamenti as FormArray;
          }
        } else if (
          prodotto.idTipoProdotto === TipoProdotto.NutrizioneArtificiale &&
          this.appGen.isNullOrUndefined(this.idGara) &&
          this.isDettaglio
        ) {
          prodotto.confezionamenti = await firstValueFrom(
            this.confService.getConfezioniXProdottoSenzaGara(prodotto.idProdotto)
          )
          for (const confezionamento of prodotto.confezionamenti) {
            confezionamento.dc = moment(confezionamento.dataCreazione).format(
              'DD/MM/YYYY'
            )
          }
          if (prodotto.confezionamenti.length > 0) {
            this.sceltaConfezionamento(prodotto);
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async getListNotePredefinite() {
    await this.service
      .getCallRequest({ action: 'getListConclusioniPredefinite', param: 'note' })
      .then((data) => {
        this.listaNotePredefinite = data
      })
  }

  generateTable() {
    this.prodottiDataSource = new MatTableDataSource<any>()
    //!TODO : filtrare prodotti e mostrare solo non eliminati
    this.prodottiDataSource.data = this.prodotti // _.findWhere(this.prodotti,{};
    this.calculateVal()
    this.getListaConfezionamenti()
  }

  /**
   * Funzione server per rigenerale la lista senza prodotti quando si cambia tipo di "tipo nutrizione" da Parenterale a Enterale
   */
  resetTable() {
    this.prodotti = []
    this.generateTable()
    this.refreshTable()
  }

  updateColor(progress, tot) {
    if (progress >= tot) {
      return 'warn'
    } else if (progress <= tot / 2) {
      return 'primary'
    } else if (progress > tot / 2) {
      return 'accent'
    }
  }

  refreshTable() {
    this.prodottiDataSource._updateChangeSubscription()
  }

  calculateVal() {
    this.kcalTot = 0
    this.proteineTot = 0
    this.azotoTot = 0
    this.apportoIdricoTot = 0

    if (!this.appGen.isNullOrUndefined(this.prodottiDataSource.data)) {
      this.prodottiDataSource.data.forEach((prodotti) => {
        // faccio solo per prodotti non cancellati
        if (!prodotti.recordEliminato) {
          this.kcalTot += Math.round(prodotti.kcal)
          this.azotoTot = Number(
            (((this.azotoTot + prodotti.azoto) * 100) / 100).toFixed(2)
          )

          this.proteineTot = Number(
            (((this.proteineTot + prodotti.proteine) * 100) / 100).toFixed(2)
          )

          this.apportoIdricoTot += this.appGen.isNullOrUndefined(prodotti.acqua)
            ? 0
            : prodotti.acqua
        }
      })
    }
  }

  returntValue(totale, valoreCalcolato) {
    return (totale / valoreCalcolato) * 100
  }
  //!BUG cambia la gestione del prodotto da cancellare
  deleteProdotto(prodotto) {
    prodotto.recordEliminato = true

    // non possiamo scomentare questa parte finche non vienie risolto problema con i prodotti da cancellare
    /* const index = this.prodottiDataSource.data.indexOf(prodotto);
    this.prodottiDataSource.data.splice(index, 1);
*/
    this.prodottiDataSource._updateChangeSubscription()
    //TODO: gestire quando non ci sono i prodotti attivi ( deve disabilitare la tabella nel artificiale )
    this.calculateVal()
  }

  modificaSacca(prodotto) {
    const dialogRef = this.appGen.dialog.open(ModalCreaSaccaComponent, {
      data: prodotto,
      panelClass: 'modal-crea-sacca',
    })

    dialogRef.afterClosed().subscribe((objSacca) => {
      if (this.appGen.isNullOrUndefined(objSacca)) {
        return
      }
      const element = this.prodottiDataSource.data.filter(
        (x) => x.idProdotto === objSacca.prodotto.id
      )[0]

      //cambio in tabella la quantità selezionatas
      const index = this.prodottiDataSource.data.indexOf(element)

      this.prodottiDataSource.data[index].kcal = Math.round(objSacca.prodotto.kcal)
      this.prodottiDataSource.data[index].proteine = objSacca.proprieta.amminoacidi
      this.prodottiDataSource.data[index].azoto = 0
      this.prodottiDataSource.data[index].quantita = objSacca.prodotto.quantita
      this.prodottiDataSource.data[index].quantitaBase = objSacca.prodotto.quantitaBase
      this.prodottiDataSource.data[index].velocitaSomministrazione = ''
      this.prodottiDataSource.data[index].acqua = 0
      this.prodottiDataSource.data[index].idProdotto = objSacca.prodotto.id
      this.prodottiDataSource.data[index].idprodottoxvisita = null
      this.prodottiDataSource.data[index].idUnitaMisura = objSacca.prodotto.idUnitaMisura
      this.prodottiDataSource.data[index].unitaMisura = 'ml'
      this.prodottiDataSource.data[index].codiceProdotto = ''
      this.prodottiDataSource.data[index].prodotto = objSacca.prodotto.prodotto
      this.prodottiDataSource.data[index].idTipoProdotto =
        objSacca.prodotto.idTipoProdotto
      this.prodottiDataSource.data[index].metodoAssunzione = ''
      this.prodottiDataSource.data[index].saccaEditabile = true
    })
  }

  async getInfo(prodotto) {
    const objRequest = {
      action: 'getprodotto',
      param: prodotto.idProdotto,
    }
    const prodottoDB = await this.service.getCallRequest(objRequest)

    if (prodotto.idTipoProdotto == TipoProdotto.SacchePersonalizzate) {
      this.appGen.dialog.open(ModalInfoMiscelaComponent, {
        data: prodottoDB,
        panelClass: 'modal-info-prodotti',
      })
    } else {
      this.appGen.dialog.open(ModalInfoProdottiComponent, {
        data: prodottoDB,
        panelClass: 'modal-info-prodotti',
      })
    }
  }

  selectedNotePredefinita(nota) {
    this.form.get('notePredefinite').reset()

    if (!this.appGen.isNullOrUndefined(nota)) {
      this.note = this.note + ' ' + nota
    }
  }

  selectedMetodoAssunzione(prodotto, value) {
    const index = this.prodottiDataSource.data.indexOf(prodotto)
    this.prodottiDataSource.data[index].idMetodoAssunzione = value
    if (value !== 3) {
      //altro
      this.prodottiDataSource.data[index].metodoAssunzione =
        this.listametodoAssunzione.indexOf(value).metodo
    } else {
      this.prodottiDataSource.data[index].metodoAssunzione = ''
    }
  }

  selectedQuantitaSacca(sacca, value) {
    const index = this.prodottiDataSource.data.indexOf(sacca)

    this.prodottiDataSource.data[index].quantita = sacca.quantitaBase * value

    const obj = {
      Prodotti: this.prodottiDataSource.data,
      Kcal_tot: this.kcal,
    }

    this.calcoloValoriPerQuantita(obj)
  }

  async setMetodoAssunzione(prodotto, modalita) {
    const index = this.prodottiDataSource.data.indexOf(prodotto)
    this.prodottiDataSource.data[index].metodoAssunzione = modalita
  }

  // chando chiamo il valore del input, metto true cosi nel calcoloValoriPerQuantita chiamo server solo quando è stato toccato il valore
  valueWasChanged(prodotto) {
    prodotto.wasChanged = true
  }

  async editQuantita(prodotto, quantita) {
    //cambio in tabella la quantità selezionata

    prodotto.quantita = Number(quantita)
    this.calcoloValoriPerQuantita(prodotto)
    if (prodotto.idConfezionamentoProdotto) {
      this.sceltaConfezionamento(prodotto)
    }
  }

  async calcoloValoriPerQuantita(prodotto) {
    if (prodotto.wasChanged) {
      const res = await firstValueFrom(
        this.service.genericPost({
          action: 'nuoviValoriPerQuantita',
          param: prodotto,
        })
      )

      prodotto.wasChanged = false // imposto a false cosi mi accordo quando venie nuovamente modificato onchange e on blur posso richiamare solo se è modificato
      this.kcalTot = 0
      this.proteineTot = 0
      this.azotoTot = 0
      this.apportoIdricoTot = 0
      // devo passare vecchi valori della velocita, idprodottoxvisita
      const _idProdottoXVisita = prodotto.idprodottoxvisita
      const _velocita = prodotto.velocitaSomministrazione
      Object.assign(prodotto, res)
      prodotto.idprodottoxvisita = _idProdottoXVisita
      prodotto.velocitaSomministrazione = _velocita
      if (!this.appGen.isNullOrUndefined(this.prodottiDataSource.data)) {
        this.prodottiDataSource.data.forEach((element) => {
          // solo per elementi non cancellati
          if (!element.recordEliminato) {
            element.kcal = Math.round(
              this.appGen.isNullOrUndefined(element.kcal) ? 0 : element.kcal
            )
            element.proteine = Number(
              this.appGen.isNullOrUndefined(element.proteine) ? 0 : element.proteine
            )
            element.azoto = Number(
              this.appGen.isNullOrUndefined(element.azoto) ? 0 : element.azoto
            )
            element.acqua = Number(
              this.appGen.isNullOrUndefined(element.acqua) ? 0 : element.acqua
            )

            this.kcalTot += Math.round(element.kcal)
            this.proteineTot = Number(
              (((this.proteineTot + element.proteine) * 100) / 100).toFixed(2)
            )
            this.azotoTot = Number(
              (((this.azotoTot + element.azoto) * 100) / 100).toFixed(2)
            )
            this.apportoIdricoTot += this.appGen.isNullOrUndefined(element.acqua)
              ? 0
              : element.acqua
          }
        })
      }
    }
  }

  /**
   *
   * @param prodotto Prodotto che viene selezionato nel componente precedente;
   * La funzione viene richiamata al selezionamento della confezione o al cambio di quantità del prodotto e al caricamento della tabella;
   * vengono calcolati N confezioni arrotondate, non arrotondati e il prezzo totale
   */
  async sceltaConfezionamento(prodotto: any) {
    try {
      const idConf = prodotto.idConfezionamentoProdotto
      if (idConf) {
        const confezionamentoSelezionato = await firstValueFrom(
          this.confService.getConfezionamentoById(idConf)
        )
        if (confezionamentoSelezionato.disponibile === true) {
          const quantita = confezionamentoSelezionato.quantita
          const prezzo = confezionamentoSelezionato.prezzo

          prodotto.nConfezionamentiDaUtilizzare = prodotto.quantita / quantita
          prodotto.nConfezionamentiDaUtilizzareArrotondato = Math.ceil(
            prodotto.nConfezionamentiDaUtilizzare
          )
          prodotto.nConfezionamentiReali =
            prodotto.quantita / prodotto.quantitaConfezionamento
          prodotto.prezzoTot = prodotto.nConfezionamentiDaUtilizzareArrotondato * prezzo
        }
      }
      const index = this.prodottiDataSource.data.indexOf(prodotto)
      this.prodottiDataSource.data[index].idConfezionamentoProdotto =
        prodotto.idConfezionamentoProdotto
    } catch (error) {
      console.error(error)
    }
  }

  QuantitaProdotto(kcal_base, quantita_base, kcal) {
    let quantita = quantita_base * kcal

    if (kcal_base == 0) {
      return quantita
    } else {
      quantita = quantita / kcal_base
    }

    return quantita
  }

  ProporzioneValori(valore_base, quantita_base, quantita) {
    const valore = (valore_base * quantita) / quantita_base

    return Math.round(valore)
  }

  async editVelocitaSomministrazione(prodotto, val) {
    const index = this.prodottiDataSource.data.indexOf(prodotto)
    this.prodottiDataSource.data[index].velocitaSomministrazione = Number(val)
  }

  async getMetodoAssunzione() {
    await this.service
      .getCallRequest({ action: 'listaMedotiAssunzioneIntegratori' })
      .then((res) => {
        this.listametodoAssunzione = res
      })
  }

  /**
   * Senza prodotti cancellati
   * @param x
   * @returns
   */
  withoutDeleted(x: MatTableDataSource<any>) {
    return _.where(x.data, { recordEliminato: false })
  }
}
