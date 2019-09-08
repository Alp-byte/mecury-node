// Deprecated component for notifications' icons
import { Component, Input } from "@angular/core";
@Component({
  selector: "app-notification-type-list-item",
  templateUrl: "./notification-type-list-item.component.html",
  styleUrls: ["./notification-type-list-item.component.scss"]
})
export class NotificationTypeListItemComponent {
  @Input("notification") notification;
  @Input("index") index;
}
