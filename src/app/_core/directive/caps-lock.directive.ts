
import { EventEmitter, Output } from '@angular/core';
import { Directive, ElementRef, HostListener } from '@angular/core';


@Directive({
  selector: '[capsLock]'
})

export class TrackCapsDirective {

  constructor(private el: ElementRef) { }


  @Output('capsLock') capsLock = new EventEmitter<boolean>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.capsLock.emit(event.getModifierState && event.getModifierState('CapsLock'));
  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.capsLock.emit(event.getModifierState && event.getModifierState('CapsLock'));
  }


}
