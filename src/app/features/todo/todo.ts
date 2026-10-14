import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProjectService } from '../../services/project';
import { Task } from '../../models/task.model';
import { TodoDetail } from './todo-detail/todo-detail';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { viewChild } from '@angular/core';

@Component({
  selector: 'app-todo',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, MenuModule, ButtonModule, BadgeModule, TodoDetail, Menu],
  templateUrl: './todo.html',
  styleUrl: './todo.scss',
})
export class Todo implements OnInit {

  private projectService = inject(ProjectService);

  private readonly COLUMN_STATUS_MAP: Record<string, number> = {
    todo: 0,
    done: 1,
    inProgress: 2,
    testing: 4,
  };
  
  items = [
    {
      label: 'Ajouter une carte',
      /*command: () => {
        this.router.navigate(['/profile']);
      }*/
    },
    {
      label: 'Suivre',
      /*command: () => {
        this.router.navigate(['/profile']);
      }*/
    },
    {
      separator: true
    },
    {
      label: 'Archiver cette liste',
      command: () => {
        const columnSelected = this.columnSelected();
        
        if (columnSelected) {
          this.archiveColumnTasks();
        }
      }
    }
  ];

  todo = signal<Task[]>([]);
  inProgress = signal<Task[]>([]);
  testing = signal<Task[]>([]);
  done = signal<Task[]>([]);

  private readonly columnSignals: Record<string, typeof this.todo> = {
    todo: this.todo,
    inProgress: this.inProgress,
    testing: this.testing,
    done: this.done,
  };

  totalTodo = computed(() => this.todo().length);
  totalInProgress = computed(() => this.inProgress().length);
  totalTesting = computed(() => this.testing().length);
  totalDone = computed(() => this.done().length);

  selectedTask = signal<Task | null>(null);
  detailVisible = signal<boolean>(false);

  listTodoActionsMenu = viewChild.required<Menu>('op');
  columnSelected = signal<string | null>(null);

  ngOnInit(): void {
    this.projectService.getTasks().then(board => {
      this.todo.set(board.todo);
      this.inProgress.set(board.inProgress);
      this.testing.set(board.testing);
      this.done.set(board.done);
    });
  }

  openListTasksMenu(event: Event, columnName: string) {
    this.listTodoActionsMenu().toggle(event)
    this.columnSelected.set(columnName);
  }

  openTaskDetail(task: Task) {
    this.selectedTask.set(task);
    this.detailVisible.set(true);
  }

  async archiveColumnTasks() {
    const column = this.columnSelected();
    if (!column) return;

    const signal = this.columnSignals[column];
    if (!signal) return;

    const tasks = signal();

    await Promise.all(
      tasks.map(task => this.projectService.updateTask(task.id, { shared: 0 }))
    );

    signal.set([]);
  }

  async drop(event: CdkDragDrop<Task[]>) {
    const movedTask = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.notifySignalChange(event.previousContainer.id);
    if (event.previousContainer !== event.container) {
      this.notifySignalChange(event.container.id);
    }

    const targetList = event.container.data;

    if (this.projectService.needsRebalance(targetList, event.currentIndex)) {
      await this.rebalanceColumn(targetList);
    } else {
      const newRank = this.projectService.computeNewRank(targetList, event.currentIndex);
      movedTask.rang = newRank;

      const newStatus = event.previousContainer !== event.container
        ? this.statusForColumn(event.container.id)
        : undefined;

      if (newStatus !== undefined) {
        movedTask.status = newStatus;
      }

      await this.projectService.updateTaskRank(movedTask.id, newRank, newStatus);
    }
  }

  private async rebalanceColumn(items: Task[]) {
    items.forEach((item, i) => item.rang = (i + 1) * this.projectService.RANK_GAP);

    await Promise.all(
      items.map(item => this.projectService.updateTaskRank(item.id, item.rang))
    );
  }

  stripHtml(html: string, maxLength = 40): string {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  private statusForColumn(columnId: string): number | undefined {
    return this.COLUMN_STATUS_MAP[columnId];
  }

  private notifySignalChange(columnId: string) {
    const signalMap: Record<string, typeof this.todo> = {
      todo: this.todo,
      inProgress: this.inProgress,
      testing: this.testing,
      done: this.done,
    };

    const sig = signalMap[columnId];
    if (sig) {
      sig.update(items => [...items]); // nouvelle référence → déclenche computed()
    }
  }

  onTaskUpdated(updatedTask: Task): void {
    const columnSignals = [this.todo, this.inProgress, this.testing, this.done];

    // Retire l'ancienne version de la tâche de toutes les colonnes
    for (const sig of columnSignals) {
      sig.update(items => items.filter(t => t.id !== updatedTask.id));
    }

    // La réinsère dans la bonne colonne selon son nouveau status
    const targetSignal = this.signalForStatus(updatedTask.status);
    targetSignal.update(items => [...items, updatedTask].sort((a, b) => a.rang - b.rang));

    // Met aussi à jour selectedTask pour que le dialog affiche les nouvelles valeurs
    this.selectedTask.set(updatedTask);
  }

  private signalForStatus(status: number): typeof this.todo {
    const map: Record<number, typeof this.todo> = {
      0: this.todo,
      1: this.done,
      2: this.inProgress,
    };
    return map[status] ?? this.testing; // 4 (testing) ou tout statut par défaut
  }

  severityColor(value: string|null|undefined): string {
    return this.projectService.severities.find(s => s.value === value)?.color ?? '#94a3b8';
  }

  severityBgColor(value: string | null | undefined): string {
    return this.projectService.severities.find(s => s.value === value)?.bgColor ?? '#F4F4F6';
  }

  onTaskCloned(task: Task) {
    this.addTaskToColumn(task);
  }

  private addTaskToColumn(task: Task) {
    switch (task.status) {
      case 0: this.todo.update(list => [...list, task]); break;
      case 2: this.inProgress.update(list => [...list, task]); break;
      case 4: this.testing.update(list => [...list, task]); break;
      case 1: this.done.update(list => [...list, task]); break;
    }
  }

  onTaskArchived(taskId: number) {
    const columnSignals = [this.todo, this.inProgress, this.testing, this.done];
    for (const sig of columnSignals) {
      sig.update(items => items.filter(t => t.id !== taskId));
    }
  }
}
