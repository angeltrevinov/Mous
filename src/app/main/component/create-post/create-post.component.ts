import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {mimeType} from './mime-type.validator';
import {invalid} from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  createForm: FormGroup;
  myImagePreview: any = [];
  arrFiles = [];

  //--------------------------------------------------------
  constructor() { }

  //--------------------------------------------------------
  ngOnInit() {
    this.createForm = new FormGroup({
      Description: new FormControl(null, {
        validators: [
          Validators.required,
        ]
      }),
      Images: new FormControl(null, {
        validators: [
          Validators.required,
        ],
        asyncValidators: [mimeType]
      }),
      DatePublish: new FormControl(null, {
        validators: [
          Validators.required,
        ]
      })
    });
  }

  /* Method to get forms values */
  //--------------------------------------------------------
  get Description() { return this.createForm.get('Description'); }
  //--------------------------------------------------------
  get Images() { return this.createForm.get('Images'); }

  //--------------------------------------------------------
  onCancel() {
    this.createForm.reset();
    this.myImagePreview = [];
    this.arrFiles = [];
  }

  //--------------------------------------------------------
  onImagePick(event: Event) {

    if(this.arrFiles.length < 5) {
      const file = (event.target as HTMLInputElement).files[0];
      if(file) {
        this.arrFiles.push(file);
      }
      this.createForm.patchValue({ Images: this.arrFiles});
      this.Images.updateValueAndValidity();
      if(this.Images.invalid) {
        this.arrFiles.pop();
        this.createForm.patchValue({ Images: this.arrFiles});
      }
      this.arrFiles.forEach((doc) => {
        const reader = new FileReader();
        this.myImagePreview.splice(0);
        reader.onload = () => {
          this.myImagePreview.push(reader.result);
        };
        reader.readAsDataURL(doc);
      });
    }
  }
}
