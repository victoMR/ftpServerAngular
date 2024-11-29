import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';

@Injectable( {
  providedIn: 'root'
} )
export class FtpService {
  private apiUrl = 'http://localhost:3000/ftp';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create( {
      baseURL: this.apiUrl,
      timeout: 10000, // Timeout después de 10 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    } );
  }

  // Conectar al servidor FTP
  async connectToServer( credentials: any ) {
    try {
      const response = await this.axiosInstance.post( '/connect', credentials );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }

  // Listar archivos
  async listFiles() {
    try {
      const response = await this.axiosInstance.get( '/list' );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }

  // Descargar archivo
  async downloadFile( fileName: string ) {
    try {
      const response = await this.axiosInstance.get( `/download/${ fileName }`, {
        responseType: 'blob',
      } );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }
  // Subir archivo
  async uploadFile( file: File ) {
    const formData = new FormData();
    formData.append( 'file', file );  // Asegúrate de que 'file' es el nombre correcto en el backend

    try {
      const response = await this.axiosInstance.post( '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'  
        }
      } );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }


  // Eliminar archivo
  async deleteFile( fileName: string ) {
    try {
      const response = await this.axiosInstance.delete( `/delete/${ fileName }` );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }
  // Crear un directorio
  async createDirectory( directoryName: string ) {
    try {
      const response = await this.axiosInstance.post( '/create-directory', { directoryName } );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }

  // Eliminar un directorio
  async deleteDirectory( directoryName: string ) {
    try {
      const response = await this.axiosInstance.delete( `/delete-directory/${ directoryName }` );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }
  // Desconectar del servidor FTP
  async disconnect() {
    try {
      const response = await this.axiosInstance.post( '/disconnect' );
      return response.data;
    } catch ( error: any ) {
      this.handleError( error );
      throw error;
    }
  }

  // Manejo de errores
  private handleError( error: any ) {
    if ( error.response ) {
      console.error( 'Error del servidor:', error.response.data );
    } else {
      console.error( 'Error:', error.message );
    }
  }
}
