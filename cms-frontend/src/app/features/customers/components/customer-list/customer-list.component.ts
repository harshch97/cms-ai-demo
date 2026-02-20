import {
  Component, OnInit, OnDestroy, DestroyRef, inject, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  ConfirmDialogComponent, ConfirmDialogData
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomerWithAddresses } from '../../../../shared/models';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['full_name', 'company_name', 'phone_number', 'email', 'actions'];
  customers: CustomerWithAddresses[] = [];
  totalCount = 0;
  pageIndex = 0;
  pageSize = 10;

  searchCtrl = new FormControl('');
  isLoading = false;
  deletingId: number | null = null;

  private reload$ = new Subject<void>();

  constructor(
    private customerService: CustomerService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Trigger reload whenever search changes (debounced)
    this.searchCtrl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(350),
      distinctUntilChanged(),
      tap(() => { this.pageIndex = 0; })
    ).subscribe(() => this.loadCustomers());

    // Initial load
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService
      .getCustomers(this.pageIndex + 1, this.pageSize, this.searchCtrl.value ?? '')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.customers = res.data.items;
            this.totalCount = res.data.total;
          }
        },
        error: () => this.notification.error('Failed to load customers.')
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCustomers();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadCustomers();
  }

  clearSearch(): void {
    this.searchCtrl.setValue('');
  }

  goToCreate(): void {
    this.router.navigate(['/customers/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/customers', id]);
  }

  goToEdit(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/customers', id, 'edit']);
  }

  confirmDelete(customer: CustomerWithAddresses, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        data: {
          title: 'Delete Customer',
          message: `Are you sure you want to delete "${customer.full_name}"? This will also remove all their addresses.`,
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          isDanger: true
        }
      }
    );

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteCustomer(customer.id);
      });
  }

  private deleteCustomer(id: number): void {
    this.deletingId = id;
    this.customerService.deleteCustomer(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.deletingId = null))
      )
      .subscribe({
        next: () => {
          this.notification.success('Customer deleted successfully.');
          this.loadCustomers();
        },
        error: () => this.notification.error('Failed to delete customer.')
      });
  }
}
