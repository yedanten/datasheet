import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';

@Component({
  selector: 'app-duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.css']
})
export class DuplicateComponent implements OnInit {
  @Input() dupobj!: any;

  // 构造函数里修改变量，必须通过NgZone提升this作用域
  constructor(private ngZone: NgZone) {
    window.electronAPI.setDupObj((value: any) => {
      this.ngZone.run(() => {
        this.dupobj = value;
      });
    });
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    
  }
}