import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {
  installChunkLoadRecovery,
  recoverFromChunkLoadError,
} from './app/core/utils/chunk-load-recovery';

installChunkLoadRecovery();
bootstrapApplication(App, appConfig).catch((err) => {
  recoverFromChunkLoadError(err);
  console.error(err);
});
