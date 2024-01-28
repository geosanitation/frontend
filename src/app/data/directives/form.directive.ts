import { Directive, ViewContainerRef  } from '@angular/core';

@Directive({
  selector: '[digitaliserForm]'
})
export class FormDirective {

  constructor(public viewContainerRef: ViewContainerRef) {}

}
