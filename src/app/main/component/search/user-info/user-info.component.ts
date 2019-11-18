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

  //--------------------------------------------------------
  constructor(
    private router: Router,
    private usersService: UsersService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.userToken = localStorage.getItem('User');
  }

  //--------------------------------------------------------
  onFollow() {

    if (!this.userToken) {
      this.router.navigate(['/Login']);
    } else {
      this.usersService.Follow(this.user.strUserName).subscribe((result) => {
        this.user.bFollowing = true;
        console.log(result);
      }, (error) => {
        console.log(error);
      });
    }
  }

  //--------------------------------------------------------
  onUnFollow() {
    if (!this.userToken) {
      this.router.navigate(['/Login']);
    } else {
      this.usersService.Unfollow(this.user.strUserName).subscribe((result) => {
        this.user.bFollowing = false;
        console.log(result);
      }, (error) => {
        console.log(error);
      });
    }
  }

}
