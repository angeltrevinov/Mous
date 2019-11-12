import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

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
}
