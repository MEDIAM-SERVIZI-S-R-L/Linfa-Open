import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PazientiRoutingModule } from './pazienti-routing';

import { IndexComponent } from './page/index/index.component';
import { AnagraficaComponent } from './component/anagrafica/anagrafica.component';
import { FormCaregiverComponent } from './component/form-caregiver/form-caregiver.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListaPazientiComponent } from './component/lista-pazienti/lista-pazienti.component';
import { ListaCaregiverComponent } from './component/lista-caregiver/lista-caregiver.component';
import { RiepilogoComponent } from './component/riepilogo/riepilogo.component';
import { StepperComponent } from './component/stepper/stepper.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrivacyComponent } from './component/privacy/privacy.component';
import { DatiPazienteComponent } from './component/dati-paziente/dati-paziente.component';
import { DirectiveModule } from 'src/app/_core/directive/directive.module';
import { PageRouteComponent } from './page/page-route/page-route.component';
import { TutoreMinorenneComponent } from './component/tutore-minorenne/tutore-minorenne.component';
import { MaterialModule } from 'src/app/_core/material/material.module';

@NgModule({
  declarations: [
    //Pages
    PageRouteComponent,
    IndexComponent,
    //Component
    AnagraficaComponent,
    FormCaregiverComponent,
    ListaPazientiComponent,
    ListaCaregiverComponent,
    RiepilogoComponent,
    PrivacyComponent,
    StepperComponent,
    DatiPazienteComponent,
    TutoreMinorenneComponent
  ],
  imports: [
    CommonModule, PazientiRoutingModule, MaterialModule, ReactiveFormsModule, SharedModule,
    FormsModule, DirectiveModule


  ],
  exports: [
    IndexComponent, AnagraficaComponent,
    FormCaregiverComponent, ListaPazientiComponent, ListaCaregiverComponent, PrivacyComponent,
    DatiPazienteComponent
  ]
})
export class PazientiModule { }
