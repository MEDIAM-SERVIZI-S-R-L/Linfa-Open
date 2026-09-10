import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StatoVisitaCheckGuard } from "src/app/_core/app-auth/service/auth.guard";

import { ListaRefertiComponent } from "./component/lista-referti/lista-referti.component";
import { ListaVisiteComponent } from "./component/lista-visite/lista-visite.component";
import { AnamnesiAlimentareComponent } from "./component/nutrizione/anamnesi-alimentare/anamnesi-alimentare.component";
import { ArtificialeComponent } from "./component/nutrizione/artificiale/artificiale.component";
import { FormDietaComponent } from "./component/nutrizione/naturale-mista/form-dieta/form-dieta.component";
import { ListaDieteComponent } from "./component/nutrizione/naturale-mista/lista-diete/lista-diete.component";
import { NewFormDietaComponent } from "./component/nutrizione/naturale-mista/new-form-dieta/new-form-dieta.component";
import { ListaPianiComponent } from "./component/nutrizione/piani-nutrizionali/lista-piani/lista-piani.component";
import { FormAllergiaComponent } from "./component/step-visita/anamnesi/allergie/form-allergia/form-allergia.component";
import { FormAnamnesiFamiliareComponent } from "./component/step-visita/anamnesi/anamnesi-familiare/form-anamnesi-familiare/form-anamnesi-familiare.component";
import { FormAnamnesiFisiologicaComponent } from "./component/step-visita/anamnesi/anamnesi-fisiologica/form-anamnesi-fisiologica/form-anamnesi-fisiologica.component";
import { FormAnamnesiPatologicaProssimaComponent } from "./component/step-visita/anamnesi/anamnesi-patologica-prossima/form-anamnesi-patologica-prossima/form-anamnesi-patologica-prossima.component";
import { FormAnamnesiPatologicaRemotaComponent } from "./component/step-visita/anamnesi/anamnesi-patologica-remota/form-anamnesi-patologica-remota/form-anamnesi-patologica-remota.component";
import { FormDipendenzaComponent } from "./component/step-visita/anamnesi/dipendenze/form-dipendenza/form-dipendenza.component";
import { FormFarmacoComponent } from "./component/step-visita/anamnesi/farmaci/form-farmaco/form-farmaco.component";
import { FormInterventoComponent } from "./component/step-visita/anamnesi/interventi/form-intervento/form-intervento.component";
import { FormPatologiaComponent } from "./component/step-visita/anamnesi/patologie/form-patologia/form-patologia.component";
import { PatologieComponent } from "./component/step-visita/anamnesi/patologie/patologie.component";
import { FormSportComponent } from "./component/step-visita/anamnesi/sport/form-sport/form-sport.component";
import { ValutazioneNutrizionaleComponent } from "./component/step-visita/valutazione-nutrizionale/valutazione-nutrizionale.component";
import { VisitaDomiciliareComponent } from "./component/visita-domiciliare/visita-domiciliare.component";
import { AnamnesiPazienteComponent } from "./page/anamnesi-paziente/anamnesi-paziente.component";
import { ConcludiVisitaComponent } from "./page/concludi-visita/concludi-visita.component";
import { DettaglioPianoComponent } from "./page/dettaglio-piano/dettaglio-piano.component";
import { FollowUpComponent } from "./page/follow-up/follow-up.component";
import { IndexComponent } from "./page/index/index.component";
import { MnaKarnofskyComponent } from "./page/mna-karnofsky/mna-karnofsky.component";
import { PageRouteComponent } from "./page/page-route/page-route.component";
import { PianiNutrizionaliComponent } from "./page/piani-nutrizionali/piani-nutrizionali.component";
import { RiepilogoComponent } from "./page/riepilogo/riepilogo.component";
import { StepRouteComponent } from "./page/step-route/step-route.component";
import { StoricoComponent } from "./page/storico/storico.component";

