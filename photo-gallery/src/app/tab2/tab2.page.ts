import { Component } from '@angular/core';
import { PhotoService ,UserPhoto} from '../services/photo.service';
import { ActionSheetController } from '@ionic/angular';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  constructor(public photoService: PhotoService,public actionSheetController: ActionSheetController) { }

  async ngOnInit() {
    // Cargar las fotos guardadas cuando la página se inicializa
    await this.photoService.loadSaved();
  }

   // Función para agregar una foto a la galería
  addPhotoToGallery() {
    this.photoService.addNewToGallery();

 }

 // Función para mostrar la Action Sheet y ofrecer opciones (Eliminar o Cancelar)
 public async showActionSheet(photo: UserPhoto, position: number) {
  const actionSheet = await this.actionSheetController.create({
    header: 'Photos',
    buttons: [
      {
        text: 'Delete', // Opción para eliminar
        role: 'destructive', // Define que es una acción destructiva
        icon: 'trash', // Ícono de la papelera
        handler: () => {
          this.photoService.deletePicture(photo, position); // Llamamos a deletePicture()
        }
      },
      {
        text: 'Cancel', // Opción para cancelar
        icon: 'close', // Ícono de cerrar
        role: 'cancel', // Define que es la acción de cancelación
        handler: () => {
          // No se hace nada, la hoja de acciones se cierra automáticamente
        }
      }
    ]
  });
  await actionSheet.present();
}
}
