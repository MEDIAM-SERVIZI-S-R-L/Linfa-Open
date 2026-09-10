import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessoEsternoRoutingModule } from './accesso-esterno-routing'
import { IndexComponent } from './page/index/index.component';
import { MaterialModule } from 'src/app/_core/material/material.module';

@NgModule({
  declarations: [IndexComponent],
  imports: [
    CommonModule, AccessoEsternoRoutingModule,
    MaterialModule,
  ]
})
export class AccessoEsternoModule { }
