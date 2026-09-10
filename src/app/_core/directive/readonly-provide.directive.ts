import { Directive, Input, HostBinding } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

/* Workaround to provide css class 'mat-form-field-readonly' similiar to 'mat-form-field-disabled'. 
 * Example Usage:
 *	<mat-form-field provideReadonly>
 *		<input  matInput placeholder="Readonly Input" readonly="true" value="Some Value">
 *	</mat-form-field>
 */
@Directive({
	selector: 'mat-form-field[provideReadonly]',
	host: {
		'[class.mat-form-field-readonly]': 'isReadonlyInput()'
	}
})
export class ProvideMatFormFieldReadonlyDirective {
	constructor(private _matFormField: MatFormField) { }

	public isReadonlyInput(): boolean {
		const ctrl = this._matFormField._control;
		if (ctrl instanceof MatInput) {
			return ctrl.readonly;
		}
		return false;
	}
}