import { GlobalService } from './../../utils/global.service';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
export const reviewURL = 'http://62.109.16.138:3003/api/';
import * as $ from 'jquery';
@Component({
  selector: 'app-write-review',
  templateUrl: './write-review.component.html',
  styleUrls: ['./write-review.component.css']
})
export class WriteReviewComponent implements OnInit {
    rating = 0;
    text = "";
    _rating(i) {
        this.rating = i;
    }
    goods_name;
    goods_address;
    person;
    from;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: Http,
        private gs: GlobalService
    ){
        this.route.params.subscribe(params => {
            this.goods_address = params['address'];
            this.goods_name = params['name'];
            this.person = params['person'];
        })
        this.from = this.gs.wallet.address;
    }

    submit() {
        let data = {
            goods_address: this.goods_address,
            goods_name: this.goods_name,
            timestamp: Date.now(),
            text: this.text,
            stars: this.rating,
            person: this.person,
            from: this.from,
            secret: this.gs.secret
        }
        this.http.post(reviewURL+'cat', data).subscribe(res => {
            this.router.navigateByUrl('/items/orders');
        })
    }

    ngOnInit(){}
}
