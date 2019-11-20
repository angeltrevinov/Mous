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
import { ProfileComponent } from './component/profile/profile.component';
import { UserInfoComponent } from './component/search/user-info/user-info.component';
import {SharedModule} from '../shared/shared.module';
import { CreatePostComponent } from './component/create-post/create-post.component';
import {PostService} from '../services/post.service';

@NgModule({
  declarations: [
    MainComponent,
    NavbarComponent,
    SearchComponent,
    WallComponent,
    NotFoundComponent,
    ProfileComponent,
    UserInfoComponent,
    CreatePostComponent,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    WallGuard,
    PostService
  ]
})
export class MainModule { }
