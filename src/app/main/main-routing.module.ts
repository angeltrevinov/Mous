import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './component/main.component';
import {SearchComponent} from './component/search/search.component';
import {WallComponent} from './component/wall/wall.component';
import {WallGuard} from '../guards/wall.guard';

const routes: Routes = [
  { path: '', component: MainComponent, children: [
      {path: '', redirectTo: 'Wall', pathMatch: 'full'},
      {path: 'Wall', component: WallComponent, canActivate: [WallGuard] },
      {path: 'Search/:term', component: SearchComponent }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class MainRoutingModule { }
