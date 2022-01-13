var indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;
var dataBaseC = null;
var dataBase = null;
var registroActual = null;
var cursor = null;
var nuevo = true;
function startDB() {
  dataBase = indexedDB.open("BdFotos", 1);
  // Creamos  o abrimos la base de datos con un numero de version
  // Es importante el significado de la  versión(1), pero aún no no tengo claro.
  dataBase.onupgradeneeded = function (e) {
    // El método   onupgradeneeded se ejecuta la primera vez que se crea la base de datos
    // El método createObjectStore solo se puede utilizar dentro de esta function
    // Si cambiamos de versión tambien se dispara onupgradeneeded
    // Como hemos dicho  Ese evento también se dispará la primera vez que se abre la BD y
    // ahí es donde se deben crear tablas e índices.
    orden = dataBase.result;
    // onder es un objeto que nos permite ejecutar acciones contra la base de datos creada, como crear un tabla
    var tabla = orden.createObjectStore("Galeria", {
      keyPath: "id",
      autoIncrement: true,
    });
    //  createObjectStore crea una tabla, el campo clave obligatorio por medio de KeyPath y si el indice es autoincremento
    //tabla.createIndex('by_Id', 'claveId', { unique: false });
    //!!!!!!! cuidado con mayúsculas y mnísculas. No es igual by_IdCliente que by_idCliente
    tabla.createIndex("by_video", "Nombre_Video", { unique: false });
    tabla.createIndex("by_tema", "Tema", { unique: false });
    // Creamos cuanto indices necesitemos para despues realizar búsquedas. Se crea un indice por cada campo de la tabla
    // que vayamos a necesitar
    alert("Base de datos creada");
  };

  dataBase.onsuccess = function (e) {
    // Este evento se ejecuta si la creación o apertura de la base de datos es correcta
    // Ya podemos emprexar a grabar, borrar o buscar registros en la base de datos

    // En este evento realizaremos una lectura secuencial de la bae de datos cmo despues se explica.
    mostrarGaleria();
    // crearcursor();
  };

  dataBase.onerror = function (e) {
    // Si se produce un error se ejecuta este método. Ocurre cuando cambiamos de versión
    alert("Error cargandoo la base de datos " + e.target);
  };
}
startDB();


function grabar(myImage) {
    let nombre_video=f.name;
    let datos_imagen=myImage;
    let tema=document.getElementById("tema").value;
    var orden = dataBase.result;
    // Crea un objeto para ejecutar ordenes contra la base de datos               
    var transacion = orden.transaction(["Galeria"], "readwrite");
    // Crea una transación sobre una  tabla de la base de datos para lectura y escritura
    var tabla = transacion.objectStore("Galeria");
    // Crea un objeto para realizar la transaccion sobre la tabla . En este caso un méto put
    // que graba un registro. Devuelve un objeto request que se utiliza para ejecutar un método asíncrono
    // que permite evaluar si ha tenido exito o no la transacción.
    // El método put graba si no existe un regisrtro con la clave indicada o lo sobreescribe(modifica)
    //  si existe.
    var request = null;
    request = tabla.add({
        Nombre_Video:nombre_video,
        Tema:tema,
        imagen:datos_imagen
    })
    // if (nuevo) {

    //     request = tabla.add({
    //         Descripcion: Descripcion,
    //         Fecha: Fecha,
    //         Hora: Hora,
    //         Finalizado: Finalizado,
    //         IdCliente: IdCliente,
    //         IdTecnico: IdTecnico,
         

    //     });
    // }
    // else {
    //     var nid = parseInt(id.toString())
    //     request = tabla.put({
    //         id: nid,
    //         Descripcion: Descripcion,
    //         Fecha: Fecha,
    //         Hora: Hora,
    //         Finalizado: Finalizado,
    //         IdCliente: IdCliente,
    //         IdTecnico: IdTecnico,
    //     });
    // }

    // request.onerror = function (e) {
    //     // Error de grabación                    
    //     alert(request.error.name + '\n\n' + request.error.message);
    // };

    transacion.oncomplete = function (e) {
        alert('Registro grabado');
    };


}




function mostrarGaleria() {// Lectura secuencial ascendente(next) o descendente (prev)
    if(galeria.firstChild!=null) {
        while (galeria.firstChild) {
            galeria.removeChild(galeria.lastChild);
          }
    }
  
    var ordenlistado = "next";

    var orden = dataBase.result;
    var transacion = orden.transaction(["Galeria"], "readonly");
    var tabla = transacion.objectStore("Galeria");
    //  request = object.openCursor("isbn",IDBCursor.nextUnique);
    request = tabla.openCursor(null, ordenlistado);
    // request = object.openCursor(null, 'prev');
    //  request = object.openCursor(null, 'next');
    //    var cursorRequest = store.index('date').openCursor(null, 'next'); 
    //  var dato = document.querySelector("#cdatoabuscar").value
    //   var request = object.get(dato);

    request.onerror = function (event) {
        alert(" Error de lectura");
    };

    request.onsuccess = function (event) {
        cursor = event.target.result;
        if (cursor) {
            registro = cursor.value;
            if(f==undefined){
                if(tema.value==""||tema.value==registro.Tema){
                    let imagen=document.createElement("img");
                    imagen.src =registro.imagen;
                    galeria.appendChild(imagen);
                }
                cursor.continue();
            }else{
            if(f.name==registro.Nombre_Video){
                if(tema.value==""||tema.value==registro.Tema){
                    let imagen=document.createElement("img");
                    imagen.src =registro.imagen;
                    galeria.appendChild(imagen);
                    
                }
                cursor.continue();
            }else{
                cursor.continue();
            }}

        }
    }
}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////
let video = document.getElementById("Video1");
var f;
document
  .getElementById("files")
  .addEventListener("change", VisualizarVideoSleccionado, false);
function VisualizarVideoSleccionado(evt) {
  let files = evt.target.files; // Se crea el array files con los ficheros seleccioandos

  f = files[0]; // Solo no interesa el primero. Sera un fichero .xml con los datos de la biblioteca
  reader = new FileReader(); // El objeto reader leera el archivo cuando ocurra el evento onload

  //  VideoReproduciendose.value = f.name;
  let ElElFichero = f.name; //"http://127.0.0.1:8080/sostenible.mp4"//
  if (f.name.substring(f.name.length - 3, f.name.length) == "mp4") {
    reader.onload = (function (ElFichero) {
      return function (e) {
        try {
          video.src = e.target.result;
          video.currentTime = 0;
          video.load();
          video.play();
        } catch (err) {
          //  alert("Error : " + err);
        }
      };
    })(f);
    reader.readAsDataURL(f);
  } else {
    alert("Error : Formato de vidio no correcto");
  }
}

function capturarFoto() {
  oFoto = document.querySelector("#foto");
  oContexto = oFoto.getContext("2d");
  oContexto.drawImage(video, 0, 0, 300, 160);
  let myImage = oFoto.toDataURL("image/png");
  console.log(myImage);
  grabar(myImage)
}

