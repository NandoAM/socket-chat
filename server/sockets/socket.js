const { io } = require('../server');
const {Usuarios} = require('../classes/usuarios');
const {crearMensaje} = require( '../utils/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {

   
    client.on('entrarChat', (data, callback) => {
        
        if(!data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es obligatorio'
            });
        }

        client.join(data.sala);

        let personas= usuarios.aniadirPersonas( client.id, data.nombre, data.sala );
        
        
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));

        callback(usuarios.getPersonasPorSala(data.sala));

    });


    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {
               
        let personaBorada = usuarios.borarPersona( client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador' , `${personaBorada.nombre} abandonó el chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorada.sala));
        
       
    });

    client.on('mensajePrivado', data=> {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje (persona.nombre, data.mensaje));


    });
   

});