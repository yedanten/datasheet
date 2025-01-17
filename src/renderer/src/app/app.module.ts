import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Component1Component } from './components/component1/component1.component';
import { Component2Component } from './components/component2/component2.component';
import { ModalComponent } from './components/modal/modal.component';
import { NavlistComponent } from './components/navlist/navlist.component';

import { HotTableModule } from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n';
import { registerAllPlugins } from 'handsontable/plugins';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

registerAllModules();
registerLanguageDictionary(zhCN);
registerAllPlugins();

@NgModule({
  declarations: [
    AppComponent,
    Component1Component,
    Component2Component,
    NavlistComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HotTableModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
