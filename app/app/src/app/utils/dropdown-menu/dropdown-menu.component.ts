import { Component, OnInit, EventEmitter, NgZone, Output, Input } from '@angular/core';
import * as $ from 'jquery';
export interface Dropdown {
    name: string,
    code?: string,
    type?: 'asc' | 'desc',
    active?: boolean
}
@Component({
  selector: 'dropdown',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent {
    @Input('title') title: string;
    @Input('menu') menu: Array<Dropdown>;
    @Output('clicked') clicked: EventEmitter<Dropdown>;
    private  activeItem;
    public opened;
    constructor(
        private zone: NgZone
    ) {
        this.clicked = new EventEmitter<Dropdown>(true);
    }

    public _clicked(i): void {
        this.menu.forEach(item => item.active = false)
        this.menu[i].active = true;
        this.activeItem = this.menu[i];
        $('#title').click();
        this.clicked.emit(this.menu[i]);
        if(this.opened) {
          this.opened = false
        }
    }

    public change($event) {

    }

    public closeMenu() {
        $('#title').click();
    }

}
