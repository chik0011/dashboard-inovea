import { Component } from '@angular/core';
import { TableTickets } from './table-tickets/table-tickets';
import { MetricsTickets } from './metrics-tickets/metrics-tickets';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [TableTickets, MetricsTickets],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss',
})
export class Tickets {

}
