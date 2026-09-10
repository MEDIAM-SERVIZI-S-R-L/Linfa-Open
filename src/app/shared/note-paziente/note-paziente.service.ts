import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotePazienteService {

  @Output() change: EventEmitter<boolean> = new EventEmitter();

  update() {
    this.change.emit(true);
  }

}