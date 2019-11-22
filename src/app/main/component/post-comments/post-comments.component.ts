import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {PostService} from '../../../services/post.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.css']
})
export class PostCommentsComponent implements OnInit {

  postId: string;
  boolShowSpinner: boolean;
  intPage: number;
  intCount: number;
  boolEndOfPage: boolean;
  arrComments = [];
  commentForm: FormGroup;


  //--------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.route.paramMap.subscribe((result: ParamMap) => {
      this.postId = result.get('id');
    });

    this.commentForm = new FormGroup({
      Comment: new FormControl(null, {
        validators: [
          Validators.required
        ]
      })
    });

    this.intPage = 0;
    this.intCount = 100;
    this.GetComment();
  }

  //--------------------------------------------------------
  get Comment() { return this.commentForm.get('Comment'); }

  //--------------------------------------------------------
  GetComment() {
    this.boolShowSpinner = true;
    this.postService.GetPostComments(
      this.postId,
      this.intPage,
      this.intCount
    ).subscribe((result: any) => {
      console.log(result);
      this.intPage = this.intPage;
      this.arrComments = [];
      this.arrComments = this.arrComments.concat(result.commentsResult);
      this.boolShowSpinner = false;
      this.boolEndOfPage = result.bEnd;
    }, (error) => {
      console.log(error);
    });
  }

  //--------------------------------------------------------
  publishComment() {
    this.postService.MakeComment(
      this.postId,
      this.Comment.value
    ).subscribe((result) => {
      this.intPage = 0;
      this.GetComment();
    }, (error) => {
      console.log(error);
    });
  }
}
