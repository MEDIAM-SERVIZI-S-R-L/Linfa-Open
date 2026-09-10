import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { TipiAmminoacidi, TipoAggiunta, TipoProdotto } from 'src/app/_core/helpers/enums';
import { TabellaAggiunteComponent } from 'src/app/_module/prodotti/component/miscele/tabella-aggiunte/tabella-aggiunte.component';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { ReportService } from 'src/app/_core/services/report.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-demomiscela',
  templateUrl: './demomiscela.component.html',
  styleUrls: ['./demomiscela.component.scss']
})
export class DemomiscelaComponent implements OnInit {


  defaultBase64String: string;
  form: FormGroup;

  listaVitamine= [
    {
        "id": 11,
        "aggiunta": "Vitalipid",
        "tipo": 1,
        "datAggiunteSacca": []
    },
    {
        "id": 12,
        "aggiunta": "Soluvit",
        "tipo": 1,
        "datAggiunteSacca": []
    },
    {
        "id": 13,
        "aggiunta": "Cernevit",
        "tipo": 1,
        "datAggiunteSacca": []
    }
];
  listaOligoelementi= [
    {
        "id": 14,
        "aggiunta": "Addamel",
        "tipo": 2,
        "datAggiunteSacca": []
    },
    {
        "id": 15,
        "aggiunta": "Peditrace",
        "tipo": 2,
        "datAggiunteSacca": []
    }
]

  editProdotti = true;
  inError = false;
  enableCategorie = false;
  enableArtificiale = false;
  tipoProdotto = TipoProdotto;
  idProdotto: string;
  idProprieta: number;
  prodotto: any;
  fileData: File = null;
  fileName: string;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  @Input() fromModal: any
  @Input() saccaEsistente: { idProdotto: any; }
  @Output() modalSaccaEmit = new EventEmitter();
  saccheEsistenti = false
  listaSaccheEsistenti: string | any[];

  tipoAggiunta = TipoAggiunta
  tipiAmminoacidi = TipiAmminoacidi

  @ViewChild('oligoelementoSelezionato') oligoelementoSelezionato: { value: any; };
  @ViewChild('vitaminaSelezionata') vitaminaSelezionata: { value: any; };
  @ViewChild(TabellaAggiunteComponent, { static: false }) private tabellaAggiunteComponent: TabellaAggiunteComponent;
  aggiunteSelezionate: any = [];
  listaKcalBaseProprieta=  [
    {
        "quantita": 1.0,
        "proprieta": "Glucosio",
        "unitaMisura": "g",
        "idUnitaMisura": 1,
        "kcal": 4.0,
        "id": 4,
        "abilitato": true
    },
    {
        "quantita": 1.0,
        "proprieta": "Lipidi",
        "unitaMisura": "g",
        "idUnitaMisura": 1,
        "kcal": 9.0,
        "id": 1,
        "abilitato": true
    },
    {
        "quantita": 1.0,
        "proprieta": "Amminoacidi",
        "unitaMisura": "g",
        "idUnitaMisura": 1,
        "kcal": 4.0,
        "id": 2,
        "abilitato": true
    }
  ]


  constructor(

    public appGen: AppGeneralService,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,

  ) {

  }

  async ngOnInit(): Promise<void> {

    this.idProdotto = this.activateRoute.snapshot.paramMap.get('id');

    if (!this.appGen.isNullOrUndefined(this.saccaEsistente)) {
      this.idProdotto = this.saccaEsistente.idProdotto;
    }

    this.form = this.formBuilder.group({
      prodotto: new FormControl('', Validators.required),
      tipoProdotto: new FormControl(TipoProdotto.SacchePersonalizzate, Validators.required),
      quantita: new FormControl('', Validators.required),
      unitaMisura: new FormControl(5, Validators.required), //ml
      kcal: new FormControl({ value: 0, disabled: true }, Validators.required),
      glucosio: new FormControl('', Validators.required),
      lipidi: new FormControl('', Validators.required),
      acqua: new FormControl(''),
      amminoacidi: new FormControl('', Validators.required),
      tipoAmminoacidi: new FormControl('', Validators.required),
      acGlutamina: new FormControl(''),
      acRamificati: new FormControl(''),
      sodio: new FormControl(''),
      cloro: new FormControl(''),
      potassio: new FormControl(''),
      calcio: new FormControl(''),
      magnesio: new FormControl(''),
      fosfato: new FormControl(''),
      zinco: new FormControl(''),
      selenio: new FormControl(''),
      note: new FormControl('')
    });


  }

