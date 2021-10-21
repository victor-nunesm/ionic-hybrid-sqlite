import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';

import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Author } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public connection$: Observable<Connection>;
  public platform$: BehaviorSubject<string>;
  public native$: BehaviorSubject<boolean>;
  public get platform() {
    return this.platform$.value;
  }
  public get native() {
    return this.native$.value;
  }
  private _connection$ = new BehaviorSubject<Connection>(null);

  constructor() {
    const platform = Capacitor.getPlatform();
    this.platform$ = new BehaviorSubject(platform);
    if (platform === 'ios' || platform === 'android') {
      this.native$ = new BehaviorSubject(true);
    } else {
      this.native$ = new BehaviorSubject(false);
    }
    this.connection$ = this._connection$.asObservable().pipe(filter(v => !!v));
  }

  async createTypeORMConnection(): Promise<Connection> {
    try {
      const sqlite = new SQLiteConnection(CapacitorSQLite);

      if (this.platform === 'ios' || this.platform === 'android') {
        try {
          await sqlite.closeAllConnections();
          await sqlite.closeConnection('test_db');
        } catch (error) { }
      } else if (this.platform === 'web') {
        await customElements.whenDefined('jeep-sqlite');
        const jeepSqliteEl = document.querySelector('jeep-sqlite');
        if (jeepSqliteEl != null) {
          await sqlite.initWebStore();

          console.log(`jeepSqlite store is open: ${await jeepSqliteEl.isStoreOpen()}`);
        }
      }

      const webConfig: ConnectionOptions = {
        type: 'sqljs',
        autoSave: true,
        location: 'test_db',
        logging: ['error', 'query', 'schema'],
        synchronize: true,
        entities: [
          Author,
        ]
      };
      const mobileConfig: ConnectionOptions = {
        type: 'capacitor',
        database: 'test_db',
        driver: sqlite,
        logging: ['error', 'query', 'schema'],
        synchronize: true,
        version: 1,
        entities: [
          Author,
        ]
      };

      const connection = await createConnection(this.platform === 'web' ? webConfig : mobileConfig);
      this._connection$.next(connection);
      return connection;
    } catch (err) {
      return err;
    }
  }

  public getRepository$(repository: 'author' | '') {
    return this.connection$.pipe(
      map(connection => connection.getRepository(Author))
    );
  }
}
