import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyReviewsComponent } from './my-reviews/my-reviews.component';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';
import { WriteReviewComponent } from './write-review/write-review.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [MyReviewsComponent, UserReviewsComponent, WriteReviewComponent]
})
export class ReviewsModule { }
