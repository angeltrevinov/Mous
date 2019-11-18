import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  //--------------------------------------------------------
  constructor() {}

  //--------------------------------------------------------
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const userToken: any = JSON.parse(
      localStorage.getItem('User')
    );
    let Token = '';
    if (userToken) {
      Token = userToken.token;
      request = request.clone({
        setHeaders: {
          Authorization: ('Bearer ' + Token)
        }
      });
    } else {
      request = request.clone({
      });
    }
    return next.handle(request);
  }
}
