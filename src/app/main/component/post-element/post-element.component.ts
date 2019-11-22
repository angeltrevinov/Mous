import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-post-element',
  templateUrl: './post-element.component.html',
  styleUrls: ['./post-element.component.css']
})
export class PostElementComponent implements OnInit {

  @Input() Post: any;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
    console.log(this.Post);
  }

}
