import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NativeDateAdapter } from "@angular/material/core";
import { CalendarModule } from "angular-calendar";
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from "src/app/shared/shared.module";
import { DirectiveModule } from "src/app/_core/directive/directive.module";
import { MaterialModule } from "src/app/_core/material/material.module";
import { AnamnesiPatologicaProssimaComponent } from "./component/anamnesi-patologica-prossima/anamnesi-patologica-prossima.component";
import { PazientiComponent } from "./component/pazienti/pazienti.component";
import { TipoPrestazioneComponent } from "./component/visite/tipo-prestazione/tipo-prestazione.component";
import { IndexComponent } from "./page/index/index.component";
import { StatisticheRoutingModule } from "./statistiche-routing";
import { TabsComponent } from './component/tabs/tabs.component';
import { WidgetComponent } from './component/widget/widget.component';


@NgModule({
  declarations: [
  IndexComponent, AnamnesiPatologicaProssimaComponent,PazientiComponent,TipoPrestazioneComponent, TabsComponent, WidgetComponent
  ],
  imports: [
    CommonModule, StatisticheRoutingModule, DirectiveModule, SharedModule,
    MaterialModule,
    FormsModule, ReactiveFormsModule,
    CalendarModule.forRoot({ provide: NativeDateAdapter }),

  ],
  providers: [
  ]
})
export class StatisticheModule { }
