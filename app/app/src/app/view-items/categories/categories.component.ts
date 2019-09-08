import { Category, HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ViewItemsService } from '../view-items.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

    private publicCategories: Category[] = [];

    constructor(
        private router: Router,
        private translate: TranslateService,
        private http: HttpService,
        private viewItemService: ViewItemsService
    ) {

    }

    ngOnInit() {
        this.publicCategories = this.viewItemService.getPublicCategories();
        if(!this.publicCategories.length) this.publicCategories = JSON.parse(localStorage.getItem('publicCategories'))
    }

    goCat(cat) {
        this.router.navigateByUrl('/search/category/'+cat)
    }
}
