import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';

@Component({
  selector: 'app-duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.css']
})
export class DuplicateComponent implements OnInit {
  @Input() dupobj!: any;
  /*@Output() dupobjChange = new EventEmitter();

  onNameChange(event: any) {
    this.dupobj = event.target.value;
  }*/

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