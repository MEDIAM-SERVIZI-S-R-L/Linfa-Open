/* eslint-disable no-constant-condition */
/* eslint-disable no-debugger */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core'
import { FormBuilder, FormControl, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { firstValueFrom, ReplaySubject, Subject, takeUntil } from 'rxjs'
import { SnackBarService } from 'src/app/_core/services/loader.service'
import { ConfezionamentoToDTO, GestioneConfezionamentiToDTO } from 'src/app/_dtos/out'
import {
  Gara,
  IConfezionamento,
  IDettaglioConfezionamenti,
  IGara,
  IGareConfezionamenti,
  IGestioneGareConfezionamenti,
  unitaMisura,
} from 'src/app/_models/confezionamenti'
import { ConfezionamentiService } from 'src/app/_repositories/confezionamenti.service'
import Swal from 'sweetalert2'
import _ from 'underscore'

@Component({
  selector: 'app-modal-confezionamento',
  templateUrl: './modal-confezionamento.component.html',
  styleUrls: ['./modal-confezionamento.component.scss'],
})
export class ModalConfezionamentoComponent implements OnInit, OnDestroy {
  protected _onDestroy = new Subject<void>()

  formConfezionamento = this.fb.group({
    disponibile: false,
    prezzo: [0, Validators.required],
    quantita: [0, Validators.required],
    unitaMisura: ['', Validators.required],
    gare: [],
  })

  filtroGara = new FormControl('')

  arrayUnitaMisura: unitaMisura[] = []
  uMisura?: unitaMisura

  confezionamento!: ConfezionamentoToDTO

  listaGare: IGara[]
  listaGareFiltrata: ReplaySubject<IGara[]> = new ReplaySubject<IGara[]>()

  elementoEditabile = true

  title: string = 'Nuovo confezionamento'

  ///BOOLEANO DI RIFERIMENTO SOLO PER IL PREZZO
  editabile: boolean

  constructor(
    private confService: ConfezionamentiService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IConfezionamento,
    public dialogRef: MatDialogRef<ModalConfezionamentoComponent>,
    private notificate: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.getUMisura()
    this.getDatasFromTable()
    this.getListaGare()
    this.filtraGara()
  }

  ngOnDestroy() {
    this._onDestroy.next()
    this._onDestroy.complete()
  }

  async getUMisura() {
    try {
      this.arrayUnitaMisura = await firstValueFrom(this.confService.getUnitaMisura())
    } catch (error) {
      console.error(error);
    }
  }

  ///RIEMPIE I CAMPI IN CASO DI EDIT
  getDatasFromTable() {
    if (this.data) {
      this.formConfezionamento.controls.disponibile.setValue(true)
      this.formConfezionamento.controls.prezzo.setValue(this.data.prezzo)
      this.formConfezionamento.controls.quantita.setValue(this.data.quantita as number)
      this.formConfezionamento.controls.unitaMisura.setValue(
        this.data.idUnitaMisura as unknown as string
      )
      this.formConfezionamento.controls.gare.setValue(this.data.listaGare)
      this.editabile = true
    }
    if (this.data.id) {
      this.formConfezionamento.controls.quantita.disable()
      this.formConfezionamento.controls.unitaMisura.disable()
      this.formConfezionamento.controls.gare.setValue(this.data.listaGare)
      this.formConfezionamento.controls.disponibile.setValue(this.data.disponibile)
      this.formConfezionamento.controls.prezzo.disable()
      this.elementoEditabile = false
      this.editabile = false
      this.title = 'Modifica confezionamento'
    }
  }

  changeEditStatus() {
    if (this.editabile === true) {
      //Cambio stato in editabili e disabilito il cambio prezzo
      this.editabile = false
      this.formConfezionamento.controls.prezzo.disable()
    } else if (this.editabile === false) {
      this.formConfezionamento.controls.prezzo.enable()
      this.editabile = true
    }
  }

  async getListaGare() {
    try {
      this.listaGare = await firstValueFrom(this.confService.getListaGare())
      this.listaGareFiltrata.next(this.listaGare.slice())
    } catch (error) {
      console.error(error);
    }

  }


  ///Funzione pre salvataggio che fa un recap del confezionamento
  ///una volta confermato verifica se il confezionamento venga utilizzato da qualche parte 
  ///se nuovo lo salva
  ///se è coinvolto in 1 o più piani allora fa una copia dell'oggetto da editare
  ///se non è coinvolto in nessun piano modifica il confezionamento originale
  preSaveConfezionameto() {
    if (this.formConfezionamento.untouched) {
      this.dialog.closeAll()
    } else {
      const uMisuraUtlizzata = _.findWhere(this.arrayUnitaMisura, {
        id: this.formConfezionamento.controls.unitaMisura.value as unknown as number,
      })

      Swal.fire({
        title:
          'Stai aggiungendo un nuovo confezionamento al prodotto' +
          '\n' +
          'Prezzo: ' +
          '€ ' +
          this.formConfezionamento.controls.prezzo.value +
          '\n' +
          'Quantità: ' +
          this.formConfezionamento.controls.quantita.value +
          '\n' +
          'Unità di misura: ' +
          uMisuraUtlizzata?.unitaMisura +
          '\n' +
          'Disponibile? ' +
          (this.formConfezionamento.controls.disponibile.value ? 'Sì' : 'No'),
        text: 'Se il confezionamento è scritto correttamente procedi al salvataggio',
        icon: 'warning',
        iconColor: '#00afa6',
        showCancelButton: true,
        confirmButtonColor: '#00afa6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sì, aggiungilo!',
        cancelButtonText: 'Annulla',
      }).then((result) => {
        if (result.isConfirmed) {
          if (
            this.data.prezzo !== this.formConfezionamento.controls.prezzo.value &&
            this.data.nPianiCoinvolti > 0
          ) {
            this.disabilitaConfezionamento().then((res)=> {
              this.saveCopiaConfezionamento();
            })
          } else {
            this.saveConfezionamento();
          }
        }
      })
    }
  }


  async saveCopiaConfezionamento() {
    Swal.fire({
      title: 'Il confezionamento è presente in ' + this.data.nPianiCoinvolti + ' piani',
      text: 'Si vuole creare un nuovo confezionamento?',
      icon: 'warning',
      iconColor: '#00afa6',
      showCancelButton: true,
      confirmButtonColor: '#00afa6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sì, aggiungilo!',
      cancelButtonText: 'Annulla',
    }).then((result) => {
      if (result.isConfirmed) {
        this.data.id = null;
        this.saveConfezionamento();
      }
    })
  }

///Disabilita il confezionamento una volta che ne viene fatta una copia con prezzo differente
  async disabilitaConfezionamento(){
    try {
      const item: IConfezionamento = {
        id: this.data.id ? this.data.id : null,
        idProdotto: this.data.idProdotto,
        disponibile: false,
        idUnitaMisura: this.formConfezionamento.controls.unitaMisura
          .value as unknown as number,
        prezzo: this.data.prezzo,
        quantita: this.data.quantita,
      }

      this.confezionamento = new ConfezionamentoToDTO(item);
      const idConfezionamento = await firstValueFrom(
        this.confService.addConfezionamento(this.confezionamento)
      );
    } catch (error) {
      console.error(error);
    }

  }

  async saveConfezionamento() {
   
    const item: IConfezionamento = {
      id: this.data.id ? this.data.id : null,
      idProdotto: this.data.idProdotto,
      disponibile: this.formConfezionamento.controls.disponibile.value as boolean,
      idUnitaMisura: this.formConfezionamento.controls.unitaMisura
        .value as unknown as number,
      prezzo: +parseFloat(this.formConfezionamento.controls.prezzo.value).toFixed(2),
      quantita: parseFloat(this.formConfezionamento.controls.quantita.value) ,
    }
    this.confezionamento = new ConfezionamentoToDTO(item)
    const idConfezionamento = await firstValueFrom(
      this.confService.addConfezionamento(this.confezionamento)
    )

    this.associaGaraXConfezionamento(idConfezionamento)

    this.dialogRef.close(true)

    this.notificate.ok('Confezionamento salvato correttamente')
  }

  async associaGaraXConfezionamento(idConfezionamento: number) {
    try {
      let arrayGare: IGareConfezionamenti[] = []
      let garaSelezionata: IGareConfezionamenti
      let garaNonSelezionata: IGareConfezionamenti

      let listaIdGare = []

      for (const gara of this.listaGare) {
        listaIdGare.push(gara.idGara)
      }

      const gareSelezionate = this.formConfezionamento.controls.gare.value

      const gareNonSelezionate = _.difference(listaIdGare, gareSelezionate)

      if (gareSelezionate.length > 0 || gareNonSelezionate.length > 0) {
        gareSelezionate.forEach((element) => {
          garaSelezionata = {
            idGara: element,
            recordEliminato: false,
          }
          arrayGare.push(garaSelezionata)
        })

        gareNonSelezionate.forEach((element) => {
          garaNonSelezionata = {
            idGara: element,
            recordEliminato: true,
          }
          arrayGare.push(garaNonSelezionata)
        })

        const gareXConfezionamento: IGestioneGareConfezionamenti = {
          idConfezionamento: idConfezionamento,
          gareConfezionamenti: arrayGare,
        }

        const gareDaPassare = new GestioneConfezionamentiToDTO(gareXConfezionamento)
        await firstValueFrom(this.confService.gestisciGareXConfezionamento(gareDaPassare))
      }
    } catch (error) {
      this.notificate.error('È stato riscontrato un errore, riprovare')
    }
  }

  protected filtraGara() {
    this.filtroGara.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filtraListaGare()
    })
  }

  filtraListaGare() {
    if (!this.listaGare) {
      return
    }
    let search = this.filtroGara.value
    if (!search) {
      this.listaGareFiltrata.next(this.listaGare.slice())
      return
    } else {
      search = search.toLowerCase()
    }

    this.listaGareFiltrata.next(
      this.listaGare.filter((element) => {
        if (element.gara.toLowerCase().indexOf(search as string) > -1) {
          return element
        } else {
          return null
        }
      })
    )
  }

  /// 'X' PER CHIUDERE LA DIALOG
  closeDialog() {
    this.dialog.closeAll()
  }
}
