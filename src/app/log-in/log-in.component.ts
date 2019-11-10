import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  loginForm: FormGroup;

  //--------------------------------------------------------
  constructor() { }

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
    console.log(this.Email.value);
    console.log(this.Password.value);
  }
}
