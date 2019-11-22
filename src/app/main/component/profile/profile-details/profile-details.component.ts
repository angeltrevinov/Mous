import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, OnChanges {

  @Input() User: any;
  boolRecievedUser = false;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
  }

  //--------------------------------------------------------
  ngOnChanges(changes: SimpleChanges): void {
    if(this.User) {
      this.boolRecievedUser = true;
    }
  }

}
