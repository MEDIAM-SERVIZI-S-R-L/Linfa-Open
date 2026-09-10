import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UtentiRoutingModule } from './utenti-routing';


import { IndexComponent } from './page/index/index.component';
import { ListaUtentiComponent } from './component/lista-utenti/lista-utenti.component';
import { FormUtenteComponent } from './component/form-utente/form-utente.component';
import { NuovoUtenteComponent } from './page/nuovo-utente/nuovo-utente.component';
import { DettaglioComponent } from './page/dettaglio/dettaglio.component';
import { AssociazioneEntiComponent } from './component/associazione-enti/associazione-enti.component';
import { MaterialModule } from 'src/app/_core/material/material.module';



@NgModule({
  declarations: [
    IndexComponent,
    ListaUtentiComponent,
    FormUtenteComponent,
    NuovoUtenteComponent,
    DettaglioComponent,
    AssociazioneEntiComponent,
  ],
  imports: [
    CommonModule, UtentiRoutingModule, MaterialModule, ReactiveFormsModule,
    FormsModule
  ]
})
export class UtentiModule { }
