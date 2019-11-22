import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';

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
    for(let int = 0; int < arrMedia.length; int++) {
      postData.append('image', arrMedia[int], arrMedia[int].name);
    }
    return this.http.post(BACKENDPOST + '/MakePost', postData);
  }

  //--------------------------------------------------------
  getPostsFromUser(
    strUserId: string,
    intPage: number,
    intCount: number
  ) {
    const params = new HttpParams()
      .set('userID', strUserId)
      .set('Page', intPage.toString())
      .set('Count', intCount.toString());
    return this.http.get(BACKENDPOST + '/GetPosts', {params});
  }

  //--------------------------------------------------------
  GetPostsFromWall(
    intPage: number,
    intCount: number,
  ) {
    const params = new HttpParams()
      .set('Page', intPage.toString())
      .set('Count', intCount.toString());
    return this.http.get(BACKENDPOST + '/Wall', {params});
  }

  //--------------------------------------------------------
  LikePost(
    strId: string
  ) {
    const params = new HttpParams().set('postID', strId);

    return this.http.put(BACKENDPOST + '/Like', {}, {params});
  }

  //--------------------------------------------------------
  UnlikePost(
    strId: string,
  ) {
    const params = new HttpParams().set(
      'postID',
      strId
    );
    return this.http.put(BACKENDPOST + '/Unlike', {}, {params});
  }

  //--------------------------------------------------------
  GetPostComments(
    strId: string,
    intPage: number,
    intCount: number,
  ) {
    const params = new HttpParams()
      .set('Page', intPage.toString())
      .set('Count', intCount.toString());
    return this.http.get( BACKENDPOST + '/GetPost/' + strId, {params});
  }

  //--------------------------------------------------------
  MakeComment(
    postID: string,
    strComment: string
  ) {
    const datePublished = new Date().toUTCString();
    return this.http.put(BACKENDPOST + '/MakeComment', {
      postID,
      strComment,
      datePublished
    });
  }
}
