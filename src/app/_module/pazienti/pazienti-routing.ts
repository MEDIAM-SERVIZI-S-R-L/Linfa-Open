import { PageRouteComponent } from './../visite/page/page-route/page-route.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListaCaregiverComponent } from './component/lista-caregiver/lista-caregiver.component';

import { AnagraficaComponent } from './component/anagrafica/anagrafica.component';
import { RiepilogoComponent } from './component/riepilogo/riepilogo.component';
import { FormCaregiverComponent } from './component/form-caregiver/form-caregiver.component';
import { IndexComponent } from './page/index/index.component';
import { PrivacyComponent } from './component/privacy/privacy.component';
import { ListaNotePazienteComponent } from 'src/app/shared/note-paziente/lista-note-paziente/lista-note-paziente.component';

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
        path: 'step', component: PageRouteComponent,
        data: { showBackBtn: false },
        children: [
          { path: 'paziente', component: AnagraficaComponent },
          { path: 'paziente/:id', component: AnagraficaComponent },
          { path: 'privacy/:id', component: PrivacyComponent },
          { path: 'caregivers/:id', component: ListaCaregiverComponent },
          { path: 'nuovo-caregiver/:id', component: FormCaregiverComponent },
          { path: 'riepilogo/:id', component: RiepilogoComponent },
        ]
      },
      {
        path: 'dettaglio', component: PageRouteComponent,
        data: { showBackBtn: true },

        children: [
          { path: 'paziente/:id', component: AnagraficaComponent },
          { path: 'caregivers/:id', component: ListaCaregiverComponent },
          { path: 'caregiver/:idcaregiver', component: FormCaregiverComponent },
          { path: 'note/:id', component: ListaNotePazienteComponent },

        ]
      },

    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PazientiRoutingModule { }
