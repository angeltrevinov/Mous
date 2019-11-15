import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './component/main.component';
import { NavbarComponent } from './navbar/navbar.component';
import {MainRoutingModule} from './main-routing.module';
import { SearchComponent } from './component/search/search.component';
import { WallComponent } from './component/wall/wall.component';
import {WallGuard} from '../guards/wall.guard';
import {ReactiveFormsModule} from '@angular/forms';
import { NotFoundComponent } from './component/not-found/not-found.component';

@NgModule({
  declarations: [
    MainComponent,
    NavbarComponent,
    SearchComponent,
    WallComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    WallGuard
  ]
})
export class MainModule { }
