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
  searchResult = [];
  boolShowSpinner: boolean;
  intPage: number;
  intCount: number;
  boolEndOFPage: boolean;

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
    this.formCreation();
    this.DataToSearch.setValue(this.searchTerm);
    this.intPage = 0;
    this.intCount = 3;
    this.callSearchService();
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

  //--------------------------------------------------------
  onShowMore() {
    this.callSearchService();
  }

  //--------------------------------------------------------
  callSearchService() {
    this.boolShowSpinner = true;
    this.usersService.Search(this.searchTerm, this.intPage, this.intCount)
      .subscribe((result: any) => {
        this.intPage = this.intPage + this.intCount;
        this.searchResult = this.searchResult.concat(result.searchResult);
        this.boolShowSpinner = false;
        this.boolEndOFPage = result.bEnd;
      }, (error) => {
        this.boolShowSpinner = false;
      });
  }
}
