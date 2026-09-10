import { NgModule } from "@angular/core";
import { BlockCopyPasteDirective } from "./block-copy-paste.directive";
import { TrackCapsDirective } from "./caps-lock.directive";
import { DecimalFormatterDirective } from "./decimal.directive";
import { OnlyNumber,DigitOnlyDirective } from "./onlynumber.directive";
//import { ProvideMatFormFieldReadonly } from "./readonly-provide.directive";

@NgModule({
  declarations: [OnlyNumber, DigitOnlyDirective ,TrackCapsDirective, DecimalFormatterDirective, BlockCopyPasteDirective],
  exports: [OnlyNumber,DigitOnlyDirective  , TrackCapsDirective, DecimalFormatterDirective, BlockCopyPasteDirective]
})
export class DirectiveModule { }
