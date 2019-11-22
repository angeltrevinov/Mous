import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LogInComponent} from './components/log-in/log-in.component';
import {SingUpComponent} from './components/sing-up/sing-up.component';
import {RegistrationGuard} from './guards/registration.guard';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full'},
  { path: 'Login', component: LogInComponent, canActivate: [RegistrationGuard] },
  { path: 'Singup', component: SingUpComponent, canActivate: [RegistrationGuard] },
  { path: '', loadChildren: () =>
      import('./main/main.module').then(m => m.MainModule) }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