const routes: Routes = [

  {

    path: '',
    data: { title: 'Visite' },
    children: [
      {
        path: '',
        component: IndexComponent
      },
      {
        path: 'step', component: StepRouteComponent,
        data: { showBackBtn: false },
        // canActivate:[StatoVisitaCheckGuard],
        children: [
          { path: 'anamnesi/:id', component: AnamnesiPazienteComponent },
          { path: 'anamnesi-alimentare/:id', component: AnamnesiAlimentareComponent },
          { path: 'patologie/:id', component: PatologieComponent },
          { path: 'mna-karnofsky/:id', component: MnaKarnofskyComponent },
          { path: 'valutazione-nutrizionale/:id', component: ValutazioneNutrizionaleComponent },
          {

            path: 'conclusioni/:id', component: ConcludiVisitaComponent,
          },
          {

            path: 'riepilogo/:id', component: RiepilogoComponent
          },

          {
            path: 'piani-alimentari', component: PageRouteComponent,
            data: { showBackBtn: false },
            children: [
              { path: 'lista', component: ListaDieteComponent },
              { path: 'lista/:id', component: ListaDieteComponent },
              { path: 'nuovo', component: NewFormDietaComponent },
              { path: 'nuovo/new', component: NewFormDietaComponent },
              { path: 'nuovo/:id', component: NewFormDietaComponent },
              { path: 'dettaglio/new/:id', component: NewFormDietaComponent },
              { path: 'dettaglio/:id', component: NewFormDietaComponent },
              { path: 'dettaglio', component: NewFormDietaComponent },
            ]
          },
          {
            path: 'piani-nutrizionali', component: PianiNutrizionaliComponent,
            children: [
              { path: 'lista', component: ListaPianiComponent },
              { path: 'lista/:idpaziente', component: ListaPianiComponent },
              { path: 'dettaglio/:id', component: DettaglioPianoComponent }
            ]
          },    {
            path: 'nutrizione', component: PageRouteComponent,
            data: { showBackBtn: false },
            children: [
              { path: 'diete/:id', component: ListaDieteComponent },
              { path: 'artificiale/:id', component: ArtificialeComponent },
              { path: 'dieta/:idpaziente', component: FormDietaComponent },
            ]
          },
        ]
      },
      {
        path: 'nuova', component: PageRouteComponent,
        data: { showBackBtn: true },
        children: [
          { path: 'anamnesi-patologica-prossima/:idpaziente', component: FormAnamnesiPatologicaProssimaComponent },
          { path: 'anamnesi-patologica-remota/:idpaziente', component: FormAnamnesiPatologicaRemotaComponent },
          { path: 'anamnesi-fisiologica/:idpaziente', component: FormAnamnesiFisiologicaComponent },
          { path: 'anamnesi-familiare/:idpaziente', component: FormAnamnesiFamiliareComponent },
          { path: 'dipendenza/:idpaziente', component: FormDipendenzaComponent },
          { path: 'allergia/:idpaziente', component: FormAllergiaComponent },
          { path: 'attivita-motoria/:idpaziente', component: FormSportComponent },
          { path: 'farmaco/:idpaziente', component: FormFarmacoComponent },
          { path: 'intervento/:idpaziente', component: FormInterventoComponent },
          { path: 'patologia/:idpaziente', component: FormPatologiaComponent },
          { path: 'dieta', component: FormDietaComponent },
          { path: 'dieta/idpaziente', component: FormDietaComponent },

        ]
      },
      {
        path: 'lista', component: PageRouteComponent,
        data: { showBackBtn: true },
        children: [
          { path: 'visite', component: ListaVisiteComponent },
          { path: 'referti', component: ListaRefertiComponent },

        ]
      },
      {
        path: 'dettaglio', component: PageRouteComponent,
        data: { showBackBtn: true },
        children: [
          { path: 'anamnesi-patologica-prossima/:id', component: FormAnamnesiPatologicaProssimaComponent },
          { path: 'anamnesi-patologica-remota/:id', component: FormAnamnesiPatologicaRemotaComponent },
          { path: 'anamnesi-fisiologica/:id', component: FormAnamnesiFisiologicaComponent },
          { path: 'anamnesi-familiare/:id', component: FormAnamnesiFamiliareComponent },
          { path: 'dipendenza/:id', component: FormDipendenzaComponent },
          { path: 'allergia/:id', component: FormAllergiaComponent },
          { path: 'attivita-motoria/:id', component: FormSportComponent },
          { path: 'farmaco/:id', component: FormFarmacoComponent },
          { path: 'intervento/:id', component: FormInterventoComponent },
          { path: 'patologia/:id', component: FormPatologiaComponent },
        ]
      },
      //   { path: 'riepilogo/:id', component: RiepilogoComponent },
      { path: 'domiciliare/:id', component: VisitaDomiciliareComponent },
      { path: 'storico/:id', component: StoricoComponent },
      { path: 'followup/:id', component: FollowUpComponent },
//** Questi routing servono per vedere le diete fuori dalla visita (lista, creazione e la modifica della dieta)  */
          {
            path: 'piani-alimentari', component: PageRouteComponent,
            data: { showBackBtn: false },
            children: [
              { path: 'lista', component: ListaDieteComponent },
              { path: 'nuovo/new', component: NewFormDietaComponent},
              { path: 'dettaglio/new/:id', component: NewFormDietaComponent },
              { path: 'dettaglio', component: NewFormDietaComponent }
             /* { path: 'lista/:id', component: ListaDieteComponent },
              { path: 'nuovo', component: NewFormDietaComponent },

              { path: 'nuovo/:id', component: NewFormDietaComponent },

              { path: 'dettaglio/:id', component: NewFormDietaComponent },
              ,*/
            ]
          },
          {
            //** Questi routing servono per vedere le piani nutrizionali fuori dalla visita (lista, creazione e la modifica della dieta)  */
            path: 'piani-nutrizionali', component: PianiNutrizionaliComponent,
            children: [
              { path: 'lista', component: ListaPianiComponent },
          //    { path: 'lista/:idpaziente', component: ListaPianiComponent },
              { path: 'dettaglio/:id', component: DettaglioPianoComponent }
            ]
          },
      {
        path: 'new-form-dieta',
        component: NewFormDietaComponent
      },

      /*  {
          canActivate:[StatoVisitaCheckGuard],
          path: 'conclusioni/:id', component: ConcludiVisitaComponent,
        }*/
    ]
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],

  exports: [RouterModule]
})
export class VisiteRoutingModule { }
