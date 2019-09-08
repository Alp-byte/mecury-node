import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Injectable()
export class ModalService {

  bsModalRef: BsModalRef;

  config = {
    keyboard: false,
    ignoreBackdropClick: true
  };

  constructor(private modalService: BsModalService) {}

  openModalWithComponent(ModalContentComponent) {
    this.bsModalRef = this.modalService.show(ModalContentComponent, this.config);
  }

  hide() {
    this.bsModalRef.hide();
  }
}
