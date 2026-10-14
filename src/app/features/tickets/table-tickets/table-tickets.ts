import { Component, inject, OnInit, signal  } from '@angular/core';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../services/ticket';
import { Ticket } from '../../../models/ticket.model';
import { UserService } from '../../../services/user';
import { SkeletonModule } from 'primeng/skeleton';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-table-tickets',
  imports: [FormsModule, TableModule, HttpClientModule, CommonModule, InputTextModule, TagModule,
  SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule, SkeletonModule],
  templateUrl: './table-tickets.html',
  styleUrl: './table-tickets.scss',
  standalone: true,
})
export class TableTickets implements OnInit{
    tickets: Ticket[] = [];

    representatives: User[] = [];

    statuses!: any[];

    loading = signal(true);

    skeletonRows = Array.from({ length: 16 }).map((_, i) => ({ id: i }));

    private ticketService = inject(TicketService);
    private userService = inject(UserService);

    ngOnInit() {
        this.ticketService.getTickets().then((tickets) => {
            this.tickets = tickets.map(ticket => ({
                ...ticket,
                date_create: ticket.date_create ? new Date(ticket.date_create) : ticket.date_create,
                fk_user_assign: ticket.fk_user_assign != null ? Number(ticket.fk_user_assign) : ticket.fk_user_assign
            }) as Ticket);

            return this.userService.getAllUser();
        }).then((users) => {
            this.representatives = users.map((u: User) => ({ ...u, id: Number(u.id) }));
            this.loading.set(false);
        });

        this.statuses = [
            { label: 'Non lu', value: '0' },
            { label: 'Lu', value: '1' },
            { label: 'Assigné', value: '2' },
            { label: 'En cours', value: '3' },
            { label: 'En attente de retour', value: '5' },
            // { label: 'Fermé', value: '8' },
            // { label: 'Annulé', value: '9' },
        ];
    }

    getUserName(userId: string | number): string {
        const user = this.representatives?.find((u: User) => u.id == userId);
        return user ? user.lastname + " " + user.firstname : '-';
    }

    clear(table: Table) {
        table.clear();
    }

    getStatusLabel(status: string): string {
        return this.ticketService.getStatusLabel(status);
    }

    getSeverity(status: string) {
        switch (status) {
            case '0': // STATUS_NOT_READ
                return 'warn';

            case '1': // STATUS_READ
                return 'info';

            case '2': // STATUS_ASSIGNED
                return 'info';

            case '3': // STATUS_IN_PROGRESS
                return 'success';

            case '5': // STATUS_NEED_MORE_INFO
                return 'contrast';

            case '7': // STATUS_WAITING
                return 'success';

            case '8': // STATUS_CLOSED
                return 'secondary';

            case '9': // STATUS_CANCELED
                return 'secondary';

            default:
                return 'danger'
        }
    }

    getUrlDolibarrTicket(idTicket: number) : string {
       return this.ticketService.getUrlDolibarrTicket(idTicket)
    }
}
