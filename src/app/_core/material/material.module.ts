import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxSliderModule } from '@m0t0r/ngx-slider';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgChartsModule } from 'ng2-charts';
import { IConfig, NgxMaskModule } from 'ngx-mask'
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [

  ],
  imports: [
    MatSidenavModule,
    MatProgressBarModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FlexLayoutModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatStepperModule,
    MatExpansionModule,
    MatDialogModule,
    MatTooltipModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatTabsModule,
    MatSlideToggleModule ,
    NgxSliderModule,
    NgxMatSelectSearchModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    LazyLoadImageModule, DragDropModule, AngularEditorModule,
    NgChartsModule,

    NgxMaskModule.forRoot(),
  ],
  exports: [
    MatSidenavModule,
    MatProgressBarModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FlexLayoutModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatStepperModule,
    MatExpansionModule,
    MatDialogModule,
    MatTooltipModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatSliderModule,
    MatChipsModule, MatAutocompleteModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatTabsModule,
    MatSlideToggleModule  ,
    NgxSliderModule,
    NgxMatSelectSearchModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    LazyLoadImageModule,
    DragDropModule, AngularEditorModule,
    NgChartsModule,

    NgxMaskModule
  ],
 // providers: [provideNgxMask()]
})
export class MaterialModule { }

