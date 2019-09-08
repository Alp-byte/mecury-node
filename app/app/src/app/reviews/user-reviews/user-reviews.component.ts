import { reviewURL } from './../write-review/write-review.component';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { GlobalService } from './../../utils/global.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.css']
})
export class UserReviewsComponent {
    reviews = [];
    myAddress = this.gs.wallet.address;
    othersAddress;
    rating = 0;
    constructor(
        private gs: GlobalService,
        private http: Http,
        private route: ActivatedRoute
    ) {
        route.params.subscribe(data => {
            this.othersAddress = data['address'];
        })

    }
    ngOnInit() {
        this.gs.reviewSeen.emit();
        this.http.get(reviewURL + 'cats/'+this.othersAddress).map(res => res.json()).subscribe(res => {
            this.reviews = res;
            this.reviews.forEach((item, index) => {
                this.rating += item.stars
            })
            this.rating = this.rating / this.reviews.length;
        });
    }
}