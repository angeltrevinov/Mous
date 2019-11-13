import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/app.component';
import {AppRoutingModule} from './app-routing.module';
import { LogInComponent } from './components/log-in/log-in.component';
import {ReactiveFormsModule} from '@angular/forms';
import { SingUpComponent } from './components/sing-up/sing-up.component';
import {UsersService} from './services/users.service';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    SingUpComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [UsersService],
  bootstrap: [AppComponent]
})
export class AppModule { }
