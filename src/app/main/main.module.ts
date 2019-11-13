import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './component/main.component';
import { NavbarComponent } from './navbar/navbar.component';
import {MainRoutingModule} from './main-routing.module';
import { SearchComponent } from './component/search/search.component';
import { WallComponent } from './component/wall/wall.component';
import {WallGuard} from '../guards/wall.guard';

@NgModule({
  declarations: [
    MainComponent,
    NavbarComponent,
    SearchComponent,
    WallComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ],
  providers: [
    WallGuard
  ]
})
export class MainModule { }
