import { Component } from '@angular/core';

@Component({
  selector: 'geosanitation-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Developed by <b><a href="mailto:xpirixii@gmail.com" target="_blank">xpirix</a></b><br>
      Support this project on <b><a href="https://github.com/geosanitation/frontend" target="_blank">github</a>.</b><br>
    </span>
    <div class="socials">
      <a href="https://github.com/Xpirix" target="_blank" class="ion ion-social-github"></a>
      <a href="https://www.linkedin.com/in/xpirix" target="_blank" class="ion ion-social-linkedin"></a>
      <a href="https://twitter.com/Xpirix3" target="_blank" class="ion ion-social-twitter"></a>
    </div>
  `,
})
export class FooterComponent {
}
