import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/Home/home.component';
import { DuplicateComponent } from './components/duplicate/duplicate.component';
import { ModalComponent } from './components/modal/modal.component';

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
    HomeComponent,
    DuplicateComponent,
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
