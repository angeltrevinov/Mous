import { Component, OnInit } from '@angular/core';
import {PostService} from '../../../services/post.service';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.css']
})
export class WallComponent implements OnInit {

  boolShowSpinner: boolean;
  intPage: number;
  intCount: number;
  boolEndOfPage: boolean;
  arrPosts: [];

  //--------------------------------------------------------
  constructor(
    private postService: PostService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.intPage = 0;
    this.intCount = 3;
    this.callPostService();
  }

  //--------------------------------------------------------
  callPostService() {
    this.boolShowSpinner = true;
    this.postService.GetPostsFromWall(
      this.intPage,
      this.intCount
    ).subscribe((result) => {
      console.log(result);
    }, (error) => {
      console.log(error);
    });
  }

  //--------------------------------------------------------
  onShowMore() {
    this.callPostService();
  }

}
