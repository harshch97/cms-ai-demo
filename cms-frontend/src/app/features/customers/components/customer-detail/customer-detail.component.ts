import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { CustomerService } from '../../services/customer.service';
import { AddressService } from '../../services/address.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  ConfirmDialogComponent, ConfirmDialogData
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  AddressDialogComponent, AddressDialogData
} from '../address-dialog/address-dialog.component';
import { CustomerWithAddresses, Address } from '../../../../shared/models';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  customer?: CustomerWithAddresses;
  isLoading = false;
  deletingCustomer = false;
  deletingAddressId: number | null = null;
  customerId!: number;

  addressColumns = ['type', 'address', 'city', 'state', 'pin_code', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private addressService: AddressService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.customerId = +this.route.snapshot.paramMap.get('id')!;
    this.loadCustomer();
  }

  loadCustomer(): void {
    this.isLoading = true;
    this.customerService.getCustomerById(this.customerId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: res => {
          if (res.success && res.data) this.customer = res.data;
        },
        error: () => this.notification.error('Failed to load customer.')
      });
  }

  goToEdit(): void {
    this.router.navigate(['/customers', this.customerId, 'edit']);
  }

  /** Open the Add / Edit address dialog. Pass existing address for edit mode. */
  openAddressDialog(address?: Address): void {
    const dialogRef = this.dialog.open<AddressDialogComponent, AddressDialogData, boolean>(
      AddressDialogComponent,
      {
        width: '640px',
        maxWidth: '95vw',
        data: { customerId: this.customerId, address }
      }
    );
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(saved => {
        if (saved) this.loadCustomer();
      });
  }

  confirmDeleteCustomer(): void {
    if (!this.customer) return;
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        data: {
          title: 'Delete Customer',
          message: `Delete "${this.customer.full_name}"? All addresses will also be removed.`,
          confirmLabel: 'Delete',
          isDanger: true
        }
      }
    );
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteCustomer();
      });
  }

  private deleteCustomer(): void {
    this.deletingCustomer = true;
    this.customerService.deleteCustomer(this.customerId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.deletingCustomer = false))
      )
      .subscribe({
        next: () => {
          this.notification.success('Customer deleted.');
          this.router.navigate(['/customers']);
        },
        error: () => this.notification.error('Failed to delete customer.')
      });
  }

  confirmDeleteAddress(address: Address): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        data: {
          title: 'Delete Address',
          message: `Remove address at ${address.house_flat_number}, ${address.city}?`,
          confirmLabel: 'Delete',
          isDanger: true
        }
      }
    );
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteAddress(address.id);
      });
  }

  private deleteAddress(addressId: number): void {
    this.deletingAddressId = addressId;
    this.addressService.deleteAddress(addressId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.deletingAddressId = null))
      )
      .subscribe({
        next: () => {
          this.notification.success('Address deleted.');
          this.loadCustomer();
        },
        error: () => this.notification.error('Failed to delete address.')
      });
  }

  getAddressIndex(index: number): string {
    return `Address ${index + 1}`;
  }

  getFullAddress(addr: Address): string {
    return [addr.house_flat_number, addr.building_street, addr.locality_area]
      .filter(Boolean).join(', ');
  }
}
