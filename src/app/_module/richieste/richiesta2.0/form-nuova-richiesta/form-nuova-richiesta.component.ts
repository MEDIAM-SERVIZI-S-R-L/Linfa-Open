import { Component, OnInit } from '@angular/core';
import { CalendarView, CalendarEvent, CalendarDateFormatter, DAYS_OF_WEEK, CalendarEventTitleFormatter, CalendarDayViewBeforeRenderEvent, CalendarWeekViewBeforeRenderEvent } from 'angular-calendar';
@Component({
  selector: 'app-form-nuova-richiesta',
  templateUrl: './form-nuova-richiesta.component.html',
  styleUrls: ['./form-nuova-richiesta.component.scss']
})
export class FormNuovaRichiestaComponent implements OnInit {
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;   // inizio della settimana nel calendario
  weekEndOn: number = DAYS_OF_WEEK.FRIDAY
  viewDate = new Date();
  constructor() { }

  ngOnInit(): void {
  }

}
