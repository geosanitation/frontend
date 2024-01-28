import { Component } from "@angular/core";
import { NbMenuItem } from "@nebular/theme";
import { StoreService } from "../../data/store/store.service";

@Component({
  selector: "app-content-layout",
  templateUrl: "./content-layout.component.html",
  styleUrls: ["./content-layout.component.scss"],
})
export class ContentLayoutComponent {
  menu : NbMenuItem[] = [
    {
      title: 'Accueil',
      icon: 'home-outline',
      link: '/home',
      home: true,
    }, 
    // {
    //   title: 'Actualités',
    //   icon: 'globe-outline',
    //   link: '/pages/dashboard',
    //   hidden: true
    // }, 
    // {
    //   title: 'Statistiques',
    //   icon: 'pie-chart-outline',
    //   link: '/pages/dashboard',
    //   hidden: true
    // },
    {
      title: 'Carte thématiques',
      icon: 'map-outline',
      link: '/map',
    },
    {
      title: 'Données thématiques',
      icon: 'layers-outline',
      link: '/groups'
    },
    {
      title: 'Risques & Aléas',
      icon: 'alert-triangle-outline',
      children: [
        {
          title: 'InstaMap',
          link: '/risks-hazards/instamap',
        },
        // {
        //   title: 'Alertes',
        //   link: '/pages/maps/leaflet',
        // },
        // {
        //   title: 'Diagnostic d\'éxposition',
        //   link: '/pages/maps/leaflet',
        // }
      ]
    },
    {
      title: 'Acteurs',
      icon: 'people-outline',
      // expanded: true,
      children: [
        {
          title: 'Organismes',
          link: '/actors/organizations',
        },
        // {
        //   title: 'Liste des acteurs',
        //   link: '',
        //   hidden: true
        // }
      ]
    },
    // {
    //   title: 'Documentation',
    //   icon: 'book-outline',
    //   expanded: true,
    //   hidden: true,
    //   children: [
    //     {
    //       title: 'Outils de plannification',
    //       link: '',
    //     },
    //     {
    //       title: 'Textes et lois',
    //       link: '',
    //     },
    //     {
    //       title: 'Projets',
    //       link: '',
    //     },
    //     {
    //       title: 'Autres',
    //       link: '',
    //     },
    //     {
    //       title: 'Manuel du géoportail',
    //       link: '',
    //     },
  
    //   ]
    // },
  ];
  constructor(public store: StoreService) {}
}
