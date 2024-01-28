# Geosanitation Project

Welcome to the Geosanitation Project! This portal is dedicated to stakeholders and citizens, aiming to facilitate decision-making on urban water management.

You can access a demo version of the project at https://demo.geo-sanitation.com. Currently, the root URL redirects to `/risks-hazards/instamap` for the Instamap demonstration 😁.

![geosanitation-instamap](https://github.com/geosanitation/frontend/assets/43842786/06e0b195-c589-4208-8553-a6cc7364c34a)

## Background

This demo is a part of a doctoral research project. For a comprehensive understanding of the project, you can read the research paper [here](https://drive.google.com/file/d/1_ohLthgQ5QWRyC5iMCMRe_V---UiQnsa/view?usp=sharing) (in french). Additionally, if you're interested specifically in the feasibility study, it's available [here](https://drive.google.com/file/d/1JvJ6es_IOjwLTdyjeZfOz6WQ6fG4rM81/view?usp=sharing) (in french).

## How to Run Locally

***Requirements: Node v18+, Angular CLI v13+***
```sh
$ npm install
$ ng serve
```
Navigate to http://localhost:4200/ in your web browser to view the project locally.

To build the project, use:
```sh
$ ng build
```
The backend code for this project is stored in a private repository. However, you can utilize the preprod environments as a backend to access data. Simply copy the content of environment.preprod.ts and replace the content of environment.ts.

### Basemaps

To integrate basemaps, you'll need your own MapTiler key. If you don't have one yet, log in to https://cloud.maptiler.com/ and create a new key in the `API Keys` tab. Then, paste the key in `mapTilerKey` variable in all your environments files.

## How to Contribute

- Star the GitHub repo :star:
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:
- Follow me on [Twitter](https://twitter.com/Xpirix3) :feet:

## Credits

### Special Thanks to...

- [data-osm](https://github.com/data-osm) and the wonderfull project of Karl Tayou
- [ngx-admin](https://github.com/akveo/ngx-admin)
