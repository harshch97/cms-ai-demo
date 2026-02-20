import {
  Component, OnInit, Input, DestroyRef, inject
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { ReferenceService } from '../../services/reference.service';
import { ReferenceItem, CityItem } from '../../../../shared/models';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent implements OnInit {
  /** Parent passes the address FormGroup down via this input */
  @Input() addressGroup!: FormGroup;
  /** Show/hide all address fields (used in edit mode where address is optional) */
  @Input() optional = false;
  /**
   * For edit mode: pass the existing state name so the component can resolve
   * state_id and pre-load the matching city list without resetting city.
   */
  @Input() preloadStateName?: string;

  private destroyRef = inject(DestroyRef);

  states: ReferenceItem[] = [];
  cities: CityItem[] = [];
  loadingCities = false;

  constructor(private referenceService: ReferenceService) {}

  ngOnInit(): void {
    // Load states (cached)
    this.referenceService.getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.success && res.data) {
          this.states = res.data;

          // Edit mode: resolve state_id from name, load cities without clearing city
          if (this.preloadStateName) {
            const stateId = this.states.find(s => s.name === this.preloadStateName)?.id ?? null;
            if (stateId) {
              this.addressGroup.get('state_id')?.setValue(stateId, { emitEvent: false });
              this.addressGroup.get('state')?.setValue(this.preloadStateName, { emitEvent: false });
              this._loadCitiesQuiet(stateId);
            }
          }
        }
      });

    // When state changes interactively, reload cities and reset city
    this.addressGroup.get('state_id')!.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      distinctUntilChanged(),
      switchMap(stateId => {
        this.addressGroup.get('city')!.setValue(null, { emitEvent: false });
        this.cities = [];
        if (!stateId) {
          this.addressGroup.get('state')?.setValue(null, { emitEvent: false });
          return EMPTY;
        }
        // Sync state name for the parent to use in API payload
        const stateName = this.states.find(s => s.id === stateId)?.name ?? null;
        this.addressGroup.get('state')?.setValue(stateName, { emitEvent: false });
        this.loadingCities = true;
        return this.referenceService.getCitiesByState(stateId);
      })
    ).subscribe({
      next: res => {
        this.loadingCities = false;
        if (res.success && res.data) this.cities = res.data;
      },
      error: () => { this.loadingCities = false; }
    });
  }

  /** Load cities for a state WITHOUT resetting the city control (used on initial preload). */
  private _loadCitiesQuiet(stateId: number): void {
    this.loadingCities = true;
    this.referenceService.getCitiesByState(stateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.loadingCities = false;
          if (res.success && res.data) this.cities = res.data;
        },
        error: () => { this.loadingCities = false; }
      });
  }

  get f() { return this.addressGroup.controls; }
}

