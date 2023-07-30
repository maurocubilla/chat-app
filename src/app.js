import express from "express";
import {engine} from "express-handlebars";
import { __dirname } from "./utils.js";
import path from "path";
import {Server} from "socket.io";


import { viewsRouter } from "./routes/views.routes.js";


const port = process.env.PORT || 8080;
const app =express();

//midlewares
app.use(express.static(path.join(__dirname,"/public")));
//servidor de express
const httpServer = app.listen(port, ()=>console.log(`server listening on port ${port}`));

//servidor de websocket
const io = new Server(httpServer);



// coniguracion de handlebars
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, "/views"));

//routes
app.use(viewsRouter);

let messages=[];
//socket server
io.on("connection",(socket)=>{
    console.log("nuevo cliente conectado");
    
 
    socket.on("authenticated",(msg)=>{
        io.emit("messageHistory", messages);
        socket.broadcast.emit("newUser",msg);
    });

    //recibir el mensaje del cliente
    socket.on("message",(data)=>{
        console.log("data", data);
        messages.push(data);

        //cada vez que recivamos este mensaje , enviamos todos los mensjaes actualizados a los clientes
        io.emit("messageHistory", messages);
    })

});
