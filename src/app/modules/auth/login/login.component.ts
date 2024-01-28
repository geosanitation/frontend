import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from "angular-notifier";
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';
import { catchError, EMPTY, ReplaySubject, switchMap, takeUntil, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../../data/store/store.service';
import {
  NbAuthComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
} from '@nebular/auth';
import { NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /** form for login */
  loginForm: FormGroup = this.fb.group({})
  
  /**
  * control password field and login
  */
 onLoginInstance: () => void;
 public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    public authService: AuthService,
    public store: StoreService,
    private router: Router,
    private toastrService: NbToastrService
  ) {

    this.loginForm = this.fb.group({
      email: [
        null,
        {
          validators: Validators.compose([Validators.required, Validators.email]),
        },
      ],
      password: [
        null,
        {
          validators: [Validators.required, Validators.minLength(4)],
        },
      ],
    });

    const onLogin: ReplaySubject<void> = new ReplaySubject<void>(1);
    this.onLoginInstance = () => {
      onLogin.next();
    };

    onLogin
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          this.loginForm.disable({emitEvent: false});
          return this.authService
            .login(
              this.loginForm.get("email").value,
              this.loginForm.get("password").value
            )
            .pipe(
              catchError((error: HttpErrorResponse) => {
                this.loginForm.enable({emitEvent: false});
                let positions = NbGlobalPhysicalPosition;
                this.toastrService.danger(
                  this.translate.instant(
                    error.status == 401
                      ? "login.wrong_password"
                      : "login.impossible_to_connect"
                  ),
                  this.translate.instant("error"),
                  {position: positions.BOTTOM_LEFT, duration: 5000}
                );
                return EMPTY;
              }),
              switchMap(() => {
                return this.store.loadUser();
              }),
              tap((user) => {
                this.router.navigate(["home"]);
              })
            );
        })
      )
      .subscribe();

   }

  ngOnInit(): void {
  }

  /**
   * on destroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
