import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncPageComponent } from './sync-page/sync-page.component';
import { SyncService } from './sync.service';
import { SyncWidgetComponent } from '../sync-widget/sync-widget.component';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  entryComponents: [SyncPageComponent],
  declarations: [SyncPageComponent, SyncWidgetComponent],
  providers: [SyncService]
})
export class SyncModule { }
