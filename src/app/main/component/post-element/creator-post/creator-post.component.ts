import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-creator-post',
  templateUrl: './creator-post.component.html',
  styleUrls: ['./creator-post.component.css']
})
export class CreatorPostComponent implements OnInit {

  @Input() strDate;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
  }

}
