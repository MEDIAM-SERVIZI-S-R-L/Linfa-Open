import { Component, Input, OnInit, Optional } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { HttpSharedService } from 'src/app/_core/services/http-shared.service'
import { AppGeneralService } from 'src/app/_core/services/app-general.service'
import { TipoProdotto } from 'src/app/_core/helpers/enums'
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard'
import { Location } from '@angular/common'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-form-prodotto',
  templateUrl: './form-prodotto.component.html',
  styleUrls: ['./form-prodotto.component.scss'],
})
export class FormProdottoComponent implements OnInit {
  defaultBase64String: string
  formProdotto: FormGroup

  listaTipiProdotto
  listaCategorieAlimentari
  listaTipoAlimentazioneArtificiale
  listaUnitaMisura
  listaProprietaBase

  allSelected: false
  inError = false
  enableCategorie = false
  enableArtificiale = false
  tipoProdotto = TipoProdotto
  idProdotto;
  idUnitaMisura;
  tipologia;

  fileData: File = null
  fileName
  previewUrl: any = null
  fileUploadProgress: string = null
  uploadedFilePath: string = null
 @Optional() @Input() idtipologia

  constructor(
    public authGuard: AuthGuard,
    public appGen: AppGeneralService,
    private backPreviousPage: Location,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    private activateRoute: ActivatedRoute
  ) {
    this.appGen.loadingPanel.show()


  }

  async ngOnInit() {
    this.tipologia = this.idtipologia ? this.idtipologia : null;
    this.idProdotto = this.activateRoute.snapshot.paramMap.get('id');
    await this.creazioneFormPerProdotto();
    this.getDataForSelect();    
    // Se impostato if allora sono nella modifiche del prodotto
    if (this.idProdotto) {
      await this.getDettaglioProdotto()
    }
    this.setCategoria(this.tipologia)

    this.appGen.loadingPanel.hide()

    if (!this.authGuard.canAccess(this.appGen.permesso.ModificaProdotti)) {
      this.formProdotto.disable()
    }
  }


