import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CustomerWithAddresses, FieldError } from '../../../../shared/models';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  form!: FormGroup;
  isEditMode = false;
  customerId?: number;
  isLoading = false;    // form submission in progress
  isFetching = false;   // loading existing data in edit mode
  pageError = '';

  existingCustomer?: CustomerWithAddresses;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.customerId = +idParam;
      this.loadCustomer(this.customerId);
    }
  }

  // ── Form construction ──────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      // Customer fields
      full_name: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\s.'-]+$/),
        Validators.maxLength(150)
      ]],
      company_name: ['', [Validators.required, Validators.maxLength(150)]],
      phone_number: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(7),
        Validators.maxLength(15)
      ]],
      email: ['', [Validators.required, Validators.email]],

      // Embedded address sub-form
      address: this.fb.group({
        house_flat_number: ['', [Validators.required, Validators.maxLength(50)]],
        building_street:   ['', [Validators.required, Validators.maxLength(150)]],
        locality_area:     ['', [Validators.required, Validators.maxLength(100)]],
        state_id:          [null, Validators.required],
        state:             [null], // resolved from state_id by address-form, sent to API
        city:              [null, Validators.required],
        pin_code:          ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        // stored for edit mode targeting — hidden from user
        id:                [null]
      })
    });

    // In edit mode, address fields are optional
    if (this.isEditMode) {
      this.relaxAddressValidators();
    }
  }

  private relaxAddressValidators(): void {
    const addr = this.addressGroup;
    ['house_flat_number', 'building_street', 'locality_area', 'state_id', 'city', 'pin_code']
      .forEach(field => addr.get(field)!.clearValidators());
    addr.updateValueAndValidity();
  }

  // ── Accessors ─────────────────────────────────────────────────

  get f() { return this.form.controls; }
  get addressGroup() { return this.form.get('address') as FormGroup; }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Customer' : 'Add Customer';
  }

  // ── Load (edit mode) ──────────────────────────────────────────

  private loadCustomer(id: number): void {
    this.isFetching = true;
    this.customerService.getCustomerById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isFetching = false))
      )
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.existingCustomer = res.data;
            this.patchForm(res.data);
          }
        },
        error: () => {
          this.pageError = 'Failed to load customer details.';
        }
      });
  }

  private patchForm(data: CustomerWithAddresses): void {
    this.form.patchValue({
      full_name:    data.full_name,
      company_name: data.company_name,
      phone_number: data.phone_number,
      email:        data.email
    });

    if (data.addresses?.length) {
      const addr = data.addresses[0];
      // We'll need the state_id — find it from states list via city/state name
      // The address carries state name as string; we patch the text fields directly
      // and delegate the state_id lookup to the address-form component on load
      this.addressGroup.patchValue({
        id:                addr.id,
        house_flat_number: addr.house_flat_number,
        building_street:   addr.building_street,
        locality_area:     addr.locality_area,
        city:              addr.city,
        // state_id must be resolved from the states list — handled via state name input
        pin_code:          addr.pin_code
      });
    }
  }

  // ── Submit ────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const raw = this.form.value;

    if (this.isEditMode && this.customerId) {
      this.update(this.customerId, raw);
    } else {
      this.create(raw);
    }
  }

  private create(raw: typeof this.form.value): void {
    const dto = {
      full_name:    raw.full_name.trim(),
      company_name: raw.company_name.trim(),
      phone_number: raw.phone_number.trim(),
      email:        raw.email.trim().toLowerCase(),
      address: {
        house_flat_number: raw.address.house_flat_number.trim(),
        building_street:   raw.address.building_street.trim(),
        locality_area:     raw.address.locality_area.trim(),
        city:              raw.address.city,
        state:             this.getStateName(raw.address.state_id),
        pin_code:          raw.address.pin_code.trim()
      }
    };

    this.customerService.createCustomer(dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: res => {
          this.notification.success('Customer created successfully!');
          this.router.navigate(['/customers', res.data!.id]);
        },
        error: (err: HttpErrorResponse) => this.handleApiError(err)
      });
  }

  private update(id: number, raw: typeof this.form.value): void {
    const dto: Record<string, unknown> = {};

    if (raw.full_name)    dto['full_name']    = raw.full_name.trim();
    if (raw.company_name) dto['company_name'] = raw.company_name.trim();
    if (raw.phone_number) dto['phone_number'] = raw.phone_number.trim();
    if (raw.email)        dto['email']        = raw.email.trim().toLowerCase();

    // Only include address block if any address field was touched
    const addrDirty = this.addressGroup.dirty;
    if (addrDirty) {
      dto['address'] = {
        ...(raw.address.id ? { id: raw.address.id } : {}),
        ...(raw.address.house_flat_number ? { house_flat_number: raw.address.house_flat_number.trim() } : {}),
        ...(raw.address.building_street   ? { building_street:   raw.address.building_street.trim() }   : {}),
        ...(raw.address.locality_area     ? { locality_area:     raw.address.locality_area.trim() }     : {}),
        ...(raw.address.city              ? { city:              raw.address.city }                      : {}),
        ...(raw.address.state_id          ? { state:             this.getStateName(raw.address.state_id) } : {}),
        ...(raw.address.pin_code          ? { pin_code:          raw.address.pin_code.trim() }           : {})
      };
    }

    this.customerService.updateCustomer(id, dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: res => {
          this.notification.success('Customer updated successfully!');
          this.router.navigate(['/customers', res.data!.id]);
        },
        error: (err: HttpErrorResponse) => this.handleApiError(err)
      });
  }

  // ── Error handling ────────────────────────────────────────────

  private handleApiError(err: HttpErrorResponse): void {
    if (err.status === 409) {
      // Duplicate email
      this.f['email'].setErrors({ duplicate: true });
      this.f['email'].markAsTouched();
      return;
    }
    if (err.status === 400 && err.error?.errors) {
      this.mapFieldErrors(err.error.errors as FieldError[]);
      return;
    }
    // Generic — error interceptor already showed toast
  }

  private mapFieldErrors(errors: FieldError[]): void {
    errors.forEach(e => {
      const parts = e.field.split('.');
      if (parts.length === 1) {
        this.form.get(parts[0])?.setErrors({ serverError: e.message });
      } else if (parts[0] === 'address') {
        this.addressGroup.get(parts[1])?.setErrors({ serverError: e.message });
      }
    });
    this.form.markAllAsTouched();
  }

  // ── Helpers ───────────────────────────────────────────────────

  /**
   * The API stores state as a name string, not an id.
   * address-form tracks state_id for the cascade and also writes
   * the matching name string into the `state` control.
   */
  private getStateName(_stateId: number): string {
    return this.addressGroup.get('state')?.value ?? '';
  }

  cancel(): void {
    window.history.back();
  }
}
