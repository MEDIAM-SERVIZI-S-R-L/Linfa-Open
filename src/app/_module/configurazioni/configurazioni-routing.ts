import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurazioneAnalisiComponent } from './component/analisi/configurazione-analisi/configurazione-analisi.component';
import { GestioneConfigurazioniComponent } from './component/configurazioni-linfa/gestione-configurazioni/gestione-configurazioni.component';
import { ListaConfigComponent } from './component/configurazioni-linfa/lista-config/lista-config.component';
import { ListaDistrettiComponent } from './component/distretti/lista-distretti/lista-distretti.component';
import { FormPermessiComponent } from './component/form-permessi/form-permessi.component';
import { ImportDatiComponent } from './component/import-dati/import-dati/import-dati.component';
import { ListaProprietaComponent } from './component/kcal-proprieta/lista-proprieta/lista-proprieta.component';
import { ListaLogComponent } from './component/lista-log/lista-log.component';
import { ListaOspedaliComponent } from './component/ospedali/lista-ospedali/lista-ospedali.component';
import { FormConclusioniPredefiniteComponent } from './component/predefinite/form-conclusioni-predefinite/form-conclusioni-predefinite.component';
import { FormMetodoAssunzioneComponent } from './component/predefinite/form-metodo-assunzione/form-metodo-assunzione.component';
import { FormNotePredefiniteComponent } from './component/predefinite/form-note-predefinite/form-note-predefinite.component';
import { ListaProdottiGareComponent } from './component/prodotti-gare/lista-prodotti-gare/lista-prodotti-gare.component';
import { ListaRepartiComponent } from './component/reparti/lista-reparti/lista-reparti.component';

import { IndexComponent } from './page/index/index.component';

export const routes: Routes = [

  {

    path: '',
    // component: IndexComponent,
    data: { title: 'Dashboard Linfa' },

    children: [
      {
        path: '',
        component: IndexComponent
      },
      {
        path: 'distretti',
        component: ListaDistrettiComponent
      },
      {
        path: 'ospedali',
        component: ListaOspedaliComponent
      },
      {
        path: 'reparti/:ospedale',
         component: ListaRepartiComponent
      },
      {
        path: 'configurazioni',
        component: ListaConfigComponent
      },
      {
        path: 'categorie',
        component: GestioneConfigurazioniComponent
      },
      {
        path: 'permessi',
        component: FormPermessiComponent
      },
      {
        path: 'conclusioni-predefinite',
        component: FormConclusioniPredefiniteComponent
      },
      {
        path: 'metodi-assunzione',
        component: FormMetodoAssunzioneComponent
      },
      {
        path: 'note-nutrizionali',
        component: FormNotePredefiniteComponent
      },
      {
        path: 'kcal-base',
        component: ListaProprietaComponent
      },
      {
        path:'prodotti-gare',
        component: ListaProdottiGareComponent
      },
      {
        path:'analisi',
        component: ConfigurazioneAnalisiComponent
      },
      {
        path: 'log-sistema',
        component: ListaLogComponent
      },
      {
        path: 'import-dati',
        component: ImportDatiComponent
      }

    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurazioniRoutingModule { }
