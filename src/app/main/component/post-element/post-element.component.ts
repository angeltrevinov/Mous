import {Component, Input, OnInit} from '@angular/core';
import {PostService} from '../../../services/post.service';

@Component({
  selector: 'app-post-element',
  templateUrl: './post-element.component.html',
  styleUrls: ['./post-element.component.css']
})
export class PostElementComponent implements OnInit {

  @Input() Post: any;

  //--------------------------------------------------------
  constructor(private postService: PostService) { }

  //--------------------------------------------------------
  ngOnInit() {
    console.log(this.Post);
  }

  //--------------------------------------------------------
  OnLike() {
    this.postService.LikePost(this.Post._id).subscribe((result) => {
      this.Post.bLike = true;
      this.Post.arrLikes++;
    }, (error) => {
      console.log(error);
    });
  }

  //--------------------------------------------------------
  OnDislike() {
    this.postService.UnlikePost(this.Post._id).subscribe((result) => {
      this.Post.bLike = false;
      this.Post.arrLikes--;
    }, (error) => {
      console.log(error);
    });
  }

}
