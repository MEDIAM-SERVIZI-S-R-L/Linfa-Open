import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaDocumentiDialogModel, ListaDocumentiComponent } from 'src/app/shared/lista-documenti/lista-documenti.component';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { StatoVisita } from 'src/app/_core/helpers/enums';
import { Location } from '@angular/common';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';

@Component({
  selector: 'app-visita-domiciliare',
  templateUrl: './visita-domiciliare.component.html',
  styleUrls: ['./visita-domiciliare.component.scss']
})
export class VisitaDomiciliareComponent implements OnInit {

  form: FormGroup;
  idVisitaPrecedente;
  idVisitaCorrente;
  idPaziente;
  isRiepilogo = false;
  edit = true;
  fromDomiciliare = true;
  statoVisita = StatoVisita
  visitaPadre;

  constructor(
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    public router: Router,
    private backPreviousPage: Location,

  ) { }

  ngOnInit() {
    this.idPaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.activateRoute.queryParams.subscribe(params => {

      if (!this.appGen.isNullOrUndefined(params.visit)) {
        this.idVisitaPrecedente = params.visit;
        this.getDatiVisita(this.idVisitaPrecedente);

      }
      if (!this.appGen.isNullOrUndefined(params.currentvisit)) {
        this.idVisitaCorrente = params.currentvisit;

      }
    });

    this.existVisita()



    this.form = this.formBuilder.group({
      considerazioni: new FormControl(''),
    });
  }

  async existVisita() {

    await this.service.getCallRequest({ action: 'getVisitaDomicilio', param: this.idVisitaCorrente }).then(data => {
      if (data.exist) {
        this.setValueForm(data.visitaDomiciliare);
      }
    });
  }

  async getDatiVisita(idVisita) {

    await this.service.getCallRequest({ action: 'getDatiVisita', param: idVisita }).then(data => {

      this.visitaPadre = data;
    });
  }

  modifica() {
    this.edit = true
    this.form.enable();
    this.form.updateValueAndValidity();
  }

  async setValueForm(data) {
    this.edit = false;

    if (data.idStatoVisita == this.statoVisita.Terminata || data.idStatoVisita == this.statoVisita.Firmata) {
      this.isRiepilogo = true;
      this.form.disable();
      this.form.updateValueAndValidity();
    }

    this.form.controls.considerazioni.setValue(data.considerazioni)
  }

  esci() {

    this.backPreviousPage.back()
  }

  async onSubmit() {
    let obj = {
      Considerazioni: this.form.get('considerazioni').value,
      IdVisitaCorrente: this.idVisitaCorrente
    }


    const message = `Sei sicuro di voler proseguire?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"
    });

    dialogRef.afterClosed().subscribe(async (dialogResult) => {
      if (dialogResult) {

        await this.service.postCallRequest({ action: 'insertUpdateVisitaDomicilio', param: obj }).then(() => {
          this.edit = false;
          this.form.disable();
          this.form.updateValueAndValidity();
        })
      }
    })
  }

  async concludiVisita() {
    const message = `Vuoi concludere la visita?`;
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"
    });

    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {

        this.service.putCallRequest({ action: 'concludiVisita', param: this.idVisitaCorrente }).then(() => {
          this.router.navigate(['/app/visite'])
        })
      }
    }));
  }

  async openDocumentList() {

    let obj = {
      idVisita: this.idVisitaPrecedente
    }
    // let res = await this.visiteService.getlistdocumenti(obj);
    const dialogData = new ListaDocumentiDialogModel("Documenti visita " + this.visitaPadre.dataVisita, obj);

    this.dialog.open(ListaDocumentiComponent, {
      data: dialogData,
      panelClass: "modal-lista-documenti"
    });


  }
}
