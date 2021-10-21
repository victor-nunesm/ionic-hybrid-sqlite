import { Capacitor } from '@capacitor/core';
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

import { DatabaseService } from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public isWeb = false;

  constructor(
    private databaseService: DatabaseService,
    private platform: Platform,
  ) {
    this.isWeb = Capacitor.getPlatform() === 'web' ? true : false;

    this.platform.ready().then(async () => {
      await this.setupDb();
    });
  }

  async setupDb() {
    await this.databaseService.createTypeORMConnection();
  }
}
