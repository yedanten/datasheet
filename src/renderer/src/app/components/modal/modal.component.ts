import { Component, OnInit, Input, inject, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styles: ``
})
export class ModalComponent implements OnInit {
  @Input() name!: string;
  @Output() nameChange = new EventEmitter();
  onNameChange(event: any) {
    this.name = event.target.value;
  }
  activeModal = inject(NgbActiveModal);

  constructor() { }

  ngOnInit() {
  }
}
