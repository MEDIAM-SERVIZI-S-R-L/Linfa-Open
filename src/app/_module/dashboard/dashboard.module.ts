import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardRoutingModule } from './dashboard-routing';
import { IndexComponent } from './page/index/index.component';
import { CruscottoComponent } from './component/cruscotto/cruscotto.component';
import { MaterialModule } from 'src/app/_core/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [CruscottoComponent, IndexComponent],
 
  imports: [
    CommonModule, DashboardRoutingModule, MaterialModule, FormsModule, ReactiveFormsModule,SharedModule,


  ]
})
export class DashboardModule { }
