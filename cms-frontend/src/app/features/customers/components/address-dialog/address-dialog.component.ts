import { Component, OnInit, Inject, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { AddressService } from '../../services/address.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Address } from '../../../../shared/models';

export interface AddressDialogData {
  customerId: number;
  address?: Address; // present = edit mode
}

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.scss']
})
export class AddressDialogComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  addressGroup!: FormGroup;
  isSaving = false;
  isEditMode: boolean;

  /** Passed to address-form so it can preload state dropdown on edit */
  preloadStateName?: string;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddressDialogData
  ) {
    this.isEditMode = !!data.address;
  }

  ngOnInit(): void {
    this.addressGroup = this.fb.group({
      house_flat_number: ['', [Validators.required, Validators.maxLength(50)]],
      building_street:   ['', [Validators.required, Validators.maxLength(150)]],
      locality_area:     ['', [Validators.required, Validators.maxLength(100)]],
      state_id:          [null, Validators.required],
      state:             [null],
      city:              [null, Validators.required],
      pin_code:          ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    if (this.isEditMode && this.data.address) {
      const addr = this.data.address;
      // Patch non-state/city fields immediately
      this.addressGroup.patchValue({
        house_flat_number: addr.house_flat_number,
        building_street:   addr.building_street,
        locality_area:     addr.locality_area,
        city:              addr.city,
        pin_code:          addr.pin_code,
        state:             addr.state,
      });
      // Let address-form handle state_id resolution + city preload
      this.preloadStateName = addr.state;
    }
  }

  save(): void {
    if (this.addressGroup.invalid) {
      this.addressGroup.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const raw = this.addressGroup.value;
    const dto = {
      house_flat_number: raw.house_flat_number.trim(),
      building_street:   raw.building_street.trim(),
      locality_area:     raw.locality_area.trim(),
      city:              raw.city,
      state:             raw.state ?? '',
      pin_code:          raw.pin_code.trim(),
    };

    const request$ = this.isEditMode && this.data.address
      ? this.addressService.updateAddress(this.data.address.id, dto)
      : this.addressService.createAddress(this.data.customerId, dto);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: () => {
          this.notification.success(this.isEditMode ? 'Address updated.' : 'Address added.');
          this.dialogRef.close(true);
        },
        error: () => {
          this.notification.error(this.isEditMode ? 'Failed to update address.' : 'Failed to add address.');
        }
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
