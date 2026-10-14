import { Component, inject } from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme';


@Component({
  selector: 'app-settings',
  imports: [ToggleSwitchModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  themeService = inject(ThemeService);
}
