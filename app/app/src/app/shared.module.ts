import { EshopModule } from './eshop/eshop.module';
import { NotificationsService } from './utils/notifications.service';
import { HttpService } from './utils/http.service';
import { GlobalService } from './utils/global.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ImageCropperModule } from './utils/ng2-img-cropper/src/imageCropperModule';
import { TourNgxBootstrapModule } from 'ngx-tour-ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';

@NgModule({
    exports: [
        TranslateModule,
        TourNgxBootstrapModule,
        ImageCropperModule,
        NguiAutoCompleteModule,
        RouterModule,
        FormsModule,
        EshopModule     
    ],
    providers: [
        GlobalService,
        HttpService,
        NotificationsService
    ]
  })
  export class SharedModule { }