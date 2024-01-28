import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  NbMediaBreakpointsService,
  NbMenuService,
  NbSidebarService,
  NbThemeService
} from "@nebular/theme";

import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { filter, map, takeUntil, tap } from "rxjs/operators";
import { UserData } from "../../../@core/data/users";
import { LayoutService } from "../../../@core/utils";
import { AuthService } from "../../../core/service/auth.service";
import { StoreService } from "../../../data/store/store.service";

@Component({
  selector: "geosanitation-header",
  styleUrls: ["./header.component.scss"],
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  themes = [
    {
      value: "default",
      name: "Light",
    },
    {
      value: "dark",
      name: "Dark",
    },
    {
      value: "cosmic",
      name: "Cosmic",
    },
    {
      value: "corporate",
      name: "Corporate",
    },
  ];

  currentTheme = "default";

  userMenu = [{ title: "Logout" }];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private authService: AuthService,
    public store: StoreService,
    public router: Router
  ) {
    this.menuService.onItemClick().pipe(
      takeUntil(this.destroy$),
      filter(({ tag }) => tag === "user-context-menu"),
      map(({ item: { title } }) => title)
    ).pipe(
      tap((title) => {
        if(title.toLowerCase()=="logout") {
          this.authService.logOut()
        }
      })
    ).subscribe();

  }

  ngOnInit() {
    // this.themeService.changeTheme('dark')
    this.currentTheme = this.themeService.currentTheme;

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService
      .onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (isLessThanXl: boolean) => (this.userPictureOnly = isLessThanXl)
      );

    this.themeService
      .onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$)
      )
      .subscribe((themeName) => (this.currentTheme = themeName));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, "menu-sidebar");
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.router.navigate(["home"])
  }

  navigateLogin() {
    this.router.navigate(["auth"])
  }
}
