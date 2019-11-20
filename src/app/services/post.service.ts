import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

const BACKENDPOST = environment.MousAPI + '/post';

@Injectable()
export class PostService {

  //--------------------------------------------------------
  constructor(private http: HttpClient) { }

  //--------------------------------------------------------
  createPost(
    strDescription: string,
    datePublished: string,
    arrMedia: File[]
  ) {
    const postData = new FormData();
    postData.append('strDescription', strDescription );
    postData.append('datePublished', datePublished );
    //postData.append('image', arrMedia[0], arrMedia[0].name)
    for(let int = 0; int < arrMedia.length; int++) {
      postData.append('image', arrMedia[int], arrMedia[int].name);
    }
    return this.http.post(BACKENDPOST + '/MakePost', postData);
  }
}
