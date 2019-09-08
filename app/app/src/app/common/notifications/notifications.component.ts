// A component showing small warning windows on the top right corner
import { NotificationsService, Notification } from './../../utils/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
    constructor(
        private notificationService: NotificationsService,
        private router: Router,
        private translate: TranslateService,
    ) {
    }
    ngOnInit() {
        this.notificationService.message.subscribe(
            res => {
                this.showMessage(res);
            }
        )
    }
    showMessage(data: Notification) {
        let $this = this;
        var error = document.createElement('DIV');
        if (data.message.length)
            this.translate.get(data.message).subscribe((translated: string) => {
                data.message = translated;
            });
        if (data.header.length)
            this.translate.get(data.header).subscribe((translated: string) => {
                data.header = translated;
            });
        error.classList.add('notification', 'error', 'ns-box', 'ns-growl', 'ns-effect-genie', 'ns-type-notice', 'ns-show');
        error.innerHTML = `
            <div class="ns-box-inner">
                <p>
                   ${data['header']}
                   <br />
                   ${data['message']}
                </p>
            </div>
        `;
        document.getElementById('notifications_container').appendChild(error);
        error.addEventListener('click', function () {
            if (data.link && data.link.length) {
                $this.router.navigateByUrl(data.link);
                this.remove();
            }
            else
                this.remove();
        })
        setTimeout(() => {
            error.remove();
        }, 3500);
    }
}