  showSaccheEsistenti(): void {

    this.saccheEsistenti = !this.saccheEsistenti
    if (this.saccheEsistenti) {

      if (this.appGen.isNullOrUndefined(this.listaSaccheEsistenti) || this.listaSaccheEsistenti.length <= 0) {
        this.getListaProdotti()
      }
    }
  }

  async setValoriSacca(val: { idProdotto: any; }): Promise<void> {

    const objRequest = {
      action: 'getprodotto',
      param: val.idProdotto
    }
    await this.service.getCallRequest(objRequest).then(data => {
      this.setValueForm(data)
      setTimeout(() => {

        this.form.get('prodotto').reset()
      }, 0);

    });

  }

  async getListaProdotti(): Promise<void> {

    const params = {
      IdTipoProdotto: TipoProdotto.SacchePersonalizzate,
    };

    await this.service.postCallRequest({ action: 'listaprodotti', param: params }).then(data => {
      this.listaSaccheEsistenti = data;
    });
  }


  addProdotto(element: { id: any; aggiunta: any; }, tipo: any): void {
    if (this.appGen.isNullOrUndefined(element)) {
      return;
    }

    let obj: { idAggiuntaSacca: any; aggiunta: any; quantita: string; tipo: number; }

    switch (tipo) {

      case TipoAggiunta.Vitamine:
        obj = {
          idAggiuntaSacca: element.id,
          aggiunta: element.aggiunta,
          quantita: '',
          tipo: 1,
        }
        break;
      case TipoAggiunta.Oligoelementi:
        obj = {
          idAggiuntaSacca: element.id,
          aggiunta: element.aggiunta,
          quantita: '',
          tipo: 2,
        }
        break;

      default:
        return;
    }

    this.aggiunteSelezionate.push(obj);
    this.tabellaAggiunteComponent.generateTable();
    this.vitaminaSelezionata.value = null
    this.oligoelementoSelezionato.value = null


  }



  async getDettaglioProdotto(): Promise<void> {
    const objRequest = {
      action: 'getprodotto',
      param: this.idProdotto
    }
    await this.service.getCallRequest(objRequest).then((data): void => {

      this.prodotto = data
      this.idProprieta = data.proprieta.id;

      this.setValueForm(data)
    });
  }

  setValueForm(data: { prodotto: { prodotto: any; idTipoProdotto: any; quantita: any; idUnitaMisura: any; kcal: any; acqua: any; }; proprieta: { glucosio: any; lipidi: any; amminoacidi: any; tipoAmminoacidi: any; acGlutamina: any; acRamificati: any; sodio: any; cloro: any; potassio: any; calcio: any; magnesio: any; fosfato: any; zinco: any; selenio: any; note: any; }; aggiunte: any; }) {
    this.form.get('prodotto').setValue(data.prodotto.prodotto)
    this.form.get('tipoProdotto').setValue(data.prodotto.idTipoProdotto)
    this.form.get('quantita').setValue(data.prodotto.quantita)
    this.form.get('unitaMisura').setValue(data.prodotto.idUnitaMisura)
    this.form.get('kcal').setValue(data.prodotto.kcal)
    this.form.get('acqua').setValue(data.prodotto.acqua)

    //proprieta
    this.form.get('glucosio').setValue(data.proprieta.glucosio)
    this.form.get('lipidi').setValue(data.proprieta.lipidi)
    this.form.get('amminoacidi').setValue(data.proprieta.amminoacidi)
    this.form.get('tipoAmminoacidi').setValue(data.proprieta.tipoAmminoacidi)
    this.form.get('acGlutamina').setValue(data.proprieta.acGlutamina)
    this.form.get('acRamificati').setValue(data.proprieta.acRamificati)
    this.form.get('sodio').setValue(data.proprieta.sodio)
    this.form.get('cloro').setValue(data.proprieta.cloro)
    this.form.get('potassio').setValue(data.proprieta.potassio)
    this.form.get('calcio').setValue(data.proprieta.calcio)
    this.form.get('magnesio').setValue(data.proprieta.magnesio)
    this.form.get('fosfato').setValue(data.proprieta.fosfato)
    this.form.get('zinco').setValue(data.proprieta.zinco)
    this.form.get('selenio').setValue(data.proprieta.selenio)
    this.form.get('note').setValue(data.proprieta.note)

    this.aggiunteSelezionate = data.aggiunte;

    this.tabellaAggiunteComponent.aggiunte = data.aggiunte;
    this.tabellaAggiunteComponent.generateTable();
    this.tabellaAggiunteComponent.refreshTable();

  }



