import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarDateFormatter, CalendarEvent, CalendarEventTitleFormatter, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { Subject } from 'rxjs';
import { AuthGuard } from 'src/app/_core/app-auth/service/auth.guard';
import { CustomDateFormatter } from 'src/app/_core/helpers/custom-date-formatter.provider';
import { CustomEventTitleFormatter } from 'src/app/_core/helpers/custom-title-formatter';
import { Ruoli, StatoVisita, TipoPrestazione } from 'src/app/_core/helpers/enums';
import { AppGeneralService } from 'src/app/_core/services/app-general.service';
import { HttpSharedService } from 'src/app/_core/services/http-shared.service';
import { ConfirmDialogModel, ModalConfirmComponent } from 'src/app/shared/modal/modal-confirm/modal-confirm.component';

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

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
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



export class CalendarioComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  JSONMonthlyEvents: any;

  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;
  locale = 'it';


  tipoUtente = Ruoli;


  viewDate = new Date();
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  refresh: Subject<any> = new Subject();
  events = [];//: CalendarEvent[] = [];
  listaAmbulatori;
  listaMedici;
  queryParams: any = {};
  activeDayIsOpen = false;
  sessionParam: any;
  showListaVisite = false;
  isFromDashboard = false;

  statoVisita = StatoVisita
  tipoPrestazione = TipoPrestazione
  formFiltroCalendario: FormGroup;

  constructor(
    private service: HttpSharedService,
    public appGen: AppGeneralService,
    public authGuard: AuthGuard,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    ////if che serve a fare un redirect in quanto per vedere i piani nutrizionali serve avere anche il rmesso delle visite,
    ////in questo modo l'utente farmacista non è possibilitato a vedere mai le visite
    if(this.authGuard.canRole(Ruoli.FarmaciaOspedaliera)){
      this.router.navigate(['app/visite/piani-nutrizionali/lista'])
    }
    
    this.formFiltroCalendario = this.formBuilder.group({
      medico: new FormControl(''),
      ambulatorio: new FormControl(''),
    });

    this.GetEventCalendar(new Date());


    const retrievedObjectFromPaziente = sessionStorage.getItem('dettaglioStoricoPaziente');
    if (!(this.appGen.isNullOrUndefined(retrievedObjectFromPaziente))) {
      this.sessionParam = JSON.parse(retrievedObjectFromPaziente);
    }
    if (!(this.appGen.isNullOrUndefined(this.sessionParam))) {

      if (!(this.appGen.isNullOrUndefined(this.sessionParam.view))) {
        this.view = this.sessionParam.view;
      }
      if (!(this.appGen.isNullOrUndefined(this.sessionParam.viewDate))) {
        this.viewDate = new Date(this.sessionParam.viewDate);
        this.activeDayIsOpen = true;
      }

    }

    this.activateRoute.queryParams.subscribe(params => {

      if (!(this.appGen.isNullOrUndefined(params.query))) {
        this.showListaVisite = true;
        this.isFromDashboard = true;
      }
    });

    this.getListaAmbulatori();
    this.getListaMedici();
  }

  backToPrevious() {
    this.router.navigate(['app/dashboard'])

  }

  ngAfterViewInit(): void {

    sessionStorage.removeItem('dettaglioStoricoPaziente');
    sessionStorage.removeItem('ricercaParamPaziente');
  }

  async getListaAmbulatori(): Promise<void> {
    await this.service.getCallRequest({ action: 'ambulatori' }).then(data => {
      this.listaAmbulatori = data;
    });
  }

  async getListaMedici(): Promise<void> {
    const params = {
      tipoUtente: this.tipoUtente.Medico
    }
    const objRequest = {
      action: 'getUtenti',
      param: params
    }
    await this.service.postCallRequest(objRequest).then(data => {
      this.listaMedici = data;
    });
  }

  async GetEventCalendar(date): Promise<void> {
    this.JSONMonthlyEvents = [];

    const params = {
      Date: date,
      IdMedico: this.formFiltroCalendario.get('medico').value,
      IdAmbulatorio: this.formFiltroCalendario.get('ambulatorio').value,
      View: this.view
    };

    const objRequest = {
      action: 'getListCalendario',
      param: params
    }

    await this.service.postCallRequest(objRequest).then((data) => {
      this.events = [];
      this.JSONMonthlyEvents = data;
      this.setMonthlyEvents();
    });
  }


  private setMonthlyEvents(): void {

    this.JSONMonthlyEvents.lstDetails.forEach(element => {
      const oraPrestazione = new Date(element.dataPrestazione).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
      const oraFinePrestazione = new Date(element.dataFinePrestazione).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
      this.events.push({
        title: '<strong class="patientViewCapitalize">' + element.paziente + "</strong> ", // + "<br> " +"<strong>Motivo: </strong>"+ element.motivoRichiesta + "<br> <strong>Orario: </strong> " + oraPrestazione + " - " + oraFinePrestazione,
        // title: element.paziente + "<br> " + element.motivoRichiesta + ", " + oraPrestazione + " - " + oraFinePrestazione,
        start: new Date(element.dataPrestazione),
        end: new Date(element.dataFinePrestazione),
        color: this.GetEventColor(element.statoVisita),
        idPaziente: element.idPaziente,
        idVisita: element.idVisita,
        cf: element.cf,
        stato: element.statoVisita,
        statoVisita: element.statoVisita,
        cssClass: 'my-custom-class',
        // motivoEora: "<br> " + "<strong>Motivo: </strong>" + element.motivoRichiesta + "<br> <strong>Orario: </strong> " + oraPrestazione + " - " + oraFinePrestazione,
        motivoEora: "<br> <strong>Orario: </strong> " + oraPrestazione + " - " + oraFinePrestazione,
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

  beforeMonthViewRender({
    body,
  }: {
    body: any[];
  }): void {
    // month view has a different UX from the week and day view so we only really need to group by the type
    body.forEach((cell) => {
      const groups = {};
      cell.events.forEach((event: any) => {
        groups[event.meta.type] = groups[event.meta.type] || [];
        groups[event.meta.type].push(event);
        //
      });
      cell['eventGroups'] = Object.entries(groups);
    });
  }

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


  setView(view: CalendarView) {
    this.view = view;
    this.GetEventCalendar(this.viewDate);
  }

  closeOpenMonthViewDay(evt) {
    this.activeDayIsOpen = false;
    this.GetEventCalendar(evt);

  }

  async handleEvent(event, view, viewDate) {  

    if (event.statoVisita == this.statoVisita.Cancellata) {
      return;
    }

    if (event.statoVisita == this.statoVisita.DaRefertare && !this.authGuard.canAccess(this.appGen.permesso.ConcludiVisita)) {
      return;
    }

    let message = "Vuoi iniziare la visita per "
    const dataCliccata = event.start;//.setHours(0, 0, 0, 0)
    const dataCorrente = this.appGen;//.today.setHours(0, 0, 0, 0)

    if (dataCliccata > dataCorrente) {
      //se non ha il permesso di forzare la visita allora lo blocco, altrimenti lo avviso e chiedo conferma
      if (!this.authGuard.canAccess(this.appGen.permesso.ForzaInizioVisita)) {
        this.appGen.notificate.warning("Non è possibile iniziare una visita con data futura")
        return;
      } else {
        message = "La visita è in una data successiva a quella corrente. Vuoi comunque iniziare la visita per "
      }
    }

    const objRequest = {
      action: 'checkVisiteIniziate',
      param: event.idVisita
    }
    await this.service.getCallRequest(objRequest);


    let dialogData;
    let dialogRef;
    
    switch (event.statoVisita) {
      case this.statoVisita.Cancellata:
        return;
      case this.statoVisita.DaIniziare:
      
        dialogData = new ConfirmDialogModel("Attenzione!" , message + event.title + event.motivoEora + event.medico + event.tipoPrestazione + event.ambulatorio + (this.appGen.isNullOrUndefined(event.indirizzoDomicilio) ? "" : event.indirizzoDomicilio));
        dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {

            if (event.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', event.idPaziente], { queryParams: { visit: event.idVisitaPrecedente, currentvisit: event.idVisita, domiciliare: true } })
            } else {
              this.router.navigate(['/app/pazienti/step/paziente', event.idPaziente], { queryParams: { visit: event.idVisita } })
            }
          }
        }));
        break;
      case this.statoVisita.Iniziata:

        //controllo se per la visita è già stata iniziata la compilazione, e verifico che sia stato già scelto il tipo di alimentazione

        dialogData = new ConfirmDialogModel("Attenzione!" , "La visita è già stata iniziata, vuoi continuare la compilazione? " + event.motivoEora + event.medico + event.tipoPrestazione + event.ambulatorio ) ;
        dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"
        });

        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            if (event.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
              this.router.navigate(['/app/visite/domiciliare', event.idPaziente], { queryParams: { visit: event.idVisitaPrecedente, currentvisit: event.idVisita, domiciliare: true } })

            } else {

              this.router.navigate(['/app/visite/step/anamnesi', event.idPaziente], { queryParams: { visit: event.idVisita } })
            }
          }
        }));
        break;
      case this.statoVisita.DaRefertare:
        dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi refertare la visita di " + '<strong class="patientViewCapitalize">' + event.title + "</strong> ");
        dialogRef = this.dialog.open(ModalConfirmComponent, {
          data: dialogData,
          panelClass: "modal-custom"

        });
        dialogRef.afterClosed().subscribe((dialogResult => {
          if (dialogResult) {
            this.router.navigate(['/app/visite/step/anamnesi', event.idPaziente], { queryParams: { visit: event.idVisita } })
          }
        }));
        break;

      default:

        if (event.statoVisita == this.statoVisita.Terminata || event.statoVisita == this.statoVisita.Firmata) {

          dialogData = new ConfirmDialogModel("Attenzione!", "Vuoi visualizzare il dettaglio della visita di  " + event.title + event.motivoEora + event.medico + event.tipoPrestazione + event.ambulatorio);

          dialogRef = this.dialog.open(ModalConfirmComponent, {
            data: dialogData,
            panelClass: "modal-custom"

          });
          dialogRef.afterClosed().subscribe((dialogResult => {
            if (dialogResult) {
              if (event.idTipoPrestazione == this.tipoPrestazione.VisitaDomicilio1) {
                this.router.navigate(['/app/visite/domiciliare', event.idPaziente], { queryParams: { visit: event.idVisitaPrecedente, currentvisit: event.idVisita, domiciliare: true } })
              } else {
                this.createParams(event, view, viewDate)
                sessionStorage.setItem('dettaglioStoricoPaziente', JSON.stringify(this.queryParams));
                this.router.navigate(['/app/visite/storico', event.idPaziente], { queryParams: { visit: event.idVisita } })

              }
            }
          }));
        }
        break;
    }

  }


  createParams(event, view, viewDate) {
    if (!(event.idPaziente === null || event.idPaziente === undefined)) {
      this.queryParams.idPaziente = event.idPaziente;
    }
    if (!(event.idVisita === null || event.idVisita === undefined)) {
      this.queryParams.idVisita = event.idVisita;
    }
    const dataVisita = new Date(event.end);
    if (dataVisita < this.appGen.today) {
      //si tratta di una visita già effettuata
      this.queryParams.isDettaglioVisita = true;
    } else {
      this.queryParams.isDettaglioVisita = false;
    }

    this.queryParams.fromStorico = false;
    this.queryParams.view = view;
    this.queryParams.start = event.start
    this.queryParams.viewDate = viewDate;
  }

  search() {
    this.GetEventCalendar(new Date())
  }

  clearSearch() {
    this.formFiltroCalendario.reset();
    this.GetEventCalendar(new Date())
  }

  showVisite() {
    this.showListaVisite = !this.showListaVisite;
  }
}
