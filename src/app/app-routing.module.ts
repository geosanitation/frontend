import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AllAuthGuard } from './core/guard/all-auth.guard';
import { NoAuthGuard } from './core/guard/no-auth.guard';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [AllAuthGuard],
    component: ContentLayoutComponent,
    children:[
      {
        path:"",
        loadChildren: () => import('./modules/home/home.module')
          .then(m => m.HomeModule),
      }
    ]
  },
  {
    path: 'map',
    canActivate: [AllAuthGuard],
    component: ContentLayoutComponent,
    children:[
      {
        path:"",
        loadChildren: () => import('./modules/map/map.module')
          .then(m => m.MapModule),
      }
    ]
  },
  {
    path: 'groups',
    canActivate: [AllAuthGuard],
    component: ContentLayoutComponent,
    children:[
      {
        path:"",
        loadChildren: () => import('./modules/layers/layers.module')
          .then(m => m.LayersModule),
      }
    ]
  },
  {
    path: 'risks-hazards',
    canActivate: [AllAuthGuard],
    component: ContentLayoutComponent,
    children:[
      {
        path:"",
        loadChildren: () => import('./modules/risks-hazards/risks-hazards.module')
          .then(m => m.RisksHazardsModule),
      }
    ]
  },
  {
    path: 'actors',
    canActivate: [AllAuthGuard],
    component: ContentLayoutComponent,
    children:[
      {
        path:"",
        loadChildren: () => import('./modules/actors/actors.module')
          .then(m => m.ActorsModule),
      }
    ]
  },
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    component: AuthLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./modules/auth/auth.module").then((mod) => mod.AuthModule),
      },
    ],
  },
  { path: '', redirectTo: 'risks-hazards/instamap', pathMatch: 'full' },
  { path: '**', redirectTo: 'risks-hazards/instamap' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
