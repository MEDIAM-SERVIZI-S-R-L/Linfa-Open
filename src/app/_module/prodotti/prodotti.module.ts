import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottiRoutingModule } from './prodotti-routing'
import { IndexComponent } from './page/index/index.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormProdottoComponent } from './component/alimenti/form-prodotto/form-prodotto.component';
import { ProdottoComponent } from './page/prodotto/prodotto.component';
import { NuovoComponent } from './page/nuovo/nuovo.component';
import { FormSaccaComponent } from './component/miscele/form-sacca/form-sacca.component';
import { ListaProdottiComponent } from './component/alimenti/lista-prodotti/lista-prodotti.component';
import { ListaMisceleComponent } from './component/miscele/lista-miscele/lista-miscele.component';
import { TabellaAggiunteComponent } from './component/miscele/tabella-aggiunte/tabella-aggiunte.component';
import { ModalCreaSaccaComponent } from './component/miscele/modal-crea-sacca/modal-crea-sacca.component';
import { ModalInfoMiscelaComponent } from './component/miscele/modal-info-miscela/modal-info-miscela.component';
import { DirectiveModule } from 'src/app/_core/directive/directive.module';
import { MaterialModule } from 'src/app/_core/material/material.module';
import { ArchivioProdottiComponent } from './component/archivio-prodotti/archivio-prodotti.component';
import { ConfezionamentoProdottoComponent } from './component/confezionamento-prodotto/confezionamento-prodotto.component';
import { ModalConfezionamentoComponent } from './component/modal-confezionamento/modal-confezionamento.component';

@NgModule({
  declarations: [IndexComponent, ListaProdottiComponent, FormProdottoComponent, ProdottoComponent,
    FormSaccaComponent, NuovoComponent, ListaMisceleComponent, TabellaAggiunteComponent, ModalCreaSaccaComponent, ModalInfoMiscelaComponent, ArchivioProdottiComponent,
    ConfezionamentoProdottoComponent, ModalConfezionamentoComponent
  ],
  imports: [
    CommonModule, ProdottiRoutingModule,
    MaterialModule,
    FormsModule, ReactiveFormsModule,
    DirectiveModule
  ],
  exports: [
    FormSaccaComponent,
    ModalCreaSaccaComponent
  ],
})
export class ProdottiModule { }
