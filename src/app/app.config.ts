import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { AuthService } from './services/auth';
import { provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

function initAuth(authService: AuthService) {
  return () => authService.init(); // bloque le démarrage jusqu'à résolution
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark', // sélecteur custom
        },
      },
      translation: {
          dateFormat: 'dd/mm/yy',
          startsWith: 'Commence par',
          contains: 'Contient',
          notContains: 'Ne contient pas',
          endsWith: 'Se termine par',
          equals: 'Égal à',
          notEquals: 'Différent de',
          noFilter: 'Aucun filtre',
          lt: 'Inférieur à',
          lte: 'Inférieur ou égal à',
          gt: 'Supérieur à',
          gte: 'Supérieur ou égal à',
          dateIs: 'Date égale à',
          dateIsNot: 'Date différente de',
          dateBefore: 'Avant le',
          dateAfter: 'Après le',
          clear: 'Effacer',
          apply: 'Appliquer',
          matchAll: 'Correspond à tous',
          matchAny: 'Correspond à au moins un',
          addRule: 'Ajouter une règle',
          removeRule: 'Supprimer la règle',
          accept: 'Oui',
          reject: 'Non',
          choose: 'Choisir',
          upload: 'Téléverser',
          cancel: 'Annuler',
          emptyMessage: 'Aucun résultat trouvé',
          emptyFilterMessage: 'Aucun résultat trouvé',
          dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
          dayNamesShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
          dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
          monthNames: [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ],
          monthNamesShort: [
            'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
            'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
          ],
          today: "Aujourd'hui",
        }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.init(),
      deps: [AuthService],
      multi: true,
    }
    
  ]
};
