import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarDateFormatter, CalendarDayViewBeforeRenderEvent, CalendarEvent, CalendarEventTitleFormatter, CalendarView, CalendarWeekViewBeforeRenderEvent, DAYS_OF_WEEK } from 'angular-calendar';
import { Subject } from 'rxjs';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { CustomDateFormatter } from 'src/app/_core/helpers/custom-date-formatter.provider';
import { CustomEventTitleFormatter } from 'src/app/_core/helpers/custom-title-formatter';
import { Ruoli, StatoVisita } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';
import { ModalDettaglioOrarioComponent } from 'src/app/shared/modal/modal-dettaglio-orario/modal-dettaglio-orario.component';
import { ModalPrenotaRichiestaComponent } from 'src/app/shared/modal/modal-prenota-richiesta/modal-prenota-richiesta.component';

const colors: any = {

  cancellata: {
    primary: '#8e2525',
    secondary: '#ff5858'
  },
  daIniziare: {
    primary: '#ffeb00',
    secondary: '#ffeb00'
  },
  effettuata: {
    primary: '#00afa6',
    secondary: '#00afa6'
  },
  daRefertare: {
    primary: '#86dc89',
    secondary: '#86dc89'
  },
  iniziata: {
    primary: '#726905',
    secondary: '#726905'
  }
};
const colorsRichieste: any = {

  cancellata: {
    primary: '#8e2525',
    secondary: '#ff5858'
  },
  daAccettare: {
    primary: '#ffeb00',
    secondary: '#ffeb00'
  },
  // terminata: {
  //   primary: '#00afa6',
  //   secondary: '#00afa6'
  // },
  accettata: {
    primary: '#86dc89',
    secondary: '#86dc89'
  },
};


