import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarioDisponibilitaComponent } from 'src/app/shared/calendario-disponibilita/calendario-disponibilita.component';
import { CalendarModule } from 'angular-calendar';
import { NativeDateAdapter } from '@angular/material/core';
import { MaterialModule } from 'src/app/_core/material/material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { ModalInfoProdottiComponent } from './modal/modal-info-prodotti/modal-info-prodotti.component';
import { ModalAnnullaRichiestaComponent } from './modal/modal-annulla-richiesta/modal-annulla-richiesta.component';
import { DirectiveModule } from 'src/app/_core/directive/directive.module';
import { ModalBristolChartComponent } from './modal/modal-bristol-chart/modal-bristol-chart.component';
import { ModalValiditaPianoTerapeuticoComponent } from './modal/modal-validita-piano-terapeutico/modal-validita-piano-terapeutico.component';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { ModalPdfViewerComponent } from './modal/modal-pdf-viewer/modal-pdf-viewer.component';
import { ModalPasswordComponent } from './modal/modal-password/modal-password.component';
import { ModalDocumentoPrivacyComponent } from './modal/modal-documento-privacy/modal-documento-privacy.component';
import { ModalPrenotaRichiestaComponent } from './modal/modal-prenota-richiesta/modal-prenota-richiesta.component';
import { ListaDocumentiComponent } from './lista-documenti/lista-documenti.component';
import { MenuComponent } from './menu/menu.component';
import { ModalConfirmComponent } from './modal/modal-confirm/modal-confirm.component';
import { ModalDialogComponent } from './modal/modal-dialog/modal-dialog.component';
import { RouterModule } from '@angular/router';
import { LinfaComponent } from 'src/app/page/linfa/linfa.component';
import { ProdottiModule } from 'src/app/_module/prodotti/prodotti.module';
import { ModalDettaglioOrarioComponent } from './modal/modal-dettaglio-orario/modal-dettaglio-orario.component';
import { DispositivoMedicoComponent } from './dispositivo-medico/dispositivo-medico.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ListaNotePazienteComponent } from './note-paziente/lista-note-paziente/lista-note-paziente.component';
import { ModalNotePazienteComponent } from './note-paziente/modal-note-paziente/modal-note-paziente.component';
import { CruscottoPazienteComponent } from "./cruscotto-paziente/cruscotto-paziente.component";
import { ListaStoricoComponent } from "./lista-storico/lista-storico.component";
import { PesoBmiComponent } from './peso-bmi/peso-bmi.component';
import { ListaAnalisiPazienteComponent } from './analisi-paziente/lista-analisi-paziente/lista-analisi-paziente.component';
import { DettaglioAnalisiComponent } from './analisi-paziente/dettaglio-analisi/dettaglio-analisi.component';
import { InserimentoAnalisiComponent } from './analisi-paziente/inserimento-analisi/inserimento-analisi.component';
import { ModalImpegnativaCupComponent } from './modal-impegnativa-cup/modal-impegnativa-cup.component';
@NgModule({
  declarations: [
    LinfaComponent,

    MenuComponent,
    ModalDialogComponent,
    ModalConfirmComponent,
    CalendarioDisponibilitaComponent,
    UploadFileComponent,
    ModalInfoProdottiComponent,
    SignaturePadComponent,
    ModalBristolChartComponent,
    ModalAnnullaRichiestaComponent,
    ModalValiditaPianoTerapeuticoComponent,
    PdfViewerComponent,
    ModalPdfViewerComponent,
    ModalPasswordComponent,
    ModalDocumentoPrivacyComponent,
    ModalPrenotaRichiestaComponent,
    ListaDocumentiComponent,
    ModalDettaglioOrarioComponent,
    DispositivoMedicoComponent,
    ModalNotePazienteComponent,
    ListaNotePazienteComponent,
    CruscottoPazienteComponent,
    ListaStoricoComponent,
    PesoBmiComponent,
    ListaAnalisiPazienteComponent,
    DettaglioAnalisiComponent,
    InserimentoAnalisiComponent,
    ModalImpegnativaCupComponent
  ],
  imports: [
    ProdottiModule,
    RouterModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DirectiveModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({ provide: NativeDateAdapter }),

  ],
  exports: [
    LinfaComponent,
    RouterModule,
    MenuComponent,
    ModalDialogComponent,
    ModalConfirmComponent,
    CalendarioDisponibilitaComponent,
    UploadFileComponent,
    ModalInfoProdottiComponent, SignaturePadComponent,
    ModalBristolChartComponent,
    ModalAnnullaRichiestaComponent,
    ModalValiditaPianoTerapeuticoComponent,
    PdfViewerComponent,
    ModalPdfViewerComponent,
    ModalPasswordComponent,
    ModalDocumentoPrivacyComponent,
    ModalPrenotaRichiestaComponent,
    ListaDocumentiComponent,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ModalDettaglioOrarioComponent,
    DispositivoMedicoComponent,
    ModalNotePazienteComponent,
    ListaNotePazienteComponent,
    CruscottoPazienteComponent,
    ListaStoricoComponent
  ],
  entryComponents: [
    ModalDialogComponent,
    ModalConfirmComponent,
  ],
  providers: [
  ]
})
export class SharedModule { }
