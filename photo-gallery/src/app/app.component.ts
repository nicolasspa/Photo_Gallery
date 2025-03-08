import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
const firebaseConfig = {
    apiKey: "AIzaSyAfMCSYesmy_bEMCY1B2VSY0k-MqIXI6JU",
    authDomain: "proyectomovilreservashotel.firebaseapp.com",
    databaseURL: "https://proyectomovilreservashotel-default-rtdb.firebaseio.com",
    projectId: "proyectomovilreservashotel",
    storageBucket: "proyectomovilreservashotel.firebasestorage.app",
    messagingSenderId: "436226061100",
    appId: "1:436226061100:web:1a069826114bf2dc443289"
};


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    initializeApp(firebaseConfig);
  }
}