  calcolaKcal(): void {

    let tot = 0;
    if (!this.appGen.isNullOrUndefined(this.form.get('glucosio').value)) {
      const proprieta = this.appGen.getElementByFilter(4, this.listaKcalBaseProprieta)[0]
      tot += parseInt(this.form.get('glucosio').value) * proprieta.kcal
    }
    if (!this.appGen.isNullOrUndefined(this.form.get('lipidi').value)) {
      const proprieta = this.appGen.getElementByFilter(1, this.listaKcalBaseProprieta)[0]
      tot += parseInt(this.form.get('lipidi').value) * proprieta.kcal
    }
    if (!this.appGen.isNullOrUndefined(this.form.get('amminoacidi').value)) {
      const proprieta = this.appGen.getElementByFilter(2, this.listaKcalBaseProprieta)[0]

      tot += parseInt(this.form.get('amminoacidi').value) * proprieta.kcal
    }

    this.form.get('kcal').setValue(tot)
  }

  async onSubmit(): Promise<void> {

    if (this.form.invalid) {
      this.appGen.validateAllFormFields(this.form);
      this.inError = true;
      return;
    }
    this.inError = false;


    const json = {
      prodotto: {
        idTipoProdotto: this.form.get('tipoProdotto').value,
        prodotto: this.form.get('prodotto').value,
        quantita: this.form.get('quantita').value,
        idUnitaMisura: this.form.get('unitaMisura').value,
        kcal: this.form.get('kcal').value,
        acqua: this.form.get('acqua').value,
        Id: this.appGen.isNullOrUndefined(this.idProdotto) ? 0 : this.idProdotto
      },
      proprieta: {
        glucosio: this.form.get('glucosio').value,
        lipidi: this.form.get('lipidi').value,
        amminoacidi: this.form.get('amminoacidi').value,
        tipoAmminoacidi: this.form.get('tipoAmminoacidi').value,
        acGlutamina: this.form.get('acGlutamina').value,
        acRamificati: this.form.get('acRamificati').value,
        sodio: this.form.get('sodio').value,
        cloro: this.form.get('cloro').value,
        potassio: this.form.get('potassio').value,
        calcio: this.form.get('calcio').value,
        magnesio: this.form.get('magnesio').value,
        fosfato: this.form.get('fosfato').value,
        zinco: this.form.get('zinco').value,
        selenio: this.form.get('selenio').value,
        note: this.form.get('note').value,
        idProdotto: this.appGen.isNullOrUndefined(this.idProdotto) ? 0 : this.idProdotto,
        Id: this.appGen.isNullOrUndefined(this.idProprieta) ? 0 : this.idProprieta

      },
      //aggiunte: this.tabellaAggiunteComponent.dataSource.data,
    }
    this.appGen.notificate.ok("L' AFMS personalizzato è stato creato correttamente")
    this.form.reset();
    const objRequest = {
      action: 'insertUpdateSacca',
      param: json
    }


  }

  fileProgress(fileInput: any): void {
    this.fileData = <File>fileInput.target.files[0];
    this.fileName = this.fileData.name;
    this.preview();
  }

  preview(): void {

    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = () => {
      this.previewUrl = reader.result;
    }
  }

  stampa() {
    // this.report.createPianoNutrizionale(res),
  }

  async anteprimaSacche(): Promise<void> {

    const json = {
      prodotto: {
        idTipoProdotto: this.form.get('tipoProdotto').value,
        prodotto: this.form.get('prodotto').value,
        quantita: this.form.get('quantita').value,
        idUnitaMisura: this.form.get('unitaMisura').value,
        kcal: this.form.get('kcal').value,
        acqua: this.form.get('acqua').value,
        Id: this.appGen.isNullOrUndefined(this.idProdotto) ? 0 : this.idProdotto
      },
      proprieta: {
        glucosio: this.form.get('glucosio').value,
        lipidi: this.form.get('lipidi').value,
        amminoacidi: this.form.get('amminoacidi').value,
        tipoAmminoacidi: this.form.get('tipoAmminoacidi').value,
        acGlutamina: this.form.get('acGlutamina').value,
        acRamificati: this.form.get('acRamificati').value,
        sodio: this.form.get('sodio').value,
        cloro: this.form.get('cloro').value,
        potassio: this.form.get('potassio').value,
        calcio: this.form.get('calcio').value,
        magnesio: this.form.get('magnesio').value,
        fosfato: this.form.get('fosfato').value,
        zinco: this.form.get('zinco').value,
        selenio: this.form.get('selenio').value,
        note: this.form.get('note').value,
        idProdotto: this.appGen.isNullOrUndefined(this.idProdotto) ? 0 : this.idProdotto,
        Id: this.appGen.isNullOrUndefined(this.idProprieta) ? 0 : this.idProprieta

      },
      aggiunte: []
    }





  }



}
