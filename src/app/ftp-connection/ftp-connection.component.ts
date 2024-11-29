import { Component } from '@angular/core';
import { FtpService } from '../services/ftp-service';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-ftp-connection',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './ftp-connection.component.html',
  styleUrls: [ './ftp-connection.component.css' ]
} )
export class FtpConnectionComponent {
  credentials = {
    host: '172.29.230.156',
    port: 21,
    user: 'ftpuser',
    password: 'ftp',
    secure: true,
    secureOptions: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
      enableTrace: false
    }
  };
  files: any[] = [];
  error: string | null = '';

  constructor( private ftpService: FtpService ) { }

  connect() {
    this.ftpService.connectToServer( this.credentials ).then( ( response: any ) => {
      console.log( 'Conectado al servidor : ', response );
      this.listFiles();
    } ).catch( ( error: any ) => {
      console.log( 'Error al conectar al servidor : ', error );
    } );
  }

  // Listar archivos
  listFiles() {
    this.ftpService.listFiles().then( ( response: any ) => {
      console.log( 'Archivos listados : ', response );
      this.files = response;  // Actualizamos la lista de archivos
    } ).catch( ( error: any ) => {
      console.log( 'Error al listar los archivos : ', error );
    } );
  }

  // Descargar archivo
  downloadFile( fileName: string ) {
    this.ftpService.downloadFile( fileName ).then( ( response ) => {
      const url = window.URL.createObjectURL( new Blob( [ response ] ) );
      const a = document.createElement( 'a' );
      a.href = url;
      a.download = fileName;
      a.click();
      this.listFiles();  // Actualizamos la lista de archivos después de la descarga
    } );
  }

  // Eliminar archivo
  deleteFile( fileName: string ) {
    this.ftpService.deleteFile( fileName ).then( ( response: any ) => {
      console.log( 'Archivo eliminado : ', response );
      this.listFiles();  // Actualizamos la lista de archivos después de la eliminación
    } ).catch( ( error: any ) => {
      console.log( 'Error al eliminar el archivo : ', error );
    } );
  }

  // Subir archivo
  uploadFile( file: File ) {
    console.log( 'Iniciando subida del archivo:', file.name );
    this.ftpService.uploadFile( file ).then( ( response ) => {
      console.log( 'Archivo subido exitosamente:', response );
      this.listFiles();  // Actualizamos la lista de archivos después de la subida
    } ).catch( ( error ) => {
      console.error( 'Error al subir el archivo:', error );
      this.error = `Error al subir el archivo: ${ error.message }`;
    } );
  }

  // Crear un directorio
  createDirectory( dirName: string ) {
    if ( dirName ) {
      this.ftpService.createDirectory( dirName ).then( response => {
        alert( response.message );
        this.listFiles();  // Actualizamos la lista de archivos después de crear el directorio
      } ).catch( error => {
        console.error( error );
        alert( "Error al crear el directorio." );
      } );
    } else {
      alert( "Por favor ingresa un nombre de directorio." );
    }
  }

  // Eliminar un directorio
  deleteDirectory( dirName: string ) {
    if ( dirName ) {
      this.ftpService.deleteDirectory( dirName ).then( response => {
        alert( response.message );
        this.listFiles();  // Actualizamos la lista de archivos después de eliminar el directorio
      } ).catch( error => {
        console.error( error );
        alert( "Error al eliminar el directorio." );
      } );
    } else {
      alert( "Por favor ingresa un nombre de directorio." );
    }
  }

  // Nuevo método para manejar la selección de archivos
  handleFileSelect( event: any ) {
    const file = event.target.files[ 0 ];
    if ( file ) {
      this.uploadFile( file );
    }
  }
}
