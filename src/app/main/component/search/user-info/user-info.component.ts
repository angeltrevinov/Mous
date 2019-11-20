import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UsersService} from '../../../../services/users.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  @Input() user: any;
  userToken;
  strMessage: string;
  strType: string;
  UserName: string;

  //--------------------------------------------------------
  constructor(
    private router: Router,
    private usersService: UsersService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.userToken = localStorage.getItem('User');
    this.UserName = localStorage.getItem('Username');
  }

  //--------------------------------------------------------
  onFollow() {

    if (!this.userToken) {
      this.router.navigate(['/Login']);
    } else {
      this.usersService.Follow(this.user._id).subscribe((result: any) => {
        this.user.bFollowing = true;
        this.strMessage = result.message;
        this.strType = 'primary';
      }, (error) => {
        this.strMessage = error.error.message;
        this.strType = 'danger';
      });
      this.strMessage = '';
      this.strType = '';
    }
  }

  //--------------------------------------------------------
  onUnFollow() {
    if (!this.userToken) {
      this.router.navigate(['/Login']);
    } else {
      this.usersService.Unfollow(this.user._id).subscribe((result: any) => {
        this.user.bFollowing = false;
        this.strMessage = result.message;
        this.strType = 'primary';
      }, (error) => {
        this.strMessage = error.error.message;
        this.strType = 'danger';
      });
    }
    this.strMessage = '';
    this.strType = '';
  }

}
