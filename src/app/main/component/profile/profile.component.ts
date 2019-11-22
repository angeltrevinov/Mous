import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UsersService} from '../../../services/users.service';

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

  //--------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.route.paramMap.subscribe((result: ParamMap) => {
      this.userId = result.get('id');
    });
    this.onAskForUserDetails();
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
}
