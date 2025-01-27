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
    // Angular组件初始化不能设为异步，存在未定义风险，通信是异步行为，无法使用await语法糖获取promise内的值
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
