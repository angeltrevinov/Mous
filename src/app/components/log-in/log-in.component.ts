import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../../services/users.service';

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
    private usersService: UsersService
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
    ).subscribe((result) => {
      console.log(result);
    }, (error) => {
      this.strMessage = error.error.message;
      this.strType = 'danger';
    });
    this.strMessage = '';
    this.strType = '';
  }
}
