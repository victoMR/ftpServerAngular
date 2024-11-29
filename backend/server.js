const express = require("express");
const FtpClient = require("promise-ftp");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración inicial del cliente FTP
let ftp = new FtpClient();
let connected = false;

// Configuración del almacenamiento local para descargas
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

app.use(cors({
  origin: 'http://127.0.0.1:4200', // Reemplaza con el origen de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

// Conectar al servidor FTP
app.post("/ftp/connect", async (req, res) => {
  const config = req.body;

  try {
    if (connected) {
      return res.status(200).send({ message: "Ya estás conectado al servidor FTP." });
    }

    console.log("Intentando conexión al servidor FTP...");
    await ftp.connect(config);
    connected = true;

    const serverMessage = await ftp.system();
    console.log("Conexión exitosa:", serverMessage);
    res.status(200).send({ message: "Conectado al servidor FTP", system: serverMessage });
  } catch (error) {
    console.error("Error conectando al servidor FTP:", error);
    res.status(500).send({ error: error.message });
  }
});

// Listar archivos en el directorio actual
app.get("/ftp/list", async (req, res) => {
  try {
    if (!connected) {
      return res.status(400).send({ error: "No estás conectado al servidor FTP." });
    }

    console.log("Listando archivos...");
    const files = await ftp.list("/");
    res.status(200).send(files);
  } catch (error) {
    console.error("Error al listar archivos:", error);
    res.status(500).send({ error: error.message });
  }
});

// Descargar un archivo
app.get("/ftp/download/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const localPath = path.join(downloadDir, fileName);

  try {
    if (!connected) {
      return res.status(400).send({ error: "No estás conectado al servidor FTP." });
    }

    console.log(`Iniciando descarga de ${fileName}...`);
    const stream = await ftp.get(fileName);

    const writeStream = fs.createWriteStream(localPath);
    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      console.log(`Archivo descargado exitosamente en ${localPath}`);
      res.download(localPath, fileName);
    });

    writeStream.on("error", (err) => {
      console.error("Error descargando archivo:", err);
      res.status(500).send({ error: err.message });
    });
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    res.status(500).send({ error: error.message });
  }
});

// Subir un archivo
const upload = multer({ dest: "uploads/" });
app.post("/ftp/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  console.log("Archivo recibido:", file);  // Verifica que el archivo esté presente

  if (!file) {
    return res.status(400).send({ error: "No se ha enviado un archivo." });
  }

  try {
    if (!connected) {
      return res.status(400).send({ error: "No estás conectado al servidor FTP." });
    }

    const remotePath = `/${file.originalname}`;
    console.log(`Subiendo archivo ${file.originalname} al servidor FTP...`);
    await ftp.put(file.path, remotePath);

    console.log("Archivo subido exitosamente");
    res.status(200).send({ message: "Archivo subido exitosamente", file: file.originalname });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).send({ error: error.message });
  } finally {
    fs.unlinkSync(file.path);  // Elimina el archivo temporal
  }
});


// Eliminar un archivo
app.delete("/ftp/delete/:fileName", async (req, res) => {
  const fileName = req.params.fileName;

  try {
    if (!connected) {
      return res.status(400).send({ error: "No estás conectado al servidor FTP." });
    }

    console.log(`Eliminando archivo ${fileName}...`);
    await ftp.delete(fileName);

    console.log("Archivo eliminado exitosamente");
    res.status(200).send({ message: "Archivo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    res.status(500).send({ error: error.message });
  }
});

// Cerrar conexión
app.post("/ftp/disconnect", async (req, res) => {
  try {
    if (connected) {
      await ftp.end();
      connected = false;
      console.log("Conexión FTP cerrada correctamente");
      res.status(200).send({ message: "Desconectado del servidor FTP." });
    } else {
      res.status(400).send({ error: "No hay conexión activa al servidor FTP." });
    }
  } catch (error) {
    console.error("Error al cerrar la conexión:", error);
    res.status(500).send({ error: error.message });
  }
});

// Crear un directorio en el servidor FTP
app.post("/ftp/create-directory", async (req, res) => {
  const dirName = req.body.directoryName; // Nombre del directorio a crear

  try {
    if (!connected) {
      return res.status(400).send({ error: "No estás conectado al servidor FTP." });
    }

    if (!dirName) {
      return res.status(400).send({ error: "Se debe proporcionar un nombre para el directorio." });
    }

    console.log(`Creando directorio ${dirName}...`);
    await ftp.mkdir(dirName); // Crear directorio en el servidor FTP

    console.log("Directorio creado exitosamente");
    res.status(200).send({ message: "Directorio creado exitosamente", directory: dirName });
  } catch (error) {
    console.error("Error al crear directorio:", error);
    res.status(500).send({ error: error.message });
  }
});

// Eliminar un directorio en el servidor FTP
app.delete("/ftp/delete-directory/:dirName", async (req, res) => {
  const dirName = req.params.dirName;

  try {
    if (!connected) {
      return res.status(400).send({ error: "No estás conectado al servidor FTP." });
    }

    if (!dirName) {
      return res.status(400).send({ error: "Se debe proporcionar el nombre del directorio a eliminar." });
    }

    console.log(`Eliminando directorio ${dirName}...`);
    await ftp.rmdir(dirName, true); // Eliminar directorio en el servidor FTP (true para borrar de forma recursiva)

    console.log("Directorio eliminado exitosamente");
    res.status(200).send({ message: "Directorio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar directorio:", error);
    res.status(500).send({ error: error.message });
  }
});

app.use(express.json());

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor FTP escuchando en http://localhost:${port}`);
});
