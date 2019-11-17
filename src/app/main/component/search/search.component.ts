import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../../../services/users.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchTerm: string;
  searchForm: FormGroup;
  searchResult: any [];
  boolShowSpinner: boolean;

  //--------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.route.paramMap.subscribe((result: ParamMap) => {
      this.searchTerm = result.get('term');
    });
    this.boolShowSpinner = true;
    this.formCreation();
    this.DataToSearch.setValue(this.searchTerm);
    this.usersService.Search(this.searchTerm)
      .subscribe((result: any) => {
        this.searchResult = result.searchResult;
        this.boolShowSpinner = false;
      }, (error) => {
        console.log(error);
        this.boolShowSpinner = false;
    });
  }

  /* FORM */
  //--------------------------------------------------------
  formCreation() {
    this.searchForm = new FormGroup({
      dataToSearch: new FormControl(null, {
        validators: [
          Validators.required
        ]
      })
    });
  }
  //--------------------------------------------------------
  get DataToSearch() { return this.searchForm.get('dataToSearch'); }
  //--------------------------------------------------------
  onSearch() {
    if (!this.searchForm.invalid) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.navigate(['/Search', this.DataToSearch.value]);
    }
  }

}
