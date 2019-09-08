import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SyncService, Sync, SYNCS } from '../sync.service';



@Component({
  selector: 'app-sync-page',
  templateUrl: './sync-page.component.html',
  styleUrls: ['./sync-page.component.css']
})
export class SyncPageComponent implements OnInit {

  syncList: Array<Sync> = SYNCS;

  constructor(
    private syncService: SyncService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {    
    this.syncService.syncList.subscribe(syncList => {
      console.log('syncList update', syncList);
      this.syncList = syncList;
      this.ref.detectChanges();
    })
  }

  

}
