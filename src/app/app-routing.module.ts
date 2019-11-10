import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LogInComponent} from './log-in/log-in.component';
import {SingUpComponent} from './sing-up/sing-up.component';

const routes: Routes = [
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
