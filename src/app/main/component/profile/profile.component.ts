import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UsersService} from '../../../services/users.service';
import {PostService} from '../../../services/post.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userId: string;
  User: any;
  boolShowSpinnerDetails: boolean;
  boolError = false;
  intPage: number;
  intCount: number;
  boolEndOfPage: boolean;
  boolShowSpinnerPosts: boolean;
  arrPosts = [];

  //--------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private postService: PostService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.route.paramMap.subscribe((result: ParamMap) => {
      this.userId = result.get('id');
    });
    this.onAskForUserDetails();
    this.intPage = 0;
    this.intCount = 3;
    this.callPostService();
  }

  //--------------------------------------------------------
  onAskForUserDetails() {
    this.boolShowSpinnerDetails = true;
    this.usersService.GetUserProfile(this.userId).subscribe((result) => {
      this.User = result;
      this.boolShowSpinnerDetails = false;
    }, (error) => {
      this.boolError = true;
      this.boolShowSpinnerDetails = false;
    });
  }

  //--------------------------------------------------------
  onShowMore() {
    this.callPostService();
  }

  //--------------------------------------------------------
  callPostService() {
    this.boolShowSpinnerPosts = true;
    this.postService.getPostsFromUser(
      this.userId,
      this.intPage,
      this.intCount
    ).subscribe((result: any) => {
      this.intPage = this.intPage + this.intCount;
      this.arrPosts = this.arrPosts.concat(result.userPosts);
      this.boolShowSpinnerPosts = false;
      this.boolEndOfPage = result.bEnd;
    }, (error) => {
      this.boolShowSpinnerPosts = false;
    });
  }
}
