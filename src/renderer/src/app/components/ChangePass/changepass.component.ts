import { Component, OnInit, Input, inject, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-changepass',
  templateUrl: './changepass.component.html',
  styleUrls: ['./changepass.component.css']
})
export class ChangepassComponent implements OnInit {
  @Input() pass!: string;
  @Output() passChange = new EventEmitter();
  onNameChange(event: any) {
    this.pass = event.target.value;
  }
  activeModal = inject(NgbActiveModal);

  constructor() { }

  ngOnInit() {
  }
}
