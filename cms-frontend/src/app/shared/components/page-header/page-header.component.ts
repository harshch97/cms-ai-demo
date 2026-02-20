import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="header-left">
        <button *ngIf="showBack" mat-icon-button (click)="goBack()" class="back-btn" aria-label="Go back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="title-block">
          <h1 class="page-title">{{ title }}</h1>
          <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .back-btn { margin-left: -8px; }
    .page-title {
      font-size: 22px;
      font-weight: 500;
      margin: 0;
      line-height: 1.3;
    }
    .page-subtitle {
      font-size: 13px;
      color: rgba(0,0,0,.55);
      margin: 2px 0 0 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    @media (max-width: 599px) {
      .page-header { flex-direction: column; }
      .header-actions { width: 100%; }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showBack = false;

  goBack(): void {
    window.history.back();
  }
}
