import { AbstractControl } from "@angular/forms";
import {observable, Observable, Observer, of} from 'rxjs';
import {invalid} from '@angular/compiler/src/render3/view/util';

export const mimeType = (
  control: AbstractControl
): Promise <{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  const fnObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      control.value.forEach((doc, index) => {
        const file = doc;
        if (file) {
          const extension = file.name.split('.')[1].toLocaleLowerCase();
          switch (extension) {
            case 'jpg':
            case 'gif':
            case 'jpeg':
            case 'png':
              break;
            default:
              observer.next({ invalidMimeType: true });
              return;
              break;
          }
        }
        if (index + 1 === control.value.length) {
          observer.next(null);
        }
      });
      observer.complete();
    });
  return fnObs;
};

/*  const file = control.value;
    if ( file ) {
      const extension = file.name.split('.')[1].toLowerCase();
      if ( type.toLowerCase() !== extension.toLowerCase() ) {
        return {
          requiredFileType: true
        };
      }

      return null;
    }

    return null;
  };
* */
