import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class WallGuard implements CanActivate {

  //--------------------------------------------------------
  constructor(private router: Router) {}

  //--------------------------------------------------------
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<boolean | UrlTree> |
    Promise<boolean | UrlTree> |
    boolean |
    UrlTree {

    if (!localStorage.getItem('User')) {
      this.router.navigate(['/Login']);
      return false;
    }

    return true;
  }
}