  /**
   * La funzione che crea il nuovo form per i dati del prodotto
   */
  creazioneFormPerProdotto() {   
    this.formProdotto = this.formBuilder.group({
      prodotto: new FormControl('', Validators.required),
      tipoProdotto: new FormControl(this.tipologia, Validators.required),
      categoriaAlimentare: new FormControl(''),
      codiceProdotto: new FormControl({value: '', disabled : this.idProdotto}),
      altroCodiceProdotto: new FormControl(''),
      quantita: new FormControl('', Validators.required),
      unitaMisura: new FormControl('', Validators.required),
      patologiaPrincipale: new FormControl(''),
      kcal: new FormControl('', Validators.required),
      proteine: new FormControl('', Validators.required),
      azoto: new FormControl(''),
      lipidi: new FormControl(''),
      glucidi: new FormControl(''),
      acqua: new FormControl(''),
      acidoOleico: new FormControl(''),
      monoinsaturiTotali: new FormControl(''),
      acidoLinoleico: new FormControl(''),
      altriPolinsaturi: new FormControl(''),
      polinsaturiTotali: new FormControl(''),
      colesterolo: new FormControl(''),
      amido: new FormControl(''),
      fibraAlimentare: new FormControl(''),
      alcool: new FormControl(''),
      fe: new FormControl(''),
      ca: new FormControl(''),
      na: new FormControl(''),
      k: new FormControl(''),
      p: new FormControl(''),
      zn: new FormControl(''),
      b1: new FormControl(''),
      b2: new FormControl(''),
      niacina: new FormControl(''),
      vitC: new FormControl(''),
      vitB6: new FormControl(''),
      acidoFolico: new FormControl(''),
      retinoloEquivalenti: new FormControl(''),
      vitA: new FormControl(''),
      betaCarotene: new FormControl(''),
      vitE: new FormControl(''),
      vitD: new FormControl(''),
      artificiale: new FormControl(''),
    })
  }
  /**
   * La funzione prende i dati necerasi per selectbox
   */
  async getDataForSelect() {
    try {
      // Tipi Alimentazione Artificiale
      this.listaTipoAlimentazioneArtificiale = await this.service.getCallRequest({
        action: 'getTipoAlimentazioneArtificiale',
      })

      // Tipi Prodotti
      this.listaTipiProdotto = await this.service.postCallRequest({
        action: 'tipiprodotti',
        param: {},
      })
      // Verifico se utente logato ha la possibilita di vedere le Sacche
      !this.authGuard.canAccess(this.appGen.permesso.GestioneSacche)? (this.listaTipiProdotto = this.listaTipiProdotto.filter((user) => user.id !== 5)): null

      // prendo tipo delle misure
      this.listaUnitaMisura = await this.service.getCallRequest({ action: 'unitamisura' })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   *
   * @param id - Id della Categoria del prodotto
   */
  async setCategoria(idCatProdotto) {
    try {
      if (idCatProdotto == this.tipoProdotto.SacchePersonalizzate) {
        await this.getListProprietaBase()
      }

      switch (idCatProdotto) {
        case this.tipoProdotto.Solidi:
        case this.tipoProdotto.Liquidi:
          this.enableCategorie = true
          this.enableArtificiale = false
          this.formProdotto.get('artificiale').disable()
          this.formProdotto.get('categoriaAlimentare').enable()

          this.getCategorieAlimentari(idCatProdotto)

          break
        case this.tipoProdotto.NutrizioneArtificiale:
          this.enableArtificiale = true
          this.enableCategorie = false
          this.formProdotto.get('artificiale').enable()
          this.formProdotto.get('categoriaAlimentare').disable()

          break
        case this.tipoProdotto.SacchePersonalizzate:
          this.enableArtificiale = false
          this.enableCategorie = false
          this.formProdotto.get('artificiale').disable()
          this.formProdotto.get('categoriaAlimentare').disable()

          break

        default:
          this.enableArtificiale = false
          this.enableCategorie = false
          this.formProdotto.get('artificiale').disable()
          this.formProdotto.get('categoriaAlimentare').disable()

          break
      }

      this.formProdotto.updateValueAndValidity()
      this.tipoProdotto.SacchePersonalizzate ? this.getListProprietaBase() : null
    } catch (error) {
      console.error(error)
    }
  }


  /**
   * Chiamata per prendere i dati del prodotto
   */
  async getDettaglioProdotto() {
    try {
      const objRequest = {
        action: 'getprodotto',
        param: this.idProdotto,
      }
      const _prodotto = await this.service.getCallRequest(objRequest);
      

      //!Important Devo prima capire se un prodotto che ha il convenzionamento se no non devo entare al interno del prodotto
      const _prodottoSelezionato = ('confezionamenti' in _prodotto )? _prodotto.prodotto: _prodotto;
      this.idUnitaMisura = _prodottoSelezionato.idUnitaMisura;


      // Devo passare _prodotto.prodotto xk cambiato oggetto adesso ha anche la confezione
      this.setProductData(_prodottoSelezionato)
      this.getImage()

      this.tipologia= _prodottoSelezionato?.idTipoProdotto

    } catch (error) {
      console.error(error)
    }
  }
  /**
   * inserisco dati del prodotto nel form
   * @param _product  -id prodotto
   */
  setProductData(_product) {
    try {
      this.formProdotto.get('prodotto').setValue(_product.prodotto),
        this.formProdotto.get('tipoProdotto').setValue(_product.idTipoProdotto),
        this.formProdotto
          .get('categoriaAlimentare')
          .setValue(_product.idCategoriaAlimentare),
        this.formProdotto.get('codiceProdotto').setValue(_product.codiceProdotto),
        this.formProdotto
          .get('altroCodiceProdotto')
          .setValue(_product.altroCodiceProdotto),
        this.formProdotto.get('quantita').setValue(_product.quantita),
        this.formProdotto.get('unitaMisura').setValue(_product.idUnitaMisura),
        this.formProdotto.get('kcal').setValue(_product.kcal),
        this.formProdotto.get('proteine').setValue(_product.proteineTotali),
        this.formProdotto.get('azoto').setValue(_product.azoto),
        this.formProdotto.get('lipidi').setValue(_product.lipidiTotali),
        this.formProdotto.get('glucidi').setValue(_product.glucidiDispon),
        this.formProdotto.get('acqua').setValue(_product.acqua),
        this.formProdotto.get('acidoOleico').setValue(_product.acidoOleico),
        this.formProdotto.get('monoinsaturiTotali').setValue(_product.monoinsaturiTotali),
        this.formProdotto.get('acidoLinoleico').setValue(_product.acidoLinoleico),
        this.formProdotto.get('altriPolinsaturi').setValue(_product.altriPolinsaturi),
        this.formProdotto.get('polinsaturiTotali').setValue(_product.polinsaturiTotali),
        this.formProdotto.get('colesterolo').setValue(_product.colesterolo),
        this.formProdotto.get('amido').setValue(_product.amido),
        this.formProdotto.get('fibraAlimentare').setValue(_product.fibraAlimentare),
        this.formProdotto.get('alcool').setValue(_product.alcool),
        this.formProdotto.get('fe').setValue(_product.fe),
        this.formProdotto.get('ca').setValue(_product.ca),
        this.formProdotto.get('na').setValue(_product.na),
        this.formProdotto.get('k').setValue(_product.k),
        this.formProdotto.get('p').setValue(_product.p),
        this.formProdotto.get('zn').setValue(_product.zn),
        this.formProdotto.get('b1').setValue(_product.b1),
        this.formProdotto.get('b2').setValue(_product.b2),
        this.formProdotto.get('niacina').setValue(_product.niacina),
        this.formProdotto.get('vitC').setValue(_product.vitC),
        this.formProdotto.get('vitB6').setValue(_product.vitB6),
        this.formProdotto.get('acidoFolico').setValue(_product.acidoFolico),
        this.formProdotto
          .get('retinoloEquivalenti')
          .setValue(_product.retinoloEquivalenti),
        this.formProdotto.get('vitA').setValue(_product.vitA),
        this.formProdotto.get('betaCarotene').setValue(_product.betaCarotene),
        this.formProdotto.get('vitE').setValue(_product.vitE),
        this.formProdotto.get('vitD').setValue(_product.vitD)

      this.formProdotto.get('artificiale').setValue(_product.idArtificiale)
    } catch (error) {
      console.error(error)
    }
  }

  //** prendo imaggine del prodotto  */
  async getImage() {
    try {
      this.defaultBase64String = await firstValueFrom(
        this.service.getImage(this.idProdotto)
      )
    } catch (error) {
      console.error(error)
    }
  }
/**
 *
 * @param tipologia Prendo categorie alimentari per Solidi e Liquidi
 */
  async getCategorieAlimentari(tipologia) {
    try {
      const objRequest = {
        action: 'categoriealimentari',
        param: tipologia,
      }
      this.listaCategorieAlimentari = await this.service.getCallRequest(objRequest)
    } catch (error) {
      console.error(error)
    }
  }


  /**
   * Funzione che nasconde o visualizza la singola proprietà del prodotto
   * @param id
   * @returns
   */
  show(id) {
    if (this.tipologia != this.tipoProdotto.SacchePersonalizzate) {
      return true
    }
    const elemento = this.appGen.getElementByFilter(id, this.listaProprietaBase)[0]
    if (this.appGen.isNullOrUndefined(elemento)) {
      return true
    }

    return elemento.abilitato
  }

  /** Imposto la label con nome della proprietà  */

  showLabel(id) {
    try {
      if (this.tipologia != this.tipoProdotto.SacchePersonalizzate) {
        return
      }
      const elemento = this.appGen.getElementByFilter(id, this.listaProprietaBase)[0]
      if (this.appGen.isNullOrUndefined(elemento)) {
        return
      }

      if (elemento.abilitato) {
        return (
          elemento.kcal +
          ' kcal / ' +
          elemento.quantita +
          ' ' +
          (this.appGen.isNullOrUndefined(elemento.unitaMisura) ? '-' : elemento.unitaMisura)
        )
      }
    } catch (error) {
      console.error(error)
    }

  }

  async getListProprietaBase() {
    try {
      const objRequest = {
        action: 'getKcalBaseSacche',
        loadingPanel: false,
        param: {},
      }

      this.listaProprietaBase = await this.service.postCallRequest(objRequest)
    } catch (error) {
      console.error(error)
    }
  }

  async onSubmit() {
    try {
      if (this.formProdotto.invalid) {
        this.appGen.validateAllFormFields(this.formProdotto)
        this.inError = true
        return
      }
      this.inError = false
  
      const prodottoObj = {
        Prodotto: this.formProdotto.get('prodotto').value,
        IdTipoProdotto: this.formProdotto.get('tipoProdotto').value,
        IdCategoriaAlimentare: this.formProdotto.get('categoriaAlimentare').value,
        CodiceProdotto: this.formProdotto.get('codiceProdotto').value,
        altroCodiceProdotto: this.formProdotto.get('altroCodiceProdotto').value,
        Quantita: this.formProdotto.get('quantita').value,
        IdUnitaMisura: this.formProdotto.get('unitaMisura').value,
        Kcal: this.formProdotto.get('kcal').value,
        ProteineTotali: this.formProdotto.get('proteine').value,
        Azoto: this.formProdotto.get('azoto').value,
        LipidiTotali: this.formProdotto.get('lipidi').value,
        GlucidiDispon: this.formProdotto.get('glucidi').value,
        Acqua: this.formProdotto.get('acqua').value,
        AcidoOleico: this.formProdotto.get('acidoOleico').value,
        MonoinsaturiTotali: this.formProdotto.get('monoinsaturiTotali').value,
        AcidoLinoleico: this.formProdotto.get('acidoLinoleico').value,
        AltriPolinsaturi: this.formProdotto.get('altriPolinsaturi').value,
        PolinsaturiTotali: this.formProdotto.get('polinsaturiTotali').value,
        Colesterolo: this.formProdotto.get('colesterolo').value,
        Amido: this.formProdotto.get('amido').value,
        FibraAlimentare: this.formProdotto.get('fibraAlimentare').value,
        Alcool: this.formProdotto.get('alcool').value,
        Fe: this.formProdotto.get('fe').value,
        Ca: this.formProdotto.get('ca').value,
        Na: this.formProdotto.get('na').value,
        K: this.formProdotto.get('k').value,
        P: this.formProdotto.get('p').value,
        Zn: this.formProdotto.get('zn').value,
        B1: this.formProdotto.get('b1').value,
        B2: this.formProdotto.get('b2').value,
        Niacina: this.formProdotto.get('niacina').value,
        VitC: this.formProdotto.get('vitC').value,
        VitB6: this.formProdotto.get('vitB6').value,
        AcidoFolico: this.formProdotto.get('acidoFolico').value,
        RetinoloEquivalenti: this.formProdotto.get('retinoloEquivalenti').value,
        VitA: this.formProdotto.get('vitA').value,
        BetaCarotene: this.formProdotto.get('betaCarotene').value,
        VitE: this.formProdotto.get('vitE').value,
        VitD: this.formProdotto.get('vitD').value,
        IdArtificiale: this.formProdotto.get('artificiale').value,
        Id: this.appGen.isNullOrUndefined(this.idProdotto) ? 0 : this.idProdotto,
      }
  
      const fileObj = {
        fileBase64: this.appGen.isNullOrUndefined(this.previewUrl)
          ? ''
          : this.previewUrl.split(',')[1],
        name: this.fileName,
      }
  
      const params = {
        prodotto: prodottoObj,
        file: fileObj,
        // patologie: this.listaPatologieAssociate,
        all: this.allSelected,
      }
      const objRequest = {
        action: 'insertUpdateProdotto',
        param: params,
      }
      await this.service.postCallRequest(objRequest).then(async () => {
        this.backPreviousPage.back()
      })
    } catch (error) {
      console.error(error);
    }

  }

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0]
    this.fileName = this.fileData.name
    this.preview()
  }

  preview() {
    // Show preview
    const mimeType = this.fileData.type
    if (mimeType.match(/image\/*/) == null) {
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(this.fileData)
    reader.onload = () => {
      this.previewUrl = reader.result
    }
  }
}
