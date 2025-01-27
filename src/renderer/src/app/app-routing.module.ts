import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/Home/home.component';
import { DuplicateComponent } from './components/Duplicate/duplicate.component';
import { LoginComponent } from './components/Login/login.component';
import { authCheckGuard } from './authCheck.guard';

const routes: Routes = [
  { path:  'home', component:  HomeComponent,  canActivate: [authCheckGuard] },
  { path:  'dup', component:  DuplicateComponent },
  { path:  'login', component:  LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
