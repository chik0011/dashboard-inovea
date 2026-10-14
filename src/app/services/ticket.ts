import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { timeout, firstValueFrom  } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly token: string | null
  
  constructor() {
    this.token = this.authService.getToken();
  }

  async getTickets(): Promise<Ticket[]> {
    return await firstValueFrom(
      this.http.get<Ticket[]>(`${environment.apiDolibarrUrl}/dashboardapiapi/getCurrentTickets`, {
          params: { DOLAPIKEY: this.token! },
        }).pipe(timeout(5000))
    );
  }

  async getMetrics(): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(`${environment.apiDolibarrUrl}/dashboardapiapi/getCurrentTicketsMetrics`, {
          params: { DOLAPIKEY: this.token! },
        }).pipe(timeout(5000))
    );
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case '0': 
          return 'Non lu';

      case '1': 
          return 'Lu';

      case '2': 
          return 'Assigné';

      case '3': 
          return 'En cours';

      case '5': 
          return 'En attente de retour';

      case '7': 
          return 'En attente';

      case '8':
          return 'Fermé';

      case '9': // STATUS_CANCELED
          return 'Annulé';
    }

    return 'None';
  }

   getUrlDolibarrTicket(idTicket: number): string {
    return environment.dolibarrUrl+"/ticket/card.php?id="+idTicket;
  }
}
