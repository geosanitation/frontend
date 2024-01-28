import { Component } from '@angular/core';

@Component({
  selector: 'geosanitation-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Support this project on <b><a href="https://github.com/geosanitation/frontend" target="_blank">github</a>.</b><br>
    </span>
    <div class="socials">
      <a href="https://github.com/geosanitation" target="_blank" class="ion ion-social-github"></a>
    </div>
  `,
})
export class FooterComponent {
}
