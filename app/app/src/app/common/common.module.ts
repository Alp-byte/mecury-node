import { GasService } from './gas.service';
import { UtilsModule } from './../utils/utils.module';
import { TruncatePipe } from './../utils/truncate.pipe';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications/notifications.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { WalletComponent } from './wallet/wallet.component';
import { HelpComponent } from './help/help.component';
import { AliasComponent } from './alias/alias.component';
import { AddressesComponent } from './addresses/addresses.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CountryModalComponent } from './country-modal/country-modal.component';
import { ModalService } from "./modal.service";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    UtilsModule,
    ModalModule.forRoot()
  ],
  providers: [GasService, ModalService],
  exports: [NotificationsComponent],
  declarations: [NotificationsComponent, PreferencesComponent, WalletComponent, HelpComponent, AliasComponent, AddressesComponent, CountryModalComponent],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [CountryModalComponent]
})
export class AppCommonModule { }
