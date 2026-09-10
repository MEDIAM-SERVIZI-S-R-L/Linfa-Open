import { Directive, HostListener, OnDestroy, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[DecimalFormatter]'
})
export class DecimalFormatterDirective implements OnDestroy {


  private formatter: Intl.NumberFormat;
  private destroy$ = new Subject();

  constructor(@Self() private ngControl: NgControl) {


    this.formatter = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });
  }

  ngAfterViewInit() {
    this.setValue(this.formatPrice(this.ngControl.value))
    this.ngControl
      .control
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.updateValue.bind(this));
  }

  updateValue(value) {

    let inputVal = value || '';
   //inputVal = inputVal ? inputVal.toString().replace(/,/g, '.') : '';
    this.setValue(inputVal ?
      this.validateDecimalValue(inputVal.toString().replace(/[^0-9.]/g, '')) : '');
    // this.validateDecimalValue(inputVal.replace(/[^0-9.]/g, '')) : '');
  }

  @HostListener('focus') onFocus() {
    if (this.ngControl.value) {
      this.setValue(this.unformatValue(this.ngControl.value));
    }
  }

  @HostListener('blur') onBlur() {
    const value = this.ngControl.value || '';
    !!value && this.setValue(this.formatPrice(value));
  }

  formatPrice(v) {
    if (v === undefined || v === '') {
      return;
    }
    if (Number.isInteger(v)) {
      return this.formatter.format(v);

    }
    return v;
  }

  unformatValue(v) {
    if (v === undefined || v === '') {
      return;
    }
    return v//.replace(/,/g, '');
  }

  validateDecimalValue(v) {
    // Check to see if the value is a valid number or not
    if (Number.isNaN(Number(v))) {
      // strip out last char as this would have made the value invalid
      const strippedValue = v.slice(0, v.length - 1);

      // if value is still invalid, then this would be copy/paste scenario
      // and in such case we simply set the value to empty
      return Number.isNaN(Number(strippedValue)) ? '' : strippedValue;
    }
    return v;
  }

  setValue(v) {
    this.ngControl.control.setValue(v, { emitEvent: false })
  }

  ngOnDestroy() {
    if (this.ngControl.value) {

      this.setValue(this.unformatValue(this.ngControl.value));
      this.destroy$.next(null);
      this.destroy$.complete();
    }
  }

}
