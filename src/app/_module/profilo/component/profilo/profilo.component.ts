import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { ModalPasswordComponent } from 'src/app/shared/modal/modal-password/modal-password.component';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ReportService } from 'src/app/_core/services/report.service';
import { ModalPdfViewerComponent } from 'src/app/shared/modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { ProfiloUtente } from 'src/app/_dtos/models_old';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.scss']
})
export class ProfiloComponent implements OnInit {

  formProfilo: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public appGen: AppGeneralService,
    public dialog: MatDialog,
    private service: HttpSharedService,
    public authGuard: AuthGuard,
    private report: ReportService

  ) { }

  ngOnInit(): void {
    this.formProfilo = this.formBuilder.group({
      nome: new FormControl({ value: '', disabled: true }),
      cognome: new FormControl({ value: '', disabled: true }),
      username: new FormControl({ value: '', disabled: true }),
      ruolo: new FormControl({ value: '', disabled: true }),
      matricola: new FormControl({ value: '', disabled: true }),
      email: new FormControl({ value: '', disabled: true }),
      dataPassword: new FormControl({ value: '', disabled: true }),
    });
    this.dettaglioForm();

  }
  get formProfiloControls() { return this.formProfilo.controls; }


  async provaFirmaDigitale(): Promise<void> {
    const obj = {
      pdfFile: this.report.creaProvaFirmaDigitale(),
      isReferto: true,
      FirmaSelezionati: false, 
      testFirma: true,
      title: 'Prova firma digitale',


    }
    this.dialog.open(ModalPdfViewerComponent, {
      data: obj,
      panelClass: "modal-anteprima-pdf"

    });
  }


  async cambiaPassword(): Promise<void> {
    this.dialog.open(ModalPasswordComponent, {
      data: null,
      panelClass: "modal-custom",
    });
  }


  async dettaglioForm(): Promise<void> {
    await this.service.getCallRequest({ action: 'utente' }).then((data: ProfiloUtente): void => {
      this.formProfilo.get('nome').setValue(data.nome)
      this.formProfilo.get('cognome').setValue(data.cognome)
      this.formProfilo.get('username').setValue(data.username)
      this.formProfilo.get('email').setValue(data.email)
      this.formProfilo.get('matricola').setValue(data.matricola)
      this.formProfilo.get('ruolo').setValue(data.ruolo)
      this.formProfilo.get('dataPassword').setValue(data.dataPassword)
    });


  }
}
