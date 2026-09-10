import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RichiesteRoutingModule } from './richieste-routing'
import { IndexComponent } from './page/index/index.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListaRichiesteComponent } from './component/lista-richieste/lista-richieste.component';
import { NuovaRichiestaComponent } from './page/nuova-richiesta/nuova-richiesta.component';
import { FormRichiestaComponent } from './component/form-richiesta/form-richiesta.component'
import { RichiestaComponent } from './page/richiesta/richiesta.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PageRouteComponent } from './page/page-route/page-route.component';
import { MaterialModule } from 'src/app/_core/material/material.module';
import { FormNuovaRichiestaComponent } from './richiesta2.0/form-nuova-richiesta/form-nuova-richiesta.component';
import { CalendarModule } from "angular-calendar";
import { NativeDateAdapter } from '@angular/material/core';
import { RichiestaEsternaComponent } from './page/richiesta-esterna/richiesta-esterna.component';

@NgModule({
  declarations: [IndexComponent, ListaRichiesteComponent, NuovaRichiestaComponent,
    FormRichiestaComponent, RichiestaComponent,
    PageRouteComponent,
    FormNuovaRichiestaComponent,
    RichiestaEsternaComponent
  ],
  imports: [
    CommonModule, RichiesteRoutingModule, SharedModule,
    MaterialModule,
    FormsModule, ReactiveFormsModule,
    CalendarModule.forRoot({ provide: NativeDateAdapter }),
  ],
  exports: [
    RichiestaComponent, FormRichiestaComponent
  ],
  providers: [

  ]
})
export class RichiesteModule { }
