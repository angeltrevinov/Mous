import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  userDetails: any;
  boolToken: boolean;

  //--------------------------------------------------------
  constructor(private router: Router) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.userDetails = JSON.parse(
      localStorage.getItem('User')
    );
    if(this.userDetails) {
      this.boolToken = true;
    } else {
      this.boolToken = false;
    }
  }

  //--------------------------------------------------------
  onLogOut() {
    localStorage.removeItem('User');
    this.router.navigate(['/Login']);
  }

}
