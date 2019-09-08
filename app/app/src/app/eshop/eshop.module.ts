import { DatabaseService } from './database.service';

import { EshopEngine } from './engine.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    EshopEngine,
    DatabaseService
  ]
})
export class EshopModule { }
