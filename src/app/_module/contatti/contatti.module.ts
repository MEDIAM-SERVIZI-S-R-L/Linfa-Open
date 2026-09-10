import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MaterialModule } from 'src/app/_core/material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContattiRoutingModule } from './Contatti-routing';


import { IndexComponent } from './page/index/index.component';
import { FormContattiComponent } from './component/form-contatti/form-contatti.component';



@NgModule({
  declarations: [
    IndexComponent,
    FormContattiComponent
  ],
  imports: [
    CommonModule, ContattiRoutingModule, MaterialModule, ReactiveFormsModule,
    FormsModule
  ]
})
export class ContattiModule { }
