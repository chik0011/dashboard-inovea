import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService  {
  isDark = signal<boolean>(JSON.parse(localStorage.getItem('darkMode') || 'false'));

  constructor() {
    effect(() => {
      document.body.classList.toggle('my-app-dark', this.isDark());
      document.querySelector(".header")?.classList.toggle('my-app-dark', this.isDark())
      document.querySelector(".content")?.classList.toggle('my-app-dark-layout', this.isDark())
      localStorage.setItem('darkMode', JSON.stringify(this.isDark()));
    });
  }

  toggle() {
    this.isDark.update(v => !v);
  }
}
