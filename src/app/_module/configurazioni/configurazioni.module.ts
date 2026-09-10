import { ModalConfigurazioneComponent } from './component/configurazioni-linfa/modal-configurazione/modal-configurazione.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './page/index/index.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfigurazioniRoutingModule } from './configurazioni-routing';
import { FormPermessiComponent } from './component/form-permessi/form-permessi.component';
import { FormMetodoAssunzioneComponent } from './component/predefinite/form-metodo-assunzione/form-metodo-assunzione.component';
import { ListaLogComponent } from './component/lista-log/lista-log.component';
import { ListaProprietaComponent } from './component/kcal-proprieta/lista-proprieta/lista-proprieta.component';
import { FormConclusioniPredefiniteComponent } from './component/predefinite/form-conclusioni-predefinite/form-conclusioni-predefinite.component';
import { ModalEditProprietaComponent } from './component/kcal-proprieta/modal-edit-proprieta/modal-edit-proprieta.component';
import { ListaConfigComponent } from './component/configurazioni-linfa/lista-config/lista-config.component';
import { ListaProdottiGareComponent } from './component/prodotti-gare/lista-prodotti-gare/lista-prodotti-gare.component';
import { ModalProdottoGaraComponent } from './component/prodotti-gare/modal-prodotto-gara/modal-prodotto-gara.component';
import { MaterialModule } from 'src/app/_core/material/material.module';
import { FormNotePredefiniteComponent } from './component/predefinite/form-note-predefinite/form-note-predefinite.component';
import { ListaDistrettiComponent } from './component/distretti/lista-distretti/lista-distretti.component';
import { ModalDistrettiComponent } from './component/distretti/modal-distretti/modal-distretti.component';
import { ListaOspedaliComponent } from './component/ospedali/lista-ospedali/lista-ospedali.component';
import { ModalOspedaliComponent } from './component/ospedali/modal-ospedali/modal-ospedali.component';
import { ListaRepartiComponent } from './component/reparti/lista-reparti/lista-reparti.component';
import { ModalRepartiComponent } from './component/reparti/modal-reparti/modal-reparti.component';
import { ModalConfezionamentoGaraComponent } from './component/prodotti-gare/modal-confezionamento-gara/modal-confezionamento-gara.component';
import { ConfigurazioneAnalisiComponent } from 'src/app/_module/configurazioni/component/analisi/configurazione-analisi/configurazione-analisi.component';
import { ModalRangeComponent } from './component/analisi/modal-range/modal-range.component';
import { ModalProprietaComponent } from './component/analisi/modal-proprieta/modal-proprieta.component';
import { ImportDatiComponent } from './component/import-dati/import-dati/import-dati.component';
import { GestioneConfigurazioniComponent } from './component/configurazioni-linfa/gestione-configurazioni/gestione-configurazioni.component';
import { ModalCategoriaConfigurazioneComponent } from './component/configurazioni-linfa/modal-categoria-configurazione/modal-categoria-configurazione.component';




@NgModule({
  declarations: [
    IndexComponent,
    FormPermessiComponent,
    FormConclusioniPredefiniteComponent,
    FormNotePredefiniteComponent,
    FormMetodoAssunzioneComponent,
    ListaLogComponent,
    ListaProprietaComponent,
    ModalEditProprietaComponent,
    ListaConfigComponent,
    ModalConfigurazioneComponent,
    ListaProdottiGareComponent,
    ModalProdottoGaraComponent,
    ListaDistrettiComponent,
    ModalDistrettiComponent,
    ListaOspedaliComponent,
    ModalOspedaliComponent,
    ListaRepartiComponent,
    ModalRepartiComponent,
    ModalConfezionamentoGaraComponent,
    ConfigurazioneAnalisiComponent,
    ModalRangeComponent,
    ModalProprietaComponent,
    ImportDatiComponent,
    GestioneConfigurazioniComponent,
    ModalCategoriaConfigurazioneComponent
  ],
  imports: [
    CommonModule, ConfigurazioniRoutingModule, MaterialModule, ReactiveFormsModule,
    FormsModule
  ]
})
export class ConfigurazioniModule { }
