import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NativeDateAdapter } from "@angular/material/core";
import { CalendarModule } from "angular-calendar";
import { StatoVisitaCheckGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { DirectiveModule } from "src/app/_core/directive/directive.module";
import { MaterialModule } from "src/app/_core/material/material.module";
import { PazientiModule } from "src/app/_module/pazienti/pazienti.module";
import { SharedModule } from "src/app/shared/shared.module";

import { ModalStoricoInviiComponent } from '../configurazioni/component/modal-storico-invii/modal-storico-invii.component';
import { CalendarioComponent } from "./component/calendario/calendario.component";
import { ChartFollowupComponent } from "./component/follow-up/chart-followup/chart-followup.component";
import { ProdottiFollowupComponent } from "./component/follow-up/prodotti-followup/prodotti-followup.component";
import { StoricoFollowupComponent } from "./component/follow-up/storico-followup/storico-followup.component";
import { FormRefertoComponent } from './component/form-referto/form-referto.component';
import { ListaRefertiComponent } from "./component/lista-referti/lista-referti.component";
import { ListaVisiteComponent } from "./component/lista-visite/lista-visite.component";
import { ModalDettaglioVisitaComponent } from "./component/modal-dettaglio-visita/modal-dettaglio-visita.component";
import { AnamnesiAlimentareComponent } from "./component/nutrizione/anamnesi-alimentare/anamnesi-alimentare.component";
import { ArtificialeComponent } from "./component/nutrizione/artificiale/artificiale.component";
import { ModalAnteprimaComponent } from "./component/nutrizione/modal-anteprima/modal-anteprima.component";
import { FormDietaComponent } from "./component/nutrizione/naturale-mista/form-dieta/form-dieta.component";
import { FormValoriComponent } from "./component/nutrizione/naturale-mista/form-valori/form-valori.component";
import { ListaDieteComponent } from "./component/nutrizione/naturale-mista/lista-diete/lista-diete.component";
import { NewFormDietaComponent } from './component/nutrizione/naturale-mista/new-form-dieta/new-form-dieta.component';
import { ListaPianiComponent } from "./component/nutrizione/piani-nutrizionali/lista-piani/lista-piani.component";
import { ModalRinnovoComponent } from "./component/nutrizione/piani-nutrizionali/modal-rinnovo/modal-rinnovo.component";
import { EditQuantitaComponent } from "./component/nutrizione/tabella-prodotti/edit-quantita/edit-quantita.component";
import { TabellaProdottiComponent } from "./component/nutrizione/tabella-prodotti/tabella-prodotti.component";
import { FormAllergiaComponent } from "./component/step-visita/anamnesi/allergie/form-allergia/form-allergia.component";
import { ListaAllergieComponent } from "./component/step-visita/anamnesi/allergie/lista-allergie/lista-allergie.component";
import { FormAnamnesiFamiliareComponent } from "./component/step-visita/anamnesi/anamnesi-familiare/form-anamnesi-familiare/form-anamnesi-familiare.component";
import { ListaAnamnesiFamiliareComponent } from "./component/step-visita/anamnesi/anamnesi-familiare/lista-anamnesi-familiare/lista-anamnesi-familiare.component";
import { FormAnamnesiFisiologicaComponent } from "./component/step-visita/anamnesi/anamnesi-fisiologica/form-anamnesi-fisiologica/form-anamnesi-fisiologica.component";
import { ListaAnamnesiFisiologicaComponent } from "./component/step-visita/anamnesi/anamnesi-fisiologica/lista-anamnesi-fisiologica/lista-anamnesi-fisiologica.component";
import { FormAnamnesiPatologicaProssimaComponent } from "./component/step-visita/anamnesi/anamnesi-patologica-prossima/form-anamnesi-patologica-prossima/form-anamnesi-patologica-prossima.component";
import { ListaAnamnesiPatologicaProssimaComponent } from "./component/step-visita/anamnesi/anamnesi-patologica-prossima/lista-anamnesi-patologica-prossima/lista-anamnesi-patologica-prossima.component";
import { FormAnamnesiPatologicaRemotaComponent } from "./component/step-visita/anamnesi/anamnesi-patologica-remota/form-anamnesi-patologica-remota/form-anamnesi-patologica-remota.component";
import { ListaAnamnesiPatologicaRemotaComponent } from "./component/step-visita/anamnesi/anamnesi-patologica-remota/lista-anamnesi-patologica-remota/lista-anamnesi-patologica-remota.component";
import { FormDipendenzaComponent } from "./component/step-visita/anamnesi/dipendenze/form-dipendenza/form-dipendenza.component";
import { ListaDipendenzeComponent } from "./component/step-visita/anamnesi/dipendenze/lista-dipendenze/lista-dipendenze.component";
import { FormFarmacoComponent } from "./component/step-visita/anamnesi/farmaci/form-farmaco/form-farmaco.component";
import { ListaFarmaciComponent } from "./component/step-visita/anamnesi/farmaci/lista-farmaci/lista-farmaci.component";
import { FormInterventoComponent } from "./component/step-visita/anamnesi/interventi/form-intervento/form-intervento.component";
import { ListaInterventiComponent } from "./component/step-visita/anamnesi/interventi/lista-interventi/lista-interventi.component";
import { FormPatologiaComponent } from "./component/step-visita/anamnesi/patologie/form-patologia/form-patologia.component";
import { ListaPatologieComponent } from "./component/step-visita/anamnesi/patologie/lista-patologie/lista-patologie.component";
import { PatologieComponent } from "./component/step-visita/anamnesi/patologie/patologie.component";
import { FormSportComponent } from "./component/step-visita/anamnesi/sport/form-sport/form-sport.component";
import { ListaSportComponent } from "./component/step-visita/anamnesi/sport/lista-sport/lista-sport.component";
import { FormKarnofskyComponent } from "./component/step-visita/mna-karnofsky/form-karnofsky/form-karnofsky.component";
import { FormMnaComponent } from "./component/step-visita/mna-karnofsky/form-mna/form-mna.component";
import { MustComponent } from './component/step-visita/mna-karnofsky/must/must.component';
import { NutritionalRiskScreeningComponent } from "./component/step-visita/mna-karnofsky/nutritional-risk-screening/nutritional-risk-screening.component";
import { StepperComponent } from "./component/step-visita/stepper/stepper.component";
import { FormValutazioneComponent } from "./component/step-visita/valutazione-nutrizionale/form-valutazione/form-valutazione.component";
import { ValutazioneNutrizionaleComponent } from "./component/step-visita/valutazione-nutrizionale/valutazione-nutrizionale.component";
import { VisitaDomiciliareComponent } from "./component/visita-domiciliare/visita-domiciliare.component";
import { ListaConclusioniPredefiniteComponent } from './modals/lista-conclusioni-predefinite/lista-conclusioni-predefinite.component';
import { AnamnesiPazienteComponent } from "./page/anamnesi-paziente/anamnesi-paziente.component";
import { ConcludiVisitaComponent } from './page/concludi-visita/concludi-visita.component';
import { DettaglioPianoComponent } from "./page/dettaglio-piano/dettaglio-piano.component";
import { FollowUpComponent } from "./page/follow-up/follow-up.component";
import { IndexComponent } from "./page/index/index.component";
import { MnaKarnofskyComponent } from "./page/mna-karnofsky/mna-karnofsky.component";
import { PageRouteComponent } from "./page/page-route/page-route.component";
import { PianiNutrizionaliComponent } from "./page/piani-nutrizionali/piani-nutrizionali.component";
import { RiepilogoComponent } from "./page/riepilogo/riepilogo.component";
import { StepRouteComponent } from './page/step-route/step-route.component';
import { StoricoComponent } from "./page/storico/storico.component";
import { VisiteRoutingModule } from "./visite-routing";

@NgModule({
  declarations: [

    //Pages
    PageRouteComponent,
    StepRouteComponent,
    PianiNutrizionaliComponent,
    DettaglioPianoComponent,
    MnaKarnofskyComponent,
    IndexComponent,
    FollowUpComponent,
    RiepilogoComponent,

    //Component
    AnamnesiAlimentareComponent,
    PatologieComponent,
    ValutazioneNutrizionaleComponent,
    CalendarioComponent,
    StoricoComponent,
   // ListaStoricoComponent,
    ListaDipendenzeComponent,
    ListaSportComponent,
    ListaFarmaciComponent,
    ListaAllergieComponent,
    ListaInterventiComponent,
    ListaPatologieComponent,
    FormAllergiaComponent,
    FormDipendenzaComponent,
    FormFarmacoComponent,
    FormSportComponent,
    FormInterventoComponent,
    StepperComponent,
    FormPatologiaComponent,
    FormKarnofskyComponent,
    FormMnaComponent,
    FormValutazioneComponent,
   // ListaStoricoComponent,
    StoricoFollowupComponent,
    ProdottiFollowupComponent,
    ArtificialeComponent,
    ModalDettaglioVisitaComponent,
    ModalDettaglioVisitaComponent,
    ChartFollowupComponent,
    ListaDieteComponent,
    FormDietaComponent,
    FormValoriComponent,
    ListaVisiteComponent,
    AnamnesiPazienteComponent,
    ModalAnteprimaComponent,
    NutritionalRiskScreeningComponent,
    ListaAnamnesiFamiliareComponent,
    FormAnamnesiFamiliareComponent,
    FormAnamnesiFisiologicaComponent,
    ListaAnamnesiFisiologicaComponent,
    ListaAnamnesiPatologicaRemotaComponent,
    FormAnamnesiPatologicaRemotaComponent,
    ListaAnamnesiPatologicaProssimaComponent,
    FormAnamnesiPatologicaProssimaComponent,
    VisitaDomiciliareComponent,
  //  CruscottoPazienteComponent,
    ListaRefertiComponent,
    ListaPianiComponent,
    TabellaProdottiComponent,
    EditQuantitaComponent,
    ModalRinnovoComponent,
    MustComponent,
    ConcludiVisitaComponent,
    NewFormDietaComponent,
    ModalStoricoInviiComponent,
    FormRefertoComponent,
    ListaConclusioniPredefiniteComponent
  ],
  imports: [
    CommonModule, VisiteRoutingModule, DirectiveModule, SharedModule, PazientiModule, SharedModule,
    MaterialModule,
    FormsModule, ReactiveFormsModule,
    CalendarModule.forRoot({ provide: NativeDateAdapter }),

  ],

  entryComponents: [
    ModalDettaglioVisitaComponent, ProdottiFollowupComponent, //CruscottoPazienteComponent
  ],
  providers: [
    StatoVisitaCheckGuard
  ]
})
export class VisiteModule { }
