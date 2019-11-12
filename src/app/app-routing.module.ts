import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LogInComponent} from './components/log-in/log-in.component';
import {SingUpComponent} from './components/sing-up/sing-up.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full'},
  { path: '', loadChildren: () =>
      import('./main/main.module').then(m => m.MainModule) },
  { path: 'Login', component: LogInComponent },
  { path: 'Singup', component: SingUpComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
