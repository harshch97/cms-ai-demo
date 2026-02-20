import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-wrapper" [class.overlay]="overlay">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 16px;
    }
    .spinner-wrapper.overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,.7);
      z-index: 1000;
    }
    .spinner-message {
      color: rgba(0,0,0,.6);
      font-size: 14px;
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter = 48;
  @Input() message = '';
  @Input() overlay = false;
}
