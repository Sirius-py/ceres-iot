const app = require("./app")
require('./database');
const Task  = require("./models/Task");
const http = require('http');
const { Server } = require("socket.io")
const server = http.createServer(app);
const io = new Server(server);

/// sockets
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
// Tópicos que publica
const topic0 = "ceres/#"
const topic1 = "ceres/sensor/ambiente/temperatura";
const topic2 = "ceres/sensor/ambiente/humedad";
const topic3 = "ceres/sensor/distancia";
const topic6 = "ceres/sensor/planta/humedad-tierra";
const topic7 = "ceres/tanque/principal/estado";
const topic8 = "ceres/tanque/auxiliar/estado";
const topic9 = "ceres/tanque/principal/volumen-total";       
const topic10 = "ceres/tanque/auxiliar/volumen-total";       
const topic11 = "ceres/tanque/principal/volumen-liquido";    
const topic12 = "ceres/tanque/auxiliar/volumen-liquido";     
const topic13 = "ceres/tanque/principal/porcentaje-liquido"; 
const topic14 = "ceres/tanque/auxiliar/porcentaje-liquido";  
// Tópicos a los que se suscribe
const topic4 = "ceres/led";
const topic5 = "ceres/slider";

// MQTT varibles 
const mqtt = require("mqtt");
const host = 'test.mosquitto.org'
const port = '1884'
const username= 'rw';
const password= 'readwrite';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `mqtt://${host}:${port}`
//funcion de conexion
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: username,       //username: 'emqx',
  password: password ,//password: 'public',
  reconnectPeriod: 1000,
})
//subcripcion a una variedad de topicos
client.on("connect",function()
{   
    client.subscribe(topic0);
    console.log("Client subscribed");
});
//mensaje que se recibe
client.on("message",async (topic, message)=> {
  //almacenado en database
  /* const task = Task({topic:topic,value:message})
    const saveTask = await task.save()
    console.log(saveTask) */
  //enviar el topico de temperatura al HTML
  if  (topic == topic1) {
    io.emit("esp:temperatura",{
      value: message.toString()
    })
  }
  //enviar el topico de humedadAmbiente al HTML
  if (topic == topic2) {
    io.emit("esp:humedad",{
      value: message.toString()
    })
  }
  //enviar el topico de humedadTierra al HTML
  if (topic == topic6) {
    io.emit("esp:humedad2",{
      value: message.toString()
    })
  }


  //enviar el topico de humedadTierra al HTML
  if (topic == topic7) {
    io.emit(topic7,{
      value: message.toString()
    })
  }


  //enviar el topico tanque pricipal porcentaje-liquito al HTML
  if (topic == topic13) {
    io.emit("esp:distancia",{
      value: message.toString()
    })
  }
   //enviar el topico tanque reserva porcentaje-liquito al HTML
  if (topic == topic14) {
    io.emit("esp:distancia2",{
      value: message.toString()
    })
  }
 // console.log(topic + " - " + message.toString());
  
});
//publicacion del switch que viene del HTML 
io.on('connection', (socket) => {
  socket.on('esp32:luz', (msg) => {
    client.publish(topic4, msg.toString())
    console.log(msg.toString());
  });
});
io.on('connection', (socket) => {
  socket.on("esp32:slider", (msg) => {
    client.publish(topic5, msg.toString())
    console.log(msg.toString());
  });
});

server.listen(app.get("port"), () => {
  console.log('listening on: ' + app.get("port"));
});

