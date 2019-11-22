import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {UsersService} from '../../../../services/users.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, OnChanges {

  @Input() User: any;
  boolRecievedUser = false;
  UserName: string;
  userToken;
  strMessage: string;
  strType: string;

  //--------------------------------------------------------
  constructor(
    private router: Router,
    private usersService: UsersService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.UserName = localStorage.getItem('Username');
    this.userToken = localStorage.getItem('User');
  }

  //--------------------------------------------------------
  ngOnChanges(changes: SimpleChanges): void {
    if (this.User) {
      this.boolRecievedUser = true;
    }
  }

  //--------------------------------------------------------
  onFollow() {
    if (!this.userToken) {
      this.router.navigate(['/Login']);
    } else {
      this.usersService.Follow(this.User._id).subscribe((result: any) => {
        this.User.bFollowing = true;
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
      this.usersService.Unfollow(this.User._id).subscribe((result: any) => {
        this.User.bFollowing = false;
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
