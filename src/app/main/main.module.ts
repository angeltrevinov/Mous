import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { NavbarComponent } from './navbar/navbar.component';
import {MainRoutingModule} from './main-routing.module';
import { SearchComponent } from './main/search/search.component';

@NgModule({
  declarations: [
    MainComponent,
    NavbarComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ]
})
export class MainModule { }
