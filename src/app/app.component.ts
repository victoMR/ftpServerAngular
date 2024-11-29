import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FtpConnectionComponent } from './ftp-connection/ftp-connection.component';

@Component( {
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, FtpConnectionComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
} )
export class AppComponent {
  title = 'Ftp Client';
}
