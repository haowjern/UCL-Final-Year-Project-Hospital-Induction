import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appLocationForm]'
})
export class LocationFormDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
