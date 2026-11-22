import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  NavigationError,
  provideRouter,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { FIREBASE_CONFIG } from './core/config/firebase.config';
import { environment } from '../environments/environment';
import { recoverFromChunkLoadError } from './core/utils/chunk-load-recovery';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withNavigationErrorHandler((error: NavigationError) => {
        recoverFromChunkLoadError(error.error);
        return undefined;
      }),
    ),
    { provide: FIREBASE_CONFIG, useValue: environment.firebase },
  ],
};
