import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './main/main.component';
import {SearchComponent} from './main/search/search.component';

const routes: Routes = [
  { path: '', component: MainComponent, children: [
      {path: '', redirectTo: 'Search', pathMatch: 'full'},
      {path: 'Search', component: SearchComponent }
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
