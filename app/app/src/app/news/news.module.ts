import { UtilsModule } from './../utils/utils.module';
import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsComponent } from './news/news.component';
import { NewsListComponent } from './news-list/news-list.component';
import { NewsDetailComponent } from './news-detail/news-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    UtilsModule
  ],
  declarations: [NewsComponent, NewsListComponent, NewsDetailComponent],
  exports: [NewsListComponent]
})
export class NewsModule { }
