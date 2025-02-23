import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

import { Filesystem, Directory } from '@capacitor/filesystem';

import { Preferences } from '@capacitor/preferences';

import { Platform } from '@ionic/angular';

import { Capacitor } from '@capacitor/core';


@Injectable({
  providedIn: 'root'
})



export class PhotoService {
  public photos: UserPhoto[] = []; // arreglo que almacena las fotos
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform; // Inicializamos Platform
  }

  public async addNewToGallery() {
    // Tomar una foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
      // guardar la foto y agregarla a la colección**
      const savedImageFile = await this.savePicture(capturedPhoto);
      this.photos.unshift(savedImageFile);

       // Guardar las fotos en el Preferences API
  await Preferences.set({
    key: this.PHOTO_STORAGE,
    value: JSON.stringify(this.photos),
  });
 }

 private async savePicture(photo: Photo) {
  // Convertir la foto a formato base64 para guardarla
  const base64Data = await this.readAsBase64(photo);

  // Guardar el archivo en el directorio de datos
  const fileName = Date.now() + '.jpeg';
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data
  });

  if (this.platform.is('hybrid')) {
    // Para plataformas híbridas (móviles), convertir la URI a una URL accesible
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
    };
  }
  else {
    // En la web, se puede mostrar la foto directamente desde el `webPath`
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }
}
public async deletePicture(photo: UserPhoto, position: number) {
  // Remove this photo from the Photos reference data array
  this.photos.splice(position, 1);

  // Update photos array cache by overwriting the existing photo array
  Preferences.set({
    key: this.PHOTO_STORAGE,
    value: JSON.stringify(this.photos)
  });

  // delete photo file from filesystem
  const filename = photo.filepath
                      .substr(photo.filepath.lastIndexOf('/') + 1);

  await Filesystem.deleteFile({
    path: filename,
    directory: Directory.Data
  });
}

// **Función para leer la foto como base64**
private async readAsBase64(photo: Photo) {
  // Detectar si estamos en una plataforma híbrida (Cordova o Capacitor)
  if (this.platform.is('hybrid')) {
    // Leer el archivo como base64 (solo para móviles)
    const file = await Filesystem.readFile({
      path: photo.path!
    });
    return file.data;
  }
  else {
    // En la web, leer el archivo como Blob y convertirlo a base64
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }
}


 // **Función auxiliar para convertir un blob a base64**
 private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
      resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

// Función para cargar las fotos guardadas desde Preferences
public async loadSaved() {
  // Recuperar los datos de las fotos guardadas desde el almacenamiento local
  const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
  this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

  // Si no estamos en una plataforma híbrida (es decir, estamos en la web)
  if (!this.platform.is('hybrid')) {
    // En la web, leer las fotos desde el sistema de archivos en formato base64
    for (let photo of this.photos) {
      // Aquí verificamos si `photo.webviewPath` ya contiene la ruta o si necesitamos convertirla
      if (!photo.webviewPath) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });
// Solo para la plataforma web: Convertir la foto a base64
photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }

    }
  }
}


}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}