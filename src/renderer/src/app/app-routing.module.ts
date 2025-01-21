import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/Home/home.component';
import { DuplicateComponent } from './components/duplicate/duplicate.component';

const routes: Routes = [
  { path:  '', component:  HomeComponent },
  { path:  'dup', component:  DuplicateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
