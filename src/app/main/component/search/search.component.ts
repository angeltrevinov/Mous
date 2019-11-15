import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchTerm: string;
  searchForm: FormGroup;

  //--------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  //--------------------------------------------------------
  ngOnInit() {
    this.route.paramMap.subscribe((result: ParamMap) => {
      this.searchTerm = result.get('term');
    });
    this.formCreation();
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
      this.router.navigate(['/Search', this.DataToSearch.value]);
    }
  }

}
