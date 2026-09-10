import { LOCALE_ID, Inject, Injectable } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { DatePipe } from '@angular/common';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  // you can override any of the methods defined in the parent class

  month(event: any): string {
    return ` ${event.title} ${event.motivoEora} ${event.medico} ${event.tipoPrestazione} ${event.ambulatorio} ${event.indirizzoDomicilio == null? '': event.indirizzoDomicilio}`;

  }

  week(event: any): string {
    return ` ${event.title}`;
  }

  day(event: any): string {
    return ` ${event.title}`;
  }



  weekTooltip(event: any): string {
    return ` ${event.title} ${event.motivoEora} ${event.medico} ${event.tipoPrestazione} ${event.ambulatorio} ${event.indirizzoDomicilio == null? '': event.indirizzoDomicilio}`;
  }
  dayTooltip(event: any): string {
    return ` ${event.title}  ${event.motivoEora} ${event.medico} ${event.tipoPrestazione} ${event.ambulatorio} ${event.indirizzoDomicilio == null? '': event.indirizzoDomicilio}`;
  }
  monthTooltip(event: any): string {
    return ` ${event.title} ${event.motivoEora} ${event.medico} ${event.tipoPrestazione} ${event.ambulatorio} ${event.indirizzoDomicilio == null? '': event.indirizzoDomicilio}`;
  }
}
