import { Component, inject, input, model, effect, signal, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Task } from '../../../models/task.model';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ProjectService } from '../../../services/project';
import { User } from '../../../models/user.model';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { TaskUpdatePayload } from '../../../services/project';
import { PopoverModule } from 'primeng/popover';
import { viewChild } from '@angular/core';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-todo-detail',
  imports: [
    Dialog,
    BadgeModule,
    AvatarModule,
    TooltipModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    EditorModule,
    FormsModule,
    Select,
    MenuModule,
    PopoverModule,
    Menu
  ],
  templateUrl: './todo-detail.html',
  styleUrl: './todo-detail.scss',
})
export class TodoDetail {
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);

  task = input<Task | null>();

  visible = model<boolean>(false);

  taskUpdated = output<Task>();
  taskCloned = output<Task>();
  taskArchived  = output<number>();

  userAssigned = signal<User[] | null>(null);
  editMode = signal(false);
  todoActionsMenu = viewChild.required<Menu>('todoActons');
  
  items = [
    {
      label: 'Cloner',
      icon: 'pi pi-clone',
      command: () => {
        const task = this.selectedTaskForMenu();
        if (task) {
          this.cloneTask(task.id);
        }
      }
    },
    {
      label: 'Archiver',
      icon: 'pi pi-inbox',
      command: () => {
        const task = this.selectedTaskForMenu();
        if (task) {
          this.archiveTask();
        }
      }
    }
  ];

  selectedTaskForMenu = signal<Task | null>(null);

  statusOptions = [
    { label: 'À faire', value: 0 },
    { label: 'En cours', value: 2 },
    { label: 'À tester', value: 4 },
    { label: 'Terminé', value: 1 },
  ];

  form = this.fb.group({
    title: ['', Validators.required],
    status: [0, Validators.required],
    due_date_format: [null as Date | null],
    progress: [0, [Validators.min(0), Validators.max(100)]],
    description: [''],
  });

  colors = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  selectedColor = signal<string>('#3b82f6');
  selectedSeverity = signal<string>('medium');
  selectedProgress = signal<number>(0);

  severities = this.projectService.severities;
  progress = this.projectService.progress;

  constructor() {
    effect(() => {
      const currentTask = this.task();
      if (!currentTask) {
        this.userAssigned.set(null);
        return;
      }

      this.projectService.getUsersByTask(currentTask.id).then(users => {
        this.userAssigned.set(users);
      });
    });

    effect(() => {
      const currentTask = this.task();
      this.editMode.set(false);

      if (currentTask) {
        this.syncFormWithTask(currentTask);
        this.selectedSeverity.set(currentTask.severity ?? 'medium');
        this.selectedColor.set(currentTask.color ?? '#3b82f6');
        this.selectedProgress.set(currentTask.progress ?? 0);
      }
    });
  }

  async cloneTask(id: number) {
    try {
      const cloned = await this.projectService.cloneTask(id);
      this.taskCloned.emit(cloned);
      this.visible.set(false);
    } catch (e) {
      // gérer l'erreur (toast par ex.)
    }
  }

  async archiveTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    try {
      await this.projectService.updateTask(currentTask.id, { shared: 0 });
      this.taskArchived.emit(currentTask.id);
      this.visible.set(false);
    } catch (e) {
      // gérer l'erreur
    }
  }

  openTaskMenu(event: Event, task: Task | null | undefined) {
    if (!task) return;
    this.selectedTaskForMenu.set(task);
    this.todoActionsMenu().toggle(event);
  }

  severityColor(value: string): string {    
    return this.projectService.severities.find(s => s.value === value)?.color ?? '#94a3b8';
  }

  async selectSeverity(value: string) {
    const currentTask = this.task();
    if (!currentTask) return;

    const previous = this.selectedSeverity();
    this.selectedSeverity.set(value);
    try {
      const updated = await this.projectService.updateTask(currentTask.id, { severity: value });
      this.taskUpdated.emit(updated);
    } catch (e) {
      this.selectedSeverity.set(previous);
    }
  }

  async selectProgress(value: number) {
    const currentTask = this.task();
    if (!currentTask) return;

    const previous = this.selectedProgress();
    this.selectedProgress.set(value);
    try {
      const updated = await this.projectService.updateTask(currentTask.id, { progress: value });
      this.taskUpdated.emit(updated);
    } catch (e) {
      this.selectedProgress.set(previous);
    }
  }

  async selectColor(color: string) {
    const currentTask = this.task();
    if (!currentTask) return;

    this.selectedColor.set(color);
    try {
      const updated = await this.projectService.updateTask(currentTask.id, { color });
      this.taskUpdated.emit(updated);
    } catch (e) {
      this.selectedColor.set(this.task()?.color ?? '#3b82f6');
    }
  }

  private syncFormWithTask(currentTask: Task): void {
    this.form.patchValue({
      title: currentTask.title,
      status: currentTask.status,
      due_date_format: this.parseDate(currentTask.due_date_format),
      progress: currentTask.progress ?? 0,
      description: currentTask.description ?? '',
    });
  }

  private parseDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }

  statusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: 'À faire',
      1: 'Terminé',
      2: 'En cours',
      4: 'À tester',
    };
    return labels[status] ?? 'Inconnu';
  }

  getUrlDolibarrTask(idTask: number): string {
    return this.projectService.getUrlDolibarrTask(idTask);
  }

  toggleEdit(): void {
    const currentTask = this.task();
    if (currentTask) {
      this.syncFormWithTask(currentTask);
    }
    this.editMode.set(!this.editMode());
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentTask = this.task();
    if (!currentTask) return;

    const formValue = this.form.getRawValue();

    const payload: TaskUpdatePayload = {
      title: formValue.title ?? undefined,
      status: formValue.status ?? undefined,
      progress: formValue.progress ?? undefined,
      description: formValue.description ?? undefined,
      due_date: formValue.due_date_format ? this.formatDate(formValue.due_date_format) : undefined,
    };

    try {
      const updatedTask = await this.projectService.updateTask(currentTask.id, payload);
      this.taskUpdated.emit(updatedTask);
      this.editMode.set(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche', error);
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}