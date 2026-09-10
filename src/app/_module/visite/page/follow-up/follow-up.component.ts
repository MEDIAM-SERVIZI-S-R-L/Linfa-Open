import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ChartFollowupComponent } from 'src/app/_module/visite/component/follow-up/chart-followup/chart-followup.component';
import { StoricoFollowupComponent } from 'src/app/_module/visite/component/follow-up/storico-followup/storico-followup.component';
import { TabellaProdottiComponent } from 'src/app/_module/visite/component/nutrizione/tabella-prodotti/tabella-prodotti.component';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit {

  formPrecompiledFollowup: FormGroup;
  kcalProdotti;
  proteineTot;
  azotoTot;
  apportoIdricoTot;
  idPaziente: string;
  idVisita: string;
  listaProdotti;
  editProdotti = false;
  formValue;
  isLoaded = false;
  refreshChart;
  valuePrecompiled;
  dateExistRes;
  fromFollowUp = true

  @ViewChild(ChartFollowupComponent) chartComponent: ChartFollowupComponent;
  @ViewChild(StoricoFollowupComponent) storicoFollowupComponent: StoricoFollowupComponent;
  @ViewChild(TabellaProdottiComponent, { static: false }) private tabellaProdottiComponent: TabellaProdottiComponent;

  prodottiDataSource;

  constructor(private activeroute: ActivatedRoute,
    private service: HttpSharedService,
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private backPreviousPage: Location

  ) {

  }


  ngOnInit() {

    this.idPaziente = this.activeroute.snapshot.paramMap.get('id');
    //
    this.activeroute.queryParams.subscribe(async data => {
      this.idVisita = data.visit;
    });

    this.formPrecompiledFollowup = this.formBuilder.group({
      al: new FormControl(this.appGen.today),
      peso: new FormControl(''),
      kcal: new FormControl({ value: '', disabled: true }),
      azoto: new FormControl({ value: '', disabled: true }),
      proteine: new FormControl({ value: '', disabled: true }),
      apportoIdrico: new FormControl({ value: '', disabled: true }),
      pesoOttimale: new FormControl(''),
      bmiOttimale: new FormControl(''),
      dataFollowup: new FormControl(this.appGen.today),
      prodotti: new FormArray([])
    });

    //prendo i primi dati compilati (kcal, azoto, proteine, prodotti ecc. alcuni modificabili)
    this.getPrecompiled();
  }

  get f() { return this.formPrecompiledFollowup.controls; }
  get t() { return this.f.prodotti as FormArray; }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  backToPrevious() {
    this.backPreviousPage.back()
  }

  async getPrecompiled() {

    const obj = {
      al: this.appGen.convertToLocaleDate(this.formPrecompiledFollowup.get('al').value),
      idpaziente: this.idPaziente
    };
    await this.service.postCallRequest({ action: 'precompiled', param: obj }).then(data => {

      this.valuePrecompiled = data;
      this.formPrecompiledFollowup.get("bmiOttimale").setValue(data.bmiottimale);
      this.formPrecompiledFollowup.get("pesoOttimale").setValue(data.pesoottimale);
      this.formPrecompiledFollowup.controls.kcal.setValue(data.kcal);
      this.formPrecompiledFollowup.controls.azoto.setValue(data.azoto);
      this.formPrecompiledFollowup.controls.proteine.setValue(data.proteine);
      this.formPrecompiledFollowup.controls.apportoIdrico.setValue(data.apportoIdrico);
      this.prodottiDataSource = data.prodotti;
      this.kcalProdotti = data.kcal;
      this.proteineTot = data.proteine;
      this.azotoTot = data.azoto;
      this.apportoIdricoTot = data.apportoIdrico
      this.formValue = data;

      this.isLoaded = true;

    });
  }

  async InsertFollowUp() {

    if (this.formPrecompiledFollowup.invalid) {
      this.appGen.validateAllFormFields(this.formPrecompiledFollowup);
      return;
    }

    let obj = new Object();

    obj = {
      IdVisita: this.idVisita,
      IdPaziente: this.idPaziente,
      Azoto: this.formPrecompiledFollowup.get("azoto").value,
      Kcal: this.formPrecompiledFollowup.get("kcal").value,
      Proteine: this.formPrecompiledFollowup.get("proteine").value,

      Peso: this.formPrecompiledFollowup.get("peso").value,
      ApportoIdrico: this.formPrecompiledFollowup.get("apportoIdrico").value,
      Prodottixfollowup: this.tabellaProdottiComponent.prodottiDataSource.data,
      DataFollowup: this.formPrecompiledFollowup.get("dataFollowup").value,
    }

    await this.service.postCallRequest({ action: 'checkFollowUpDateExist', param: obj }).then(data => {

      this.dateExistRes = data

      if (this.dateExistRes) {//true

        const dialogData = new ConfirmDialogModel("Attenzione!", 'Esiste già un follow up per questa data, vuoi sovrascrivere?');
        const dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });

        dialogRef.afterClosed().subscribe(dialogResult => {
          if (!dialogResult) {
            return
          } else {

            this.salvaFollowup(obj);
          }
        });
      } else {
        this.salvaFollowup(obj);
      }

    });
  }


  async salvaFollowup(obj) {
    await this.service.postCallRequest({ action: 'insertfollowup', param: obj }).then((data) => {
      this.prodottiDataSource.data = this.tabellaProdottiComponent.prodottiDataSource.data;
      this.chartComponent.changeData();
      this.storicoFollowupComponent.getListaStorico();

    });

  }


  async getListaProdotti(idprodotti) {
    let obj = new Object();
    obj = {
      ListIdProdotti: idprodotti
    }

    await this.service.postCallRequest({ action: 'listaprodotti', param: obj }).then(data => {
      this.listaProdotti = data;
    });
  }

  async checkFollowUpDateExist(obj) {

    await this.service.postCallRequest({ action: 'checkFollowUpDateExist', param: obj }).then(data => {
      this.dateExistRes = data
    });
  }


  addProdotto() {
    this.t.push(this.formBuilder.group({
      Quantita: [''],
      IdProdotto: [''],
    }));
  }

  modificaNutrizione() {
    this.editProdotti = !this.editProdotti;
  }

  // async saveProduct(prodotti) {
  //   if (this.appGen.isNullOrUndefined(prodotti[0].IdProdotto) || prodotti[0].IdProdotto === '') {
  //     this.notificate.error('Selezionare almeno un prodotto');
  //     return;
  //   }
  //   let kcal = this.formPrecompiledFollowup.get('kcal').value;

  //    await this.visiteService.GetValoriProdotti(prodotti, kcal).then(data => {
  //     this.editProdotti = false;
  //     this.prodottiDataSource = data;
  //   });

  // }

  modificaProdotti() {
    this.editProdotti = true;
  }

}
