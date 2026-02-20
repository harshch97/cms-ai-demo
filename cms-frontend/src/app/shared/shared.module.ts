import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

// Shared components
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

// Shared directives
import { NumericOnlyDirective } from './directives/numeric-only.directive';

// Shared pipes
import { FormatPhonePipe } from './pipes/format-phone.pipe';

const MATERIAL_MODULES = [
  MatTableModule, MatPaginatorModule, MatSortModule,
  MatInputModule, MatFormFieldModule, MatButtonModule,
  MatIconModule, MatCardModule, MatSelectModule,
  MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
  MatToolbarModule, MatMenuModule, MatTooltipModule,
  MatDividerModule, MatChipsModule, MatBadgeModule
];

const SHARED_COMPONENTS = [
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS,
    NumericOnlyDirective,
    FormatPhonePipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_MODULES
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
    NumericOnlyDirective,
    FormatPhonePipe
  ]
})
export class SharedModule {}
