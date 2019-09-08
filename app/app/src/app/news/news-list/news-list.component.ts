import { Router } from '@angular/router';
import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { Component, OnInit, Input, NgZone } from '@angular/core';
import * as $ from 'jquery';
@Component({
    selector: 'app-news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
    private newsList = [];
    @Input() short: boolean = false;
    newsItemActive: any;
    constructor(
        private http: HttpService,
        private gs: GlobalService,
        private zone: NgZone,
        private router: Router
    ) {

    }
    ngOnInit() {
        this.gs.currentNewsItem.subscribe(newsItemActive => this.newsItemActive = newsItemActive)
//        this.gs.big(true);
        this.http.getNewsList().subscribe((res: any) => {
            this.zone.run(() => {
//                this.gs.big(false);
                this.newsList = res;
                if (this.short) this.newsList.splice(5);
            })
        })
    }
    go(newsItem) {
        newsItem.content=this.removeTags(newsItem.content);
        this.gs.changeMessage(newsItem)
        this.router.navigateByUrl('news/' + '1');
    }
    removeTags(html) {
       var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
        var tagOrComment = new RegExp(
            '<(?:'
            // Comment body.
            + '!--(?:(?:-*[^->])*--+|-?)'
            // Special "raw text" elements whose content should be elided.
            + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
            + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
            // Regular name
            + '|/?[a-z]'
            + tagBody
            + ')>',
            'gi');
            html = html.replace(/<img.+>/,"");

            var oldHtml;
            do {
                oldHtml = html;
                // html = html.replace("/<img[^>]+>/", "")
                html = html.replace(/<a\b[^>]*>(.*?)<\/a>/g, "");
                // html = html.replace(/<img.*?\/>/, '');
            } while (html !== oldHtml);

            return html;

            // html = html.replace("/<img[^>]+>/", "");
            // console.log(html.replace(/</g, '&lt;'));
            // return html.replace(/</g, '&lt;');

        }

}