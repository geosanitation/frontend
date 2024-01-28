/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  global_logo: undefined,
  primaryColor: '#023f5f',
  backendUrl:'http://localhost:8000',
  qgisServerUrl:'http://localhost:8000/api/map/wms?map=',
  frontendUrl: 'http://localhost:4200',
  mapTilerKey: '<your_maptiler_key>'
};