import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoRichiesta } from 'src/app/_core/helpers/enums';

import { FormRichiestaComponent } from './component/form-richiesta/form-richiesta.component';
import { IndexComponent } from './page/index/index.component'
import { NuovaRichiestaComponent } from './page/nuova-richiesta/nuova-richiesta.component';
import { PageRouteComponent } from './page/page-route/page-route.component';
import { RichiestaEsternaComponent } from './page/richiesta-esterna/richiesta-esterna.component';
import { FormNuovaRichiestaComponent } from './richiesta2.0/form-nuova-richiesta/form-nuova-richiesta.component';

export const routes: Routes = [

  {
    path: '',
    component: IndexComponent,
    data: { title: 'Richieste' },
    // canActivate: [AuthGuard],
  },
  {
    path: 'nuova',
    component: NuovaRichiestaComponent,
    data: { showBackBtn: true, title: 'Nuova Richiesta',tipoRichiesta: null },

  },
{
  path: 'nuova-orderentry',
  component: RichiestaEsternaComponent,
  data: { showBackBtn: true, title: 'Nuova Richiesta esterna', tipoRichiestaRoute:TipoRichiesta.Reparto },

},
{
  path: 'nuova-distrettuale',
  component: RichiestaEsternaComponent,
  data: { showBackBtn: true, title: 'Nuova Richiesta Distrettuale', tipoRichiestaRoute:TipoRichiesta.Distretto },

},
{
  path: 'nuova-distretto',
  component: RichiestaEsternaComponent,
  data: { showBackBtn: true, title: 'Nuova Richiesta esterna', distretto:true },

},
  {
    path: 'dettaglio',
    component: PageRouteComponent,
    data: { showBackBtn: true, title: 'Dettaglio richiesta' },
    children: [
      { path: 'richiesta/:id', component: FormRichiestaComponent },
    ]
  },

  {
    path: 'form-nuova-richiesta',
    component: FormNuovaRichiestaComponent,
    data: { showBackBtn: true, title: 'Form Nuova Richiesta' },

  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RichiesteRoutingModule { }
