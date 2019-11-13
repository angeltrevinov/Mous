import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../../services/users.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  loginForm: FormGroup;
  strMessage: string;
  strType: string;

  //--------------------------------------------------------
  constructor(
    private usersService: UsersService,
    private router: Router
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.loginForm = new FormGroup({
      Email: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.email
        ]
      }),
      Password: new FormControl(null, {
        validators: [
          Validators.required
        ]
      })
    });
  }

  /* Methods to get forms values */
  //--------------------------------------------------------
  get Email() { return this.loginForm.get('Email'); }
  //--------------------------------------------------------
  get Password() { return this.loginForm.get('Password'); }

  //--------------------------------------------------------
  onLogin() {
    this.usersService.Login(
      this.Email.value,
      this.Password.value
    ).subscribe((result: any) => {
      localStorage.setItem('User', JSON.stringify(result));
      this.router.navigate(['/']);
    }, (error) => {
      this.strMessage = error.error.message;
      this.strType = 'danger';
    });
    this.strMessage = '';
    this.strType = '';
  }
}
