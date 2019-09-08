import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordComponent } from './password/password.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AuthPlaceholderComponent } from './auth-placeholder/auth-placeholder.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  declarations: [PasswordComponent, LoginComponent, LogoutComponent, AuthPlaceholderComponent]
})
export class AuthModule { }
