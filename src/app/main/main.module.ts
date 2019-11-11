import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { NavbarComponent } from './navbar/navbar.component';
import {MainRoutingModule} from './main-routing.module';

@NgModule({
  declarations: [
    MainComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ]
})
export class MainModule { }
