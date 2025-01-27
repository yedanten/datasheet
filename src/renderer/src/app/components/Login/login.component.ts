import { Component, OnInit, Input, inject, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() password: string = '';
  @Output() passwordChange = new EventEmitter();

  showFailed = false;
  firstStartup = false;

  onNameChange(event: any) {
    this.password = event.target.value;
  }

  constructor(public router: Router) { }

  ngOnInit() {
    const p = window.electronAPI.onFirstStartup();

    p.then((value) => {
      this.firstStartup = value;
    })
  }

  async getVal() {
    const result = await window.electronAPI.onVerifyPassword(this.password);
    if (result) {
      this.router.navigateByUrl('home');
    } else {
      this.showFailed = true;
    }
  }
}
