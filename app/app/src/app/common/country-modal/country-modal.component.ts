import { Component, OnInit } from '@angular/core';
import { ModalService } from '../modal.service';
import { HttpService } from '../../utils/http.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-country-modal',
  templateUrl: './country-modal.component.html',
  styleUrls: ['./country-modal.component.css']
})
export class CountryModalComponent implements OnInit {

  private country: string;
  private isCountrySelected: boolean;
  private countryList;

  constructor(private modalService: ModalService,
              private http: HttpService,
              private _location: Location) { }

  ngOnInit() {
    this.http.getCountryList().subscribe(data => {
      this.countryList = data;
      this.countryList.unshift({name :'select', code: 'select'});
    });
  }

  chooseCountry(country) {
    this.isCountrySelected = false;
    this.country = '';
    if (country.target.value !== 'select') {
      this.isCountrySelected = true;
      this.country = country.target.value;
      this.http.saveSettings([{key: 'country', value: country.target.value}]).subscribe(res => {
        this.isCountrySelected = true;
      });
    }
  }

  hide() {
    if (this.country) {
      this.modalService.hide();
    }
    else {
      this._location.back();
      this.modalService.hide();
    }
  }
}
