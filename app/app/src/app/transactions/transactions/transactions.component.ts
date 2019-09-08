import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  blockExplorer = "https://ropsten.etherscan.io/tx/";
  ngOnInit() {
      this.blockExplorer = localStorage.getItem('blockExplorer');
      // deprecated part - we no longer offer a link to the blockexplorer
      if(!this.blockExplorer || !this.blockExplorer.length) {
        //   this.blockExplorer = "https://ropsten.etherscan.io/tx/";
      }
  }

  change(explorer) {
      localStorage.setItem('blockExplorer', explorer)
  }
}