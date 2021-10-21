import { Component, OnInit, ViewChild } from '@angular/core';

import { Repository } from 'typeorm';
import { from, Observable, Subject } from 'rxjs';

import { DatabaseService } from '@core/services';

import { Author } from '@core/entities';
import { map, repeatWhen, switchMap, take, tap } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  @ViewChild(IonInput) input: IonInput;

  public form = new FormGroup({
    name: new FormControl('', Validators.required),
  });
  public get controls() {
    return this.form.controls as {
      [key: string]: FormControl;
    };
  }
  public authors$: Observable<any[]>;
  private authorsRepository: Repository<Author>;
  private reloadAuthors$ = new Subject();

  constructor(private db: DatabaseService) { }

  ngOnInit() {
    this.authors$ = this.getAuthors$();
  }

  public async createAuthor(name: string) {
    try {
      const authorsRepo = await this.getAuthorRepository();
      const author = await authorsRepo.save({
        name,
        birthdate: new Date().toISOString(),
      });
      this.form.reset();
      this.input.setFocus();
      this.reloadAuthors$.next(true);
    } catch (error) {
      console.error(error);
    }
  }

  private getAuthors$() {
    return from(this.getAuthorRepository()).pipe(
      switchMap(authors => authors.find()),
      tap(authors => console.log(authors)),
      repeatWhen(_ => this.reloadAuthors$)
    );
  }

  private async getAuthorRepository(): Promise<Repository<Author>> {
    try {
      if (this.authorsRepository) {
        return this.authorsRepository;
      } else {
        return await this.getAuthorRepository$().pipe(take(1)).toPromise();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private getAuthorRepository$() {
    return this.db.getRepository$('author')
      .pipe(tap(repo => this.authorsRepository = repo));
  }
}
