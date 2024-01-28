import { NgModule, Optional, SkipSelf } from "@angular/core";
import { TokenInterceptor } from "./interceptor/token.interceptor";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthGuard } from "./guard/auth.guard";
import { IsAdminGuard } from "./guard/is-admin.guard";
import { throwIfAlreadyLoaded } from "./guard/module-import.guard";
import { NoAuthGuard } from "./guard/no-auth.guard";

@NgModule({
  imports: [HttpClientModule],
  providers: [
    AuthGuard,
    NoAuthGuard,
    IsAdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, "CoreModule");
  }
}
