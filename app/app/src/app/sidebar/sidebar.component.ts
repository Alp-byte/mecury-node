import { NotificationsService } from './../utils/notifications.service';
import { Router } from '@angular/router';
import { GlobalService } from './../utils/global.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
interface Navigation {
    title: string;
    type?: 'default' | 'parent' | 'heading';
    children?: Navigation[];
    link?: string;
    expanded?: boolean;
    tour?: string;
    badge?: number;
}
@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    public navigation: Navigation[];
    constructor(
        private translate: TranslateService,
        private globalService: GlobalService,
        private router: Router,
        private notifications: NotificationsService,
        private zone: NgZone,
        private ref: ChangeDetectorRef
    ) {
        //this.translate.use(this.globalService.lang);
        this.navigation = [


            // {
            //     title: 'BOOKMARKS',
            //     type: 'parent',
            //     children: [
            //         // {
            //         //     title: 'BOOKMARKS_SELLERS',
            //         //     link: '/bookmarks/sellers'
            //         // },
            //         {
            //             title: 'BOOKMARKS_ITEMS',
            //             link: '/bookmarks/items'
            //         },
            //         // {
            //         //     title: 'BOOKMARKS_ESCROW',
            //         //     link: '/bookmarks/escrow'
            //         // },
            //         // {
            //         //     title: 'BOOKMARKS_SEARCHES',
            //         //     link: '/bookmarks/saved'
            //         // }
            //     ]
            // },
            // {
            //     title: 'PROCESSING',
            //     link: '/processing'
            // },
            {
                title: 'NOTIFICATIONS',
                link: '/notifications'
            },
            // {
            //     title: 'SYNC',
            //     link: '/sync'
            // },
            // {
            //     title: 'NEWS',
            //     link: '/news'
            // },
            {
                title: 'TRANSACTIONS',
                link: '/transactions',
                tour: "transactions"
            },
            {
                title: 'REVIEWS',
                link: '/myReviews'
            },
            {
                title: 'BUY',
                type: 'heading'
            },
            {
                title: 'VIEW_ALL',
                link: '/buy/view-all',
                tour: "viewall"
            },
            {
                title: 'CATEGORIES',
                link: '/categories'
            },
            {
                title: 'MY_PURCHASES',
                link: '/buy/purchases'
            },

            // {
            //     title: 'ADVANCED_SEARCH',
            //     type: 'parent',
            //     children: [
            //         {
            //             title: 'SEARCH_BY_NAME',
            //             link: '/search/name'
            //         },
            //         {
            //             title: 'SEARCH_BY_CATEGORY',
            //             link: '/search/category'
            //         },
            //         {
            //             title: 'SEARCH_BY_TAG',
            //             link: '/search/tag'
            //         },
            //         { 
            //             title: 'SEARCH_BY_SELLER',
            //             link: '/search/seller'
            //         }
            //     ]
            // },
            {
                title: 'SELL',
                type: 'heading',
            },
            {
                title: 'LIST_NEW_ITEM',
                link: '/newitem-wizard',
                tour: "myitems"
            },
            {
                title: 'MY_ITEMS',
                type: 'parent',
                children: [
                    {
                        title: 'ACTIVE',
                        link: '/items/active'
                    },
                    {
                        title: 'PENDING',
                        link: '/items/orders'
                    },
                    {
                        title: 'SOLD',
                        link: '/items/sold'
                    },
                    {
                        title: 'EXPIRED',
                        link: '/items/expired'
                    }
                ]
            },
            {
                title: 'TOOLS',
                type: 'heading'
            },
            {
                title: 'PREFERENCES',
                link: '/preferences',
                tour: "preferences"
            },
            {
                title: 'WALLET',
                link: '/wallet'
            },
            {
                title: 'SYNC',
                link: '/sync'
            },
            {
                title: 'HOME',
                link: '/home',
                tour: "home"
            },
            {
                title: 'HELP',
                link: '/help'
            },
            {
                title: 'ALIAS',
                link: '/alias'
            }
        ];
    }
    ngOnInit() {
        // this.globalService.setLanguageEvent.subscribe(
        //     res => {
        //         this.//this.translate.use(res);
        //     }
        // )


        this.notifications.notifications.subscribe((notifications) => {
            let ordersBadges = 0;
            for (const hash in notifications['myOrders']) {
                if (notifications['myOrders'][hash]) ordersBadges++;
            }

            let purchasesBadges = 0;
            for (const hash in notifications['myPurchases']) {
                if (notifications['myPurchases'][hash]) purchasesBadges++;
            }
            let soldBadges = 0;
            for (const hash in notifications['sold']) {
                if (notifications['sold'][hash]) soldBadges++;
            }
            let expiredBadges = 0;
            for (const hash in notifications['expired']) {
                if (notifications['expired'][hash]) expiredBadges++;
            }
            this.zone.run(() => {
                this.navigation.forEach(item1 => {
                    if (item1.title == 'MY_PURCHASES') {

                        item1.badge = purchasesBadges;
                    } else if (item1.title == 'MY_ITEMS') {
                        item1.badge = ordersBadges + soldBadges + expiredBadges;
                    }
                    if (item1.children)
                        item1.children.forEach(item2 => {
                            if (item2.title == 'PENDING') {

                                item2.badge = ordersBadges;
                            } else if (item2.title == 'EXPIRED') {

                                item2.badge = expiredBadges;
                            } else if (item2.title == 'SOLD') {

                                item2.badge = soldBadges;
                            }
                        })
                })
            })

            this.ref.detectChanges();

            // this.notifications.save();


        })

        // this.assignBadges(this.globalService.badges);
        // this.globalService.menuBadges.subscribe(badges => {
        //     //TODO: seen badges
        //     this.assignBadges(badges);
        // })
        // this.globalService.reviewSeen.subscribe(() => {
        //     this.navigation[3]
        // })
    }
    sortBadges(badges) {
        badges.forEach((badge, i) => {
            if (!badge.seen) badge.seen = 0
            switch (badge.title) {
                case 'buy':
                    badges[i].title = 'PENDING';
                    break;
                case 'approve_sale':
                    badges[i].title = 'PENDING';
                    break;
                case 'reject_sale':
                    badges[i].title = 'PENDING';
                    break;
                case 'dispute_sale':
                    badges[i].title = 'PENDING';
                    break;
                case 'finalize_sale':
                    badges[i].title = 'PENDING';
                    break;
            }
        })
        return badges;
    }
    assignBadges(badges) {
        let badges1 = this.sortBadges(badges);
        setTimeout(() => badges1.forEach(badge => {
            this.navigation.forEach((navItem, navItemI) => {
                if (navItem.title == badge.title)
                    if (this.navigation[navItemI].badge) this.navigation[navItemI].badge = badge.value - badge.seen
                    else this.navigation[navItemI].badge = badge.value - badge.seen;
                if (navItem.children) {
                    navItem.children.forEach((navChild, navChildI) => {
                        if (navChild.title == badge.title) {
                            if (this.navigation[navItemI].badge) this.navigation[navItemI].badge = badge.value - badge.seen;
                            else
                                this.navigation[navItemI].badge = badge.value - badge.seen;

                            if (this.navigation[navItemI].children[navChildI].badge) {

                                this.navigation[navItemI].children[navChildI].badge = badge.value - badge.seen;
                            }
                            else {
                                this.navigation[navItemI].children[navChildI].badge = badge.value - badge.seen;
                            }
                        }
                    })
                }
            })
        }), 100);
    }
    accordeonToggle(accordeon) {
        if (!accordeon['expanded'])
            accordeon['expanded'] = true;
        else accordeon['expanded'] = false;
    }
    navigate(url) {
        $(window).scrollTop(0);
        this.router.navigateByUrl(url);
    }
}