@Component({
  selector: 'app-calendario-disponibilita',
  templateUrl: './calendario-disponibilita.component.html',
  styleUrls: ['./calendario-disponibilita.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ]
})
export class CalendarioDisponibilitaComponent implements OnInit {


  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  JSONMonthlyEvents: any;

  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;
  locale = 'it';

  viewDate: Date = new Date();
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  refresh: Subject<any> = new Subject();
  events = [];//: CalendarEvent[] = [];

  queryParams: any = {};
  activeDayIsOpen = false;
  @Output() emitRichiestaControllo = new EventEmitter();

  minDate: Date = new Date();
  formFiltroCalendario: FormGroup;

  listaMedici
  listaAmbulatori

  @Input() calendarioRichieste;
  @Input() fromRiepilogoVisita;


  idpaziente
  idVisita
  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
    private router: Router,
    public authGuard: AuthGuard
  ) { }

  ngOnInit() {
    this.formFiltroCalendario = this.formBuilder.group({
      medico: new FormControl(''),
      ambulatorio: new FormControl(''),
    });

    this.idpaziente = this.activateRoute.snapshot.paramMap.get('id');

    this.activateRoute.queryParams.subscribe(params => {
      if (!this.appGen.isNullOrUndefined(params)) {
        this.idVisita = params.visit;
      }
    });



    this.getListaAmbulatori();
    this.getListaMedici();

    this.GetEventCalendar(new Date())
  }

  async getListaAmbulatori() {
    await this.service.getCallRequest({ action: 'ambulatori' }).then(data => {
      this.listaAmbulatori = data;
    });
  }

  async getListaMedici() {
    const obj = {
      tipoUtente: Ruoli.Medico
    }

    await this.service.postCallRequest({ action: 'getUtenti', param: obj }).then(data => {
      this.listaMedici = data;
    });
  }

  async GetEventCalendar(date) {
    this.JSONMonthlyEvents = [];

    this.JSONMonthlyEvents = [];

    let obj = new Object();
    obj = {
      Date: date,
      IdMedico: this.formFiltroCalendario.get('medico').value,
      IdAmbulatorio: this.formFiltroCalendario.get('ambulatorio').value,
      View: this.view
    };

    if (this.calendarioRichieste) {


      await this.service.postCallRequest({ action: 'getListCalendarioRichieste', param: obj }).then((data) => {
        this.events = [];
        this.JSONMonthlyEvents = data;
        this.setMonthlyEvents();
      });

    } else {


      await this.service.postCallRequest({ action: 'getListCalendario', param: obj }).then((data) => {
        this.events = [];
        this.JSONMonthlyEvents = data;
        this.setMonthlyEvents();
      });

    }
  }

  search() {
    this.GetEventCalendar(new Date()).then(() => {
      // setTimeout(() => {
      //   document.querySelector('.' + 'cal-current-time-marker').scrollIntoView({ behavior: 'smooth', block: 'center' });
      // }, 0);
    });
  }

  clearSearch() {
    this.formFiltroCalendario.reset();
    this.GetEventCalendar(new Date()).then(() => {
      // setTimeout(() => {
      //   document.querySelector('.' + 'cal-current-time-marker').scrollIntoView({ behavior: 'smooth', block: 'center' });
      // }, 0);
    });
  }

  async handleEvent(event, view, viewDate) {

    const dialogRef = this.dialog.open(ModalDettaglioOrarioComponent, {
      panelClass: "modal-custom"
    });

    dialogRef.afterClosed().subscribe((async (dialogResult) => {
      if (dialogResult == 1) {//selezionato orario corrente
        this.setHour(event.event.start, viewDate);
      }

      if (dialogResult == 2) {
        if (event.event.statoVisita == StatoVisita.Cancellata) {
          return;
        }

        if (this.calendarioRichieste) {
          this.router.navigate(['app/richieste/dettaglio/richiesta', event.event.idRichiesta]);
        }
      }


    })
    )




  }

  private setMonthlyEvents() {
    this.JSONMonthlyEvents.lstDetails.forEach(element => {


      const oraPrestazione = new Date(element.dataPrestazione).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
      const oraFinePrestazione = new Date(element.dataFinePrestazione).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });


      this.events.push({

        title: '<strong class="patientViewCapitalize">' + element.paziente + "</strong> ", // + "<br> " +"<strong>Motivo: </strong>"+ element.motivoRichiesta + "<br> <strong>Orario: </strong> " + oraPrestazione + " - " + oraFinePrestazione,
        // title: element.paziente + "<br> " + element.motivoRichiesta + ", " + oraPrestazione + " - " + oraFinePrestazione,
        start: new Date(element.dataPrestazione),
        end: new Date(element.dataFinePrestazione),
        color: this.calendarioRichieste ? this.GetEventColorRichieste(element.statoVisita) : this.GetEventColor(element.statoVisita),
        idPaziente: element.idPaziente,
        idRichiesta: element.idRichiesta,
        cf: element.cf,
        stato: element.statoVisita,
        statoVisita: element.statoVisita,
        cssClass: 'my-custom-class',
        motivoEora: "<br> " + "<strong>Motivo: </strong>" + element.motivoRichiesta + "<br> <strong>Orario: </strong> " + oraPrestazione + " - " + oraFinePrestazione,
        medico: "<br> " + "<strong>Medico: </strong>" + element.medico,
        tipoPrestazione: "<br> " + "<strong>Prestazione: </strong>" + element.tipoPrestazione,
        idTipoPrestazione: element.idTipoPrestazione,
        idVisitaPrecedente: element.idVisitaPrecedente,
        indirizzoDomicilio: element.indirizzoDomicilio,
        ambulatorio: "<br> " + "<strong>" + element.ambulatorio + " </strong>",
        meta: {
          type: element.statoVisita,
        },
      });

      this.refresh.next(null);
    });
  }




  groupedSimilarEvents;


  GetEventColor(type) {
    switch (type) {
      case 99: return colors.cancellata;
      case 20: return colors.daIniziare;
      case 25: return colors.iniziata;
      case 30: return colors.daRefertare;
      case 35: return colors.Terminata;
      default: return colors.Terminata;
    }
  }
  GetEventColorRichieste(type) {
    switch (type) {
      case 5: return colorsRichieste.daAccettare;
      case 10: return colorsRichieste.accettata;
      case 15: return colorsRichieste.accettata;
      case 99: return colorsRichieste.cancellata;
      default: return colorsRichieste.cancellata;
    }
  }


  setView(view: CalendarView) {
    this.view = view;
    this.GetEventCalendar(this.viewDate);
  }

  closeOpenMonthViewDay(evt) {
    this.activeDayIsOpen = false;
    this.GetEventCalendar(evt);
  }

  hourSegmentModifier(segment) {
    if (segment.date.getHours() < new Date()) {
      segment.cssClass = 'cal-day-segment-disabled';
    }
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate;
  }


  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          if (!this.dateIsValid(segment.date)) {
            segment.cssClass = 'cal-disabled';
          }
        });
      });
    });
  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          if (!this.dateIsValid(segment.date)) {
            segment.cssClass = 'cal-disabled';
          }
        });
      });
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (
      (this.activeDayIsOpen === true) ||
      events.length === 0
    ) {
      this.activeDayIsOpen = false;
    } else {
      this.activeDayIsOpen = true;
    }
    this.viewDate = date;
  }

  async setHour(date, viewDate?) {


    if (date <= this.appGen.today) {
      return;
    }


    const message = `Vuoi selezionare il seguente orario per la prossima visita? <br> <strong>` + new Date(date).toLocaleString() + '</strong>';
    const dialogData = new ConfirmDialogModel("Attenzione!", message);
    debugger;
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data: dialogData,
      panelClass: "modal-custom"

    });


    dialogRef.afterClosed().subscribe(await (dialogResult => {
      if (dialogResult) {

        this.openModalPrenotaRichiesta(date, viewDate, this.fromRiepilogoVisita)

      }
    }));

  }

  openModalPrenotaRichiesta(date, viewDate, fromRiepilogoVisita?) {

    const data = {
      dataPrestazione: date,
      fromRiepilogoVisita: fromRiepilogoVisita,
      idPaziente: this.idpaziente,
      idVisita: this.idVisita
    }
    const modalRichiesta = this.dialog.open(ModalPrenotaRichiestaComponent, {
      data: data,
      height:'95%',
      panelClass: !this.fromRiepilogoVisita ? "modal-prenota-richieste" : "modal-prenota-controllo"
    });
    modalRichiesta.afterClosed().subscribe((dialogResult => {
      if (dialogResult) {
        this.GetEventCalendar(new Date(viewDate));

        this.emitRichiestaControllo.emit()

      }

    }))
  }

}
