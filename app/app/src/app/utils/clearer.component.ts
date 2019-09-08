import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
@Component({
    selector: 'clearer', 
    template: ''
})
export class ClearerComponent implements OnInit {
    constructor(private router: Router) {
        
    }
    @Input() redirect;

    ngOnInit() {
        if(this.redirect) this.router.navigateByUrl(this.redirect);
        else this.router.navigateByUrl('/buy/view-all');
    }
    
}