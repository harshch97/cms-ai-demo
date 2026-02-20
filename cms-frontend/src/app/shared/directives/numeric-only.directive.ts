import { Directive, HostListener } from '@angular/core';

@Directive({ selector: '[appNumericOnly]' })
export class NumericOnlyDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'End', 'Home'
    ];
    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedData = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pastedData)) {
      event.preventDefault();
    }
  }
}
