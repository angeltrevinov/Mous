import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnChanges {

  /* Data to receive */
  @Input() strMessage: string;
  @Input() strType: string;

  boolShow = false;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
  }

  //--------------------------------------------------------
  ngOnChanges(changes: SimpleChanges): void {
    if (this.strMessage !== '' && this.strType !== '') {
      this.boolShow = true;
      setTimeout(function() {
        this.boolShow = false;
      }.bind(this), 3000);
    }
  }

}
