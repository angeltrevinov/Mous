import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../../services/users.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  boolToken: boolean;
  userInfo: any;
  searchForm: FormGroup;

  // --------------------------------------------------------
  constructor(
    private router: Router,
    private usersService: UsersService
  ) { }

  // --------------------------------------------------------
  ngOnInit() {
    this.validateToken();
    this.formCreation();
  }

  // --------------------------------------------------------
  onLogOut() {
    localStorage.removeItem('User');
    this.router.navigate(['/Login']);
  }

  // --------------------------------------------------------
  validateToken() {
    if (localStorage.getItem('User')) {
      this.boolToken = true;
      this.usersService.GetLogInInfo().subscribe((result) => {
        this.userInfo = result;
      });
    } else {
      this.boolToken = false;
    }
  }

  // --------------------------------------------------------
  formCreation() {
    this.searchForm = new FormGroup({
      SearchTerm: new FormControl(null, {
        validators: [
          Validators.required
        ]
      })
    });
  }

  // --------------------------------------------------------
  get SearchTerm() { return this.searchForm.get('SearchTerm'); }

  // --------------------------------------------------------
  onSearch() {
    if (!this.searchForm.invalid) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.navigate(['/Search', this.SearchTerm.value]);
      this.SearchTerm.setValue('');
    }
  }

}
