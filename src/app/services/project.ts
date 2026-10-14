import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { timeout, firstValueFrom  } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';

export interface TaskBoard {
  todo: Task[];
  inProgress: Task[];
  testing: Task[];
  done: Task[];
  totalTodo: number;
  totalInProgress: number;
  totalTesting: number;
  totalDone: number;
}

export interface TaskUpdatePayload {
  title?: string;
  status?: number;
  progress?: number;
  description?: string;
  due_date?: string;
  color?: string;
  severity?: string;
  shared?: number;
  rang?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly token: string | null
  public RANK_GAP = 1000;

  public severities = [
    { value: 'low',    label: 'Basse',   color: '#22c55e', bgColor: '#E8F8EE' },
    { value: 'medium', label: 'Moyenne', color: '#FABB18', bgColor: '#FDF0E1' },
    { value: 'high',   label: 'Haute',   color: '#ef4444', bgColor: '#FCE8E8' },
    { value: 'urgent', label: 'Urgente', color: '#861212', bgColor: '#f5d1d1' },
  ];

  public progress = [
    { value: 0, label: 0 },
    { value: 25, label: 25 },
    { value: 50, label: 50 },
    { value: 75, label: 75 },
    { value: 100, label: 100 },
  ];
   
  constructor() {
    this.token = this.authService.getToken();
  }

  /*
  * Get Tasks
  */
  async getTasks(): Promise<TaskBoard> {
    const board = await firstValueFrom(
      this.http.get<TaskBoard>(
        `${environment.apiDolibarrUrl}/dashboardapiapi/getTasks`,
        {
          params: { DOLAPIKEY: this.token! },
        }
      ).pipe(timeout(5000))
    );

    return {
      todo: this.sortByRank(board.todo),
      inProgress: this.sortByRank(board.inProgress),
      testing: this.sortByRank(board.testing),
      done: this.sortByRank(board.done),
      totalTodo: board.totalTodo,
      totalInProgress: board.totalInProgress,
      totalTesting: board.totalTesting,
      totalDone: board.totalDone
    };
  }

  /*
  * Update Task
  */
  async updateTask(id: number, updatedTask: TaskUpdatePayload): Promise<Task> {
    return firstValueFrom(
      this.http.put<Task>(
        `${environment.apiDolibarrUrl}/dashboardapiapi/tasks/${id}`,
        updatedTask,
        { params: { DOLAPIKEY: this.token! } }
      ).pipe(timeout(5000))
    );
  }

  /*
  * Clone Task
  */
  async cloneTask(id: number): Promise<Task> {
    return firstValueFrom(
      this.http.post<Task>(
        `${environment.apiDolibarrUrl}/dashboardapiapi/tasks/${id}/clone`,
        { id: id },
        { params: { DOLAPIKEY: this.token! } }
      ).pipe(timeout(5000))
    );
  }

  /*
  * Get users assigned 
  */
  async getUsersByTask(idTask: number) {
    return await firstValueFrom(
      this.http.get<User[]>(`${environment.apiDolibarrUrl}/dashboardapiapi/tasks/${idTask}/users`, {
        params: { DOLAPIKEY: this.token! },
      }).pipe(timeout(5000))
    );
  }

  /*
  * Update rank by task
  */
  async updateTaskRank(id: number, rang: number, status?: number): Promise<void> {    
    await firstValueFrom(
      this.http.patch(
        `${environment.apiDolibarrUrl}/dashboardapiapi/tasks/${id}/rank`,
        { rang, status },
        { params: { DOLAPIKEY: this.token! } }
      ).pipe(timeout(5000))
    );
  }

  private sortByRank(items: Task[]): Task[] {
    return [...items].sort((a, b) => a.rang - b.rang);
  }

  computeNewRank(items: Task[], newIndex: number): number {
    const prev = items[newIndex - 1];
    const next = items[newIndex]; // item actuellement à cette position (après retrait du dragué)

    if (!prev && !next) 
      return this.RANK_GAP;

    if (!prev) return next.rang / 2;
    if (!next) return prev.rang + this.RANK_GAP;

    return (prev.rang + next.rang) / 2;
  }

  needsRebalance(items: Task[], newIndex: number): boolean {
    const prev = items[newIndex - 1];
    const next = items[newIndex];
    if (!prev || !next) return false;
    return (next.rang - prev.rang) < 0.001; // seuil de précision flottante
  }

  getUrlDolibarrTask(idTask: number): string {
    return environment.dolibarrUrl+"/projet/tasks/task.php?id="+idTask;
  }
}
