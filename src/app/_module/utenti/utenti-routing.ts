import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './page/index/index.component'
import { NuovoUtenteComponent } from './page/nuovo-utente/nuovo-utente.component';
import { DettaglioComponent } from './page/dettaglio/dettaglio.component';
import { NgModule } from '@angular/core';


export  const routes: Routes = [

  {

    path: '',
    // component: IndexComponent,
    data: { title: 'Utenti' },
    children: [
      {
        path: '',
        component: IndexComponent
      },
      { path: 'nuovo-utente', component: NuovoUtenteComponent },
      { path: 'dettaglio/:id', component: DettaglioComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtentiRoutingModule { }
