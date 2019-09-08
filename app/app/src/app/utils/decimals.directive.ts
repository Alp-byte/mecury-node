import { DecimalsPipe } from './decimals.pipe';
import { Directive, Input, Inject, HostListener, OnChanges, ElementRef, Renderer, AfterViewInit, OnInit } from "@angular/core";

@Directive({ selector: "[DecimalsFormatter]" })
export class DecimalsDirective {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: DecimalsPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.currencyPipe.parse(this.el.value);
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    this.el.value = this.currencyPipe.parse(value); // opossite of transform
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.currencyPipe.parse(value);
  }

  @HostListener("keyup", ["$event.target.value"]) 
  onKeyUp(value) {
    this.el.value = this.currencyPipe.parse(value);
  }



}