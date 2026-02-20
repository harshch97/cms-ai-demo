import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CustomersRoutingModule } from './customers-routing.module';

import { CustomersShellComponent } from './components/shell/customers-shell.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { AddressDialogComponent } from './components/address-dialog/address-dialog.component';

@NgModule({
  declarations: [
    CustomersShellComponent,
    CustomerListComponent,
    CustomerFormComponent,
    CustomerDetailComponent,
    AddressFormComponent,
    AddressDialogComponent
  ],
  imports: [SharedModule, CustomersRoutingModule]
})
export class CustomersModule {}
