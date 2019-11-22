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
  arrPosts = [];

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
    ).subscribe((result: any) => {
      console.log(result);
      
      this.intPage = this.intPage + 1;
      this.arrPosts = this.arrPosts.concat(result.wallResult);
      this.boolShowSpinner = false;
      this.boolEndOfPage = result.bEnd;
      console.log(this.arrPosts);

    }, (error) => {
      this.boolShowSpinner = false;
    });
  }

  //--------------------------------------------------------
  onShowMore() {
    this.callPostService();
  }

}
