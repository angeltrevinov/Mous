import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  userDetails: any;
  boolToken: boolean;
  searchForm: FormGroup;

  //--------------------------------------------------------
  constructor(
    private router: Router
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.validateToken();
    this.formCreation();
  }

  //--------------------------------------------------------
  onLogOut() {
    localStorage.removeItem('User');
    this.router.navigate(['/Login']);
  }

  //--------------------------------------------------------
  validateToken() {
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
  formCreation() {
    this.searchForm = new FormGroup({
      SearchTerm: new FormControl(null, {
        validators: [
          Validators.required
        ]
      })
    });
  }

  //--------------------------------------------------------
  get SearchTerm() { return this.searchForm.get('SearchTerm'); }

  //--------------------------------------------------------
  onSearch() {
    if (!this.searchForm.invalid) {
      this.router.navigate(['/Search', this.SearchTerm.value]);
    }
  }

}
