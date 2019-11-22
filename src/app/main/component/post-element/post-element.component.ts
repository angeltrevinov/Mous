import {Component, Input, OnInit} from '@angular/core';
import {PostService} from '../../../services/post.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-post-element',
  templateUrl: './post-element.component.html',
  styleUrls: ['./post-element.component.css']
})
export class PostElementComponent implements OnInit {

  @Input() Post: any;

  //--------------------------------------------------------
  constructor(
    private postService: PostService,
    private router: Router
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
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

  //--------------------------------------------------------
  GoToDetails() {
    this.router.navigate(['/Post', this.Post._id]);
  }

}
