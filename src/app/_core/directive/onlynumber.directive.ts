
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import {

  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { AppGeneralService } from 'src/app/_core/services/app-general.service';
@Directive({
  selector: '[OnlyNumber]'
})
export class OnlyNumber {

  constructor(private el: ElementRef) { }

  @Input() OnlyNumber: boolean;

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent>event;
    var key = event.keyCode;

    if (this.OnlyNumber) {
      if ([46, 8, 9, 27, 13, 110, 107].indexOf(key) !== -1 ||
        // Allow: Ctrl+A
        (key == 65 && e.ctrlKey === true) ||
        (key == 190) ||
        // (key == 188 ) ||
        // Allow: Ctrl+C
        (key == 67 && e.ctrlKey === true) ||
        (key == 111) ||
        // Allow: Ctrl+X
        (key == 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        // (key == 86 && e.ctrlKey === true) ||
        // Allow Copy and Past
        (key >= 35 && key <= 39)) {
        // let it happen, don't do anything
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (key < 48 || key > 57)) && (key < 96 || key > 105)) {
        e.preventDefault();
      }
    }
  }



}




@Directive({
  selector: '[digitOnly]',
})
export class DigitOnlyDirective implements OnChanges {
  private hasDecimalPoint = false;
  private hasNegativeSign = false;
  private navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste',
  ];

  @Input() decimal = false;
  @Input() decimalSeparator = '.';
  @Input() allowNegatives = false;
  @Input() allowPaste = false;
  @Input() negativeSign = '-';
  @Input() min = -Infinity;
  @Input() max = Infinity;
  @Input() pattern?: string | RegExp;
  private regex: RegExp | null = null;
  inputElement: HTMLInputElement;

  constructor(public el: ElementRef,
    public appGen: AppGeneralService,
    ) {
    this.inputElement = el.nativeElement;

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pattern']) {
      this.regex = this.pattern ? RegExp(this.pattern) : null;
    }

    if (changes['min']) {
      const maybeMin = Number(this.min);
      this.min = isNaN(maybeMin) ? -Infinity : maybeMin;
    }

    if (changes['max']) {
      const maybeMax = Number(this.max);
      this.max = isNaN(maybeMax) ? Infinity : maybeMax;
    }
  }

  @HostListener('beforeinput', ['$event'])
  onBeforeInput(e: InputEvent): any {
    if (isNaN(Number(e.data))) {
      if (
        e.data === this.decimalSeparator ||
        (e.data === this.negativeSign && this.allowNegatives)
      ) {
        return; // go on
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): any {
    if (
      this.navigationKeys.indexOf(e.key) > -1 || // Allow: navigation keys: backspace, delete, arrows etc.
      ((e.key === 'a' || e.code === 'KeyA') && e.ctrlKey === true) || // Allow: Ctrl+A
      ((e.key === 'c' || e.code === 'KeyC') && e.ctrlKey === true) || // Allow: Ctrl+C
      ((e.key === 'v' || e.code === 'KeyV') && e.ctrlKey === true) || // Allow: Ctrl+V
      ((e.key === 'x' || e.code === 'KeyX') && e.ctrlKey === true) || // Allow: Ctrl+X
      ((e.key === 'a' || e.code === 'KeyA') && e.metaKey === true) || // Allow: Cmd+A (Mac)
      ((e.key === 'c' || e.code === 'KeyC') && e.metaKey === true) || // Allow: Cmd+C (Mac)
      ((e.key === 'v' || e.code === 'KeyV') && e.metaKey === true) || // Allow: Cmd+V (Mac)
      ((e.key === 'x' || e.code === 'KeyX') && e.metaKey === true) // Allow: Cmd+X (Mac)
    ) {
      // let it happen, don't do anything
      return;
    }

    let newValue = '';

    if(!this.decimal){
      if(e.key=='.' || e.key==',')
      {

        this.appGen.notificate.warning("Numeri decimali sono stati disattivati per questo campo");
      }
    }
    if (this.decimal && e.key === this.decimalSeparator) {
      newValue = this.forecastValue(e.key);
      if (newValue.split(this.decimalSeparator).length > 2) {
        // has two or more decimal points
        e.preventDefault();
        return;
      } else {
        this.hasDecimalPoint = newValue.indexOf(this.decimalSeparator) > -1;
        return; // Allow: only one decimal point
      }
    }

    if (e.key === this.negativeSign && this.allowNegatives) {
      newValue = this.forecastValue(e.key);
      if (
        newValue.charAt(0) !== this.negativeSign ||
        newValue.split(this.negativeSign).length > 2
      ) {
        e.preventDefault();
        return;
      } else {
        this.hasNegativeSign = newValue.split(this.negativeSign).length > -1;
        return;
      }
    }

    // Ensure that it is a number and stop the keypress
    if (e.key === ' ' || isNaN(Number(e.key))) {
      e.preventDefault();
      return;
    }

    newValue = newValue || this.forecastValue(e.key);
    // check the input pattern RegExp
    if (this.regex) {
      if (!this.regex.test(newValue)) {
        e.preventDefault();
        return;
      }
    }

    const newNumber = Number(newValue);
    if (newNumber > this.max || newNumber < this.min) {
      e.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: any): void {
    if (this.allowPaste === true) {
      let pastedInput: string = '';
      if ((window as { [key: string]: any })['clipboardData']) {
        // Browser is IE
        pastedInput = (window as { [key: string]: any })[
          'clipboardData'
        ].getData('text');
      } else if (event.clipboardData && event.clipboardData.getData) {
        // Other browsers
        pastedInput = event.clipboardData.getData('text/plain');
      }

      this.pasteData(pastedInput);
      event.preventDefault();
    } else {
      this.appGen.notificate.warning("Copia e incolla disattivato per questo campo")
      // this prevents the paste
      event.preventDefault();
      event.stopPropagation();
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    const textData = event.dataTransfer?.getData('text') ?? '';
    this.inputElement.focus();
     this.pasteData(textData);
    event.preventDefault();
  }

  private pasteData(pastedContent: string): void {
    const sanitizedContent = this.sanitizeInput(pastedContent);
    if (
      sanitizedContent.includes(this.negativeSign) &&
      this.hasNegativeSign &&
      !this.getSelection().includes(this.negativeSign)
    ) {
      return;
    }
    const pasted = document.execCommand('insertText', false, sanitizedContent);
    if (!pasted) {
      if (this.inputElement.setRangeText) {
        const { selectionStart: start, selectionEnd: end } = this.inputElement;
        this.inputElement.setRangeText(
          sanitizedContent,
          start ?? 0,
          end ?? 0,
          'end'
        );
        // Angular's Reactive Form relies on "input" event, but on Firefox, the setRangeText method doesn't trigger it
        // so we have to trigger it ourself.
        if (
          typeof (window as { [key: string]: any })['InstallTrigger'] !==
          'undefined'
        ) {
          this.inputElement.dispatchEvent(
            new Event('input', { cancelable: true })
          );
        }
      } else {
        // Browser does not support setRangeText, e.g. IE
        this.insertAtCursor(this.inputElement, sanitizedContent);
      }
    }
    if (this.decimal) {
      this.hasDecimalPoint =
        this.inputElement.value.indexOf(this.decimalSeparator) > -1;
    }
    this.hasNegativeSign =
      this.inputElement.value.indexOf(this.negativeSign) > -1;
  }

  // The following 2 methods were added from the below article for browsers that do not support setRangeText
  // https://stackoverflow.com/questions/11076975/how-to-insert-text-into-the-textarea-at-the-current-cursor-position
  private insertAtCursor(myField: HTMLInputElement, myValue: string): void {
    const startPos = myField.selectionStart ?? 0;
    const endPos = myField.selectionEnd ?? 0;

    myField.value =
      myField.value.substring(0, startPos) +
      myValue +
      myField.value.substring(endPos, myField.value.length);

    const pos = startPos + myValue.length;
    myField.focus();
    myField.setSelectionRange(pos, pos);

    this.triggerEvent(myField, 'input');
  }

  private triggerEvent(el: HTMLInputElement, type: string): void {
    if ('createEvent' in document) {
      // modern browsers, IE9+
      const e = document.createEvent('HTMLEvents');
      e.initEvent(type, false, true);
      el.dispatchEvent(e);
    }
  }
  // end stack overflow code

  private sanitizeInput(input: string): string {
    let result = '';
    let regex;
      if (this.decimal && this.isValidDecimal(input)) {
      regex = new RegExp(
        `${this.getNegativeSignRegExp()}[^0-9${this.decimalSeparator}]`,
        'g'
      );
    } else {
      regex = new RegExp(`${this.getNegativeSignRegExp()}[^0-9]`, 'g');
    }
    result = input.replace(regex, '');

    const maxLength = this.inputElement.maxLength;
    if (maxLength > 0 && result.length >maxLength) {
      // the input element has maxLength limit

      result =  result.substring(0, maxLength)

    }
    return result;
  }

  private getNegativeSignRegExp(): string {
    return this.allowNegatives &&
      (!this.hasNegativeSign || this.getSelection().includes(this.negativeSign))
      ? `(?!^${this.negativeSign})`
      : '';
  }

  private isValidDecimal(string: string): boolean {
    if (!this.hasDecimalPoint) {
      return string.split(this.decimalSeparator).length <= 2;
    } else {
      // the input element already has a decimal separator
      const selectedText = this.getSelection();
      if (selectedText && selectedText.indexOf(this.decimalSeparator) > -1) {
        return string.split(this.decimalSeparator).length <= 2;
      } else {
        return string.indexOf(this.decimalSeparator) < 0;
      }
    }
  }

  private getSelection(): string {
    return this.inputElement.value.substring(
      this.inputElement.selectionStart ?? 0,
      this.inputElement.selectionEnd ?? 0
    );
  }

  private forecastValue(key: string): string {
    const selectionStart = this.inputElement.selectionStart ?? 0;
    const selectionEnd = this.inputElement.selectionEnd ?? 0;
    const oldValue = this.inputElement.value;
    return (
      oldValue.substring(0, selectionStart) +
      key +
      oldValue.substring(selectionEnd)
    );
  }
}
