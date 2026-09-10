import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LinfaComponent } from './page/linfa/linfa.component'
import { AuthGuard } from '../app/_core/app-auth/service/auth.guard'
import { Permessi } from './_core/helpers/enums';
import { DemomiscelaComponent } from './page/demomiscela/demomiscela.component';
import { ListaDistrettiComponent } from './_module/configurazioni/component/distretti/lista-distretti/lista-distretti.component';
import { ListaOspedaliComponent } from './_module/configurazioni/component/ospedali/lista-ospedali/lista-ospedali.component';
import { ListaRepartiComponent } from './_module/configurazioni/component/reparti/lista-reparti/lista-reparti.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./_core/app-auth/app-auth.module').then(m => m.AppAuthModule),
    data: { title: 'Login Linfa' }
  },
  {
    path: 'demomiscela',
    component: DemomiscelaComponent

  },
  {
    path: 'ext',
    loadChildren: () => import('./_module/accesso-esterno/accesso-esterno.module').then(m => m.AccessoEsternoModule),
  },
  {
    path: 'app',
    component: LinfaComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { title: 'Utenti', permesso: Permessi.ModuloDashboard },
        loadChildren: () => import('./_module/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'richieste',
        canActivate: [AuthGuard],
        data: { permesso: Permessi.ModuloRichieste },
        loadChildren: () => import('./_module/richieste/richieste.module').then(m => m.RichiesteModule),
      },
      {
        path: 'pazienti',
        canActivate: [AuthGuard],
        data: { permesso: Permessi.ModuloPazienti },

        loadChildren: () => import('./_module/pazienti/pazienti.module').then(m => m.PazientiModule),
      },
      {
        path: 'prodotti',
        canActivate: [AuthGuard],
        data: { permesso: Permessi.ModuloProdotti },
        loadChildren: () => import('./_module/prodotti/prodotti.module').then(m => m.ProdottiModule),
      },
      {
        path: 'visite',
        canActivate: [AuthGuard],
        data: { title: 'Utenti', permesso: Permessi.ModuloVisite },
        loadChildren: () => import('./_module/visite/visite.module').then(m => m.VisiteModule),
      },

      {
        path: 'statistiche',
        data: { permesso: Permessi.ModuloStatistiche },
        loadChildren: () => import('./_module/statistiche/statistiche.module').then(m => m.StatisticheModule),
      },
      {
        path: 'contatti',
        canActivate: [AuthGuard],
        data: { permesso: Permessi.ModuloSupporto },
        loadChildren: () => import('./_module/contatti/contatti.module').then(m => m.ContattiModule),
      },
      {
        path: 'profilo',
        canActivate: [AuthGuard],
        data: { title: 'Utenti', permesso: Permessi.ModuloProfilo },
        loadChildren: () => import('./_module/profilo/profilo.module').then(m => m.ProfiloModule),
      },
      {
        path: 'configurazioni',
        canActivate: [AuthGuard],
        data: { permesso: Permessi.ModuloGestionePermessi },
        loadChildren: () => import('./_module/configurazioni/configurazioni.module').then(m => m.ConfigurazioniModule),
      },
      {
        path: 'utenti',
        canActivate: [AuthGuard],
        data: { title: 'Utenti', permesso: Permessi.ModuloUtenti },
        loadChildren: () => import('./_module/utenti/utenti.module').then(m => m.UtentiModule),
      },
    ]
  },


  {
    path: '', redirectTo: 'login', pathMatch: 'full',
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy'
  })], exports: [RouterModule]
})
export class AppRoutingModule { }
