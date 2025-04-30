import { ApplicationConfig } from '@angular/core';
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptorService } from './core/auth/auth-interceptor.service';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, inMemoryScrollingFeature),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(),withInterceptorsFromDi()),
    ConfirmationService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
};
