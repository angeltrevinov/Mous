import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-creator-post',
  templateUrl: './creator-post.component.html',
  styleUrls: ['./creator-post.component.css']
})
export class CreatorPostComponent implements OnInit {

  @Input() Creator: any;
  @Input() strDate;
  datePublished: Date;

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
    this.datePublished = new Date(this.strDate);
  }

}
