import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ReactiveFormsModule, FormsModule } from '@angular/forms';


import { ProfiloComponent } from './component/profilo/profilo.component';
import { IndexComponent } from './page/index/index.component';
import { ProfiloRoutingModule } from './profilo-routing';
import { MaterialModule } from 'src/app/_core/material/material.module';



@NgModule({
  declarations: [
    IndexComponent,
    ProfiloComponent
  ],
  imports: [
    CommonModule, ProfiloRoutingModule, MaterialModule, ReactiveFormsModule,
    FormsModule
  ]
})
export class ProfiloModule { }
