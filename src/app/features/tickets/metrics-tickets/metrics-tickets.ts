import { Component, OnInit, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { TicketService } from '../../../services/ticket';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-metrics-tickets',
  imports: [AvatarModule, TooltipModule],
  standalone: true,
  templateUrl: './metrics-tickets.html',
  styleUrl: './metrics-tickets.scss',
})
export class MetricsTickets implements OnInit {
  metrics: any = {};

  toProcess = signal(0);
  toProcessEvolution = signal(0);
  processPositive = signal(false);
  processNegative = signal(false);

  assigned = signal(0);
  userAssigned = signal<any[]>([]);

  resolvedThisMonth = signal(0);
  resolvedThisMonthEvolution = signal(0);
  resolvedThisMonthPositive = signal(false);
  resolvedThisMonthNegative = signal(false);

  noAnswerDays = signal(0);
  noAnswerDaysEvolution = signal(0);
  noAnswerDaysPositive = signal(false);
  noAnswerDaysNegative = signal(false);

  openedToday = signal(0);

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.getMetrics().then(metrics => {
      this.metrics = metrics;

      // Process
      this.toProcess.set(metrics.to_process.value)
      this.toProcessEvolution.set(metrics.to_process.evolution)

      if (metrics.to_process.evolution > 0) {
        this.processPositive.set(true);
      } else if (metrics.to_process.evolution < 0) {
        this.processNegative.set(true);
      }

      // Assigned
      this.assigned.set(metrics.assigned.value);

      if (metrics.assigned.users) {
        this.userAssigned.set(metrics.assigned.users);
      }

      // Resolved
      this.resolvedThisMonth.set(metrics.resolved_this_month.value)
      this.resolvedThisMonthEvolution.set(metrics.resolved_this_month.evolution)

      if (metrics.resolved_this_month.evolution > 0) {
        this.resolvedThisMonthPositive.set(true);
      } else if (metrics.resolved_this_month.evolution < 0) {
        this.resolvedThisMonthNegative.set(true);
      }

      // NoAnswerDays
      this.noAnswerDays.set(metrics.no_answer_days.value)
      this.noAnswerDaysEvolution.set(metrics.no_answer_days.evolution)

      if (metrics.no_answer_days.evolution > 0) {
        this.noAnswerDaysPositive.set(true);
      } else if (metrics.no_answer_days.evolution < 0) {
        this.noAnswerDaysNegative.set(true);
      }

      // OpenedToday
      this.openedToday.set(metrics.opened_today.value)      
    });   
  }
}
