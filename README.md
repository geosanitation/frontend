# Geosanitation Project

A portal dedicated to stakeholders and citizens to facilitate decision-making on urban water management.

A demo version is running at https://demo.geo-sanitation.com.

### How to run this project on my machine ?

***Requirements: Node v18+, Angular CLI v13+***
```sh
$ npm install
$ ng serve
```
Now navigate to http://localhost:4200/ in your web browser.

To build the project, run:
```sh
$ ng build
```
The backend of this project is on a private repo. However, you can use the preprod environments as a backend to get data. Just copy the content of `environment.preprod.ts` and replace the content of `environment.ts`.

Please, feel free to contact me (xpirixii@gmail.com) for any concerns about the backend code.

Regarding the basemaps, you have use your own maptiler key. If you don't have one yet, log in to https://cloud.maptiler.com/ and create a new key in `API Keys` tab. Paste the key in `mapTilerKey` variable in all your environments files.

## How can I support this project ?

- Star the GitHub repo :star:
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:
- Follow me on [Twitter](https://twitter.com/Xpirix3) :feet:
- Contact me (xpirixii@gmail.com) for any specific questions.