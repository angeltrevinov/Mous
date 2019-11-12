import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

const BACKENDUSER = environment.MousAPI;

@Injectable()
export class UsersService {

  //--------------------------------------------------------
  constructor(private http: HttpClient) { }

  /* Receives the info to create and response with a message */
  //--------------------------------------------------------
  onSingUp(
    strName: string,
    strUserName: string,
    strEmail: string,
    strPassword: string
  ) {

    return this.http.post(BACKENDUSER + '/signin', {
      strName,
      strUserName,
      strEmail,
      strPassword
    });
  }
}
