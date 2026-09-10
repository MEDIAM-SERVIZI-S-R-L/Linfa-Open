import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLoginComponent } from './page/auth-login/auth-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AuthInterceptor} from './service/auth-interceptor'
import {  HTTP_INTERCEPTORS } from '@angular/common/http';
import {AuthGuard} from '../app-auth/service/auth.guard'
import {MaterialModule} from '../material/material.module'
import {AppAuthRoutingModule } from './app-auth-routing';
import { DirectiveModule } from "src/app/_core/directive/directive.module";

@NgModule({
  declarations: [ AuthLoginComponent],
  imports: [
    AppAuthRoutingModule,
    CommonModule,
    FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        DirectiveModule

  ],
  exports:[
    AuthLoginComponent,
  //  AuthGuardService
  ],
  providers:[
   // AuthGuardService,
   AuthGuard,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},

  ]

})
export class AppAuthModule { }
