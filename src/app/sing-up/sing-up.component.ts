import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.component.html',
  styleUrls: ['./sing-up.component.css']
})
export class SingUpComponent implements OnInit {

  singupForm: FormGroup;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
    this.singupForm = new FormGroup({
      Name: new FormControl(null, {
        validators: [
          Validators.required
        ]
      }),
      Username: new FormControl(null, {
        validators: [
          Validators.required
        ]
      }),
      Email: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.email
        ]
      }),
      Password: new FormControl(null, {
        validators: [
          Validators.required,
        ]
      })
    });
  }

  /* Methods to get forms values */
  //--------------------------------------------------------
  get Name() { return this.singupForm.get('Name'); }
  //--------------------------------------------------------
  get Username() { return this.singupForm.get('Username'); }
  //--------------------------------------------------------
  get Email() { return this.singupForm.get('Email'); }
  //--------------------------------------------------------
  get Password() { return this.singupForm.get('Password'); }

  //--------------------------------------------------------
  onSingUp() {
    console.log('here');
  }
}