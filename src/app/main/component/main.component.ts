import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  boolSingIn: boolean;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
    if (localStorage.getItem('User')) {
      this.boolSingIn = true;
    } else {
      this.boolSingIn = false;
    }
  }

}
