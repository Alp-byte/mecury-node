import { GlobalService } from './../../utils/global.service';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-news-detail',
    templateUrl: './news-detail.component.html',
    styleUrls: ['./news-detail.component.css']
})

export class NewsDetailComponent implements OnInit {
    private item = {};
    newsItemActive: any;
    constructor(
        private http: HttpService,
        private route: ActivatedRoute,
        private gs: GlobalService
    ) {

    }
    ngOnInit() {
//        this.gs.big(true);
        this.gs.currentNewsItem.subscribe(newsItemActive => this.newsItemActive = newsItemActive)
//        this.gs.big(false);

        //   this.route.params.map(params => params['id']).subscribe(id => {
        //       this.http.getNewsDetail(id).subscribe(res => {
//        //           this.gs.big(false);
        //           this.item = res;

        //           this.item['title']=this.message;
        //       })
        //   })

    }
}