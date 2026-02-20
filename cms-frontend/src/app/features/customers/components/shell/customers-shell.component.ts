import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customers-shell',
  templateUrl: './customers-shell.component.html',
  styleUrls: ['./customers-shell.component.scss']
})
export class CustomersShellComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
