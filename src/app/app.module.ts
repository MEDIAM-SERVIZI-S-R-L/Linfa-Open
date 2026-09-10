import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MaterialModule } from './_core/material/material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppAuthModule } from './_core/app-auth/app-auth.module'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe, registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './_core/helpers/http-error.interceptor';
registerLocaleData(localeIt);
import localeIt from '@angular/common/locales/it';
import { AccessoEsternoModule } from './_module/accesso-esterno/accesso-esterno.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getItPaginatorIntl } from './_core/helpers/it-paginator-intl';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { ScrollService } from './_core/services/scroll.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DemomiscelaComponent } from './page/demomiscela/demomiscela.component';
import { ImportDatiComponent } from './_module/configurazioni/component/import-dati/import-dati/import-dati.component';
@NgModule({
  declarations: [
    AppComponent,
    DemomiscelaComponent,
  ],
  imports: [
    RouterModule,
    AppAuthModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AccessoEsternoModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgxExtendedPdfViewerModule,
     MatDatepickerModule,        // <----- import(must)
    MatNativeDateModule,        // <----- import for date formating(optional)
    MatMomentDateModule,         // <----- import for date formating adapted to more locales(optional)
    SweetAlert2Module.forRoot()
  ],
  exports: [
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgxExtendedPdfViewerModule,
    MatDatepickerModule,        // <----- import(must)
    MatNativeDateModule,        // <----- import for date formating(optional)
    MatMomentDateModule ,        // <----- import for date formating adapted to more locales(optional)

  ],
  entryComponents: [
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    ScrollService,

    // { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
    { provide: LOCALE_ID, useValue: "it-IT", },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },

    { provide: MatPaginatorIntl, useValue: getItPaginatorIntl() },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
