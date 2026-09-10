import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormProdottoComponent } from './component/alimenti/form-prodotto/form-prodotto.component';
import { ListaProdottiComponent } from './component/alimenti/lista-prodotti/lista-prodotti.component';
import { FormSaccaComponent } from './component/miscele/form-sacca/form-sacca.component';
import { ListaMisceleComponent } from './component/miscele/lista-miscele/lista-miscele.component';
import { IndexComponent } from './page/index/index.component'
import { NuovoComponent } from './page/nuovo/nuovo.component';
import { ProdottoComponent } from './page/prodotto/prodotto.component';
import { ArchivioProdottiComponent } from './component/archivio-prodotti/archivio-prodotti.component';

export const routes: Routes = [

  {

    path: '',
    data: { title: 'Prodotti' },
    // canActivate: [AuthGuard],

    children: [
      {
        path: '',
        component: IndexComponent,
        children: [
          { path: 'alimenti', component: ListaProdottiComponent },
          { path: 'miscele', component: ListaMisceleComponent },
          {
            path: 'alimenti1',
            data: { tipo: 'alimenti', },
            component: ArchivioProdottiComponent
          },
          {
            path: 'miscele1',
            data: { tipo: 'miscele', },
            component: ArchivioProdottiComponent
          }
        ]
      },
      {
        path: 'nuovo', component: ProdottoComponent,
        children: [
          { path: 'prodotto', component: FormProdottoComponent },
        ]
      },
      {
        path: 'dettaglio', component: ProdottoComponent,
        children: [
          { path: 'prodotto/:id', component: FormProdottoComponent },
          { path: 'sacca/:id', component: FormSaccaComponent },
        ]
      },
      {
        path: 'tipologia', component: NuovoComponent,

      },
    ]

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdottiRoutingModule { }
