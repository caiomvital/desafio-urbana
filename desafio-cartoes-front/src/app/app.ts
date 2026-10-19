import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from './shared/confirm/confirm-dialog';
import { ToastContainer } from './shared/toast/toast-container';

@Component({
  imports: [RouterOutlet, ToastContainer, ConfirmDialog],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
