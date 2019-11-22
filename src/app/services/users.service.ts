import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {stringify} from 'querystring';

const BACKENDUSER = environment.MousAPI + '/user';

@Injectable()
export class UsersService {

  //--------------------------------------------------------
  constructor(private http: HttpClient) { }

  /*
  * SingUp
  * @param strName: String name of the new user
  * @param strUserName: String username of the new user
  * @param strPassword: String the password of the new user
  *
  * @return Observable of the request
  * */
  //--------------------------------------------------------
  SingUp(
    strName: string,
    strUserName: string,
    strEmail: string,
    strPassword: string
  ) {

    return this.http.post(BACKENDUSER + '/Signin', {
      strName,
      strUserName,
      strEmail,
      strPassword
    });
  }

  /*
  * Login
  *
  * @param strEmail: string with the email of the user to login
  * @param strPassword: string with the password of the user
  * */
  //--------------------------------------------------------
  Login(
    strEmail: string,
    strPassword: string
  ) {
    return this.http.post(BACKENDUSER + '/Login', {
      strEmail,
      strPassword
    });
  }

  /*
  * Search
  *
  * @strTerm: string the term to search for in user
  * @intPage: number the page we want to show
  * @intCount number how many results we want
  * */
  //--------------------------------------------------------
  Search(
    strTerm: string,
    intPage: number,
    intCount: number
  ) {
    const params = new HttpParams()
      .set('toSearch', strTerm)
      .set('Page', intPage.toString())
      .set('Count', intCount.toString());
    return this.http.get(BACKENDUSER + '/Search', {params});
  }

  /*
  * Follow
  *
  * @strUsername: string of the username to follow
  * */
  //--------------------------------------------------------
  GetLogInInfo() {
    return this.http.get(BACKENDUSER + '/getLoginInfo');
  }

  /*
  * Follow
  *
  * @_id: string of the username to follow
  * */
  //--------------------------------------------------------
  Follow(
    _id: string
  ) {
    const params = new HttpParams()
      .set('UserToFollow' , _id);
    return this.http.post(BACKENDUSER + '/Follow', {}, {params});
  }

  /*
  * UnFollow
  *
  * @_id: string of the username to unfollow
  * */
  //--------------------------------------------------------
  Unfollow(
    _id: string
  ) {
    const params = new HttpParams()
      .set('UserToUnfollow', _id);
    return this.http.post(BACKENDUSER + '/Unfollow', {}, {params});
  }

  /*
  *  getUserProfile
  *
  * @param: strUserName: string of the username
  * */
  ///-------------------------------------------------------
  GetUserProfile(
    strUserName: string
  ) {
    return this.http.get(BACKENDUSER);
  }
}
