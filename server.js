const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.set('json spaces', 2); // number of spaces for indentation

// const routes = require('./routes/routes')
// app.use('/', routes)

// const PORT = process.env.PORT || 3000
const PORT = 3000

server.listen(PORT)

// ----variables
let users = {}
let variables = require('./modules/variables')
let storage = variables.storage
let map //= variables.map
let mapInfo
let world = {
    lightLevels:{
        map:[],
        sun:0
    },
    time:0,
    sunAngle: 0, 
    moonAngle: 0,
    mobs: [],
    interactMap: {}
}
storage.collection("map").orderBy("index").get().then(snap =>{
    let antall = snap.docs.length
    console.log("Antall docs i db: " +antall)
    mapInfo = snap.docs[antall-1].data()
    
    if(Object.keys(mapInfo).length == 0) console.log("Couldnt get a map from the db, fix and restart")
    else{
        map = JSON.parse(mapInfo.stringifiedMap)
        delete mapInfo.stringifiedMap
        
        world.interactMap = JSON.parse(mapInfo.interactMap)
        
        //fylle opp world.lightLeves.map
        for(let y = 0; y < map.length; y++){
            world.lightLevels.map[y] = []
            for(let x = 0; x < map[0].length; x++){
            world.lightLevels.map[y][x] = 0
            }
        }
        console.log("Map width: "+map[0].length,"Map height: " +map.length)

        //updater mappet til databasen hvert 30 sekund
        setInterval(() => {
        storage.collection("map").doc(mapInfo.index.toString()).set({
            stringifiedMap: JSON.stringify(map),
            height: map.length,
            width: map[0].length,
            index: mapInfo.index,
            interactMap: JSON.stringify(world.interactMap)
        }).then( ()=>{console.log("Oppdaterte map i databasen til nåværende")})
        }, 30000)
    }
})



let interactables = variables.interactables
const g = 0.00004*16
const db = require('./modules/db')


// functions
const Item = variables.Item
const Safe = variables.Safe
const Player = variables.Player
const Controller = variables.Controller
const gameFunctions = require('./modules/gameFunctions')
const usefulFunctions = require('./modules/usefulFunctions')
const dbFunctions = require('./modules/dbFunctions')
const recipes = require('./modules/recipes')
const update = gameFunctions.update
const updateSprites = gameFunctions.updateSprites
const keysD = gameFunctions.keysD
const keysU = gameFunctions.keysU
const click = gameFunctions.click
const interaction = gameFunctions.interaction
const objectIsEmpty = usefulFunctions.objectIsEmpty
const userExists = usefulFunctions.userExists
const updateMousePos = usefulFunctions.updateMousePos
const mapValue = usefulFunctions.mapValue
const getPlayerInfo = dbFunctions.getPlayerInfo
const updatePlayerInfo = dbFunctions.updatePlayerInfo
const copy = usefulFunctions.copy
const insertIntoCollection = dbFunctions.insertIntoCollection
const updatePlayerHand = gameFunctions.updatePlayerHand
const swap = gameFunctions.swap
const pickupItem = gameFunctions.pickupItem
const updateTime = gameFunctions.updateTime
const updateLightLevels = gameFunctions.updateLightLevels
const heartbeatsBeforeUpdateShadows = 60
let heartbeatCounter = 0
function heartbeat(){
    if(!objectIsEmpty(users)) {
        for (let [id, user] of Object.entries(users)){
            for (let i = 0; i < 5; i++){
                update(user.player, map, g, world, users)      
            }
        }
        
        
        heartbeatCounter ++
        if(heartbeatCounter > heartbeatsBeforeUpdateShadows){
            updateLightLevels(users, world.time, map, world)
            heartbeatCounter = 0
        }

        updateTime(world)
        
        io.emit('heartbeat', users, map[0].length, map.length)
    }
}

setInterval(heartbeat, 1000/30)

io.on('connection', socket => {
    console.log("connected: " + socket.id)
  
    socket.on('new-user', (username, width, height) => {
        console.log(width, height)
        users[socket.id] = {username: username, player: new Player(username, width, height), controller: new Controller(), playerID: socket.id}
        
        socket.emit("playerID", socket.id)

        console.log(socket.id)
    })

    // change hotBarItem og hover, key er 1, 2, 3, 4 etc...
    socket.on("changeItem", key => {
        users[socket.id].player.hotBarSpot = key

        // begge disse er pekere som peker til et sted i minnet, siden de peker til sammme sted når man setter den ene lik den andre,
        // vil en endring av den ene resultere i en endring av den andre også, ingen av de har liksom sin egen verdi, programmet henter fram en verdi
        // fra denne minneplassen når man spør om det, og det er verdien som befinner seg i minnet som blir endret dersom man endrer objektet
        updatePlayerHand(users[socket.id].player)
    })

    socket.on('keysD', (keyCode, clientX, clientY, canvasWidth, canvasHeight) => {
        if(!userExists(users, socket.id)) return
        keysD(keyCode, users[socket.id].player, users[socket.id].controller)
        updateMousePos(users[socket.id].player, clientX, clientY, canvasWidth, canvasHeight)
    })

    socket.on('keysU', keyCode => {
        if(!userExists(users, socket.id)) return
        keysU(keyCode, users[socket.id].player, users[socket.id].controller)
    })

    socket.on('mousedown', (button, clientX, clientY, canvasWidth, canvasHeight) => {
        if(!userExists(users, socket.id)) return
        updateMousePos(users[socket.id].player, clientX, clientY, canvasWidth, canvasHeight)
        users[socket.id].player.mouse.keys[button] = true
        const player = users[socket.id].player

        //interaksjon
        if(button==2 && world.interactMap[player.mouse.r.y] && world.interactMap[player.mouse.r.y][player.mouse.r.x]){
            let inter = interaction(users[socket.id].player, world.interactMap)
            socket.emit(inter)
            // console.log(inter)
        }

    
        else{
            click(button, users[socket.id].player, map, world, users)
        }
    })

    socket.on("mousemove", (clientX, clientY, canvasWidth, canvasHeight) => {
        if(!userExists(users, socket.id)) return
        updateMousePos(users[socket.id].player, clientX, clientY, canvasWidth, canvasHeight)
    })

    socket.on("mouseup", button => {
        if(!userExists(users, socket.id)) return
        users[socket.id].player.mouse.keys[button] = false
        users[socket.id].player.mining.active = false
    })

  
  //mutering av inventory og safer


    socket.on("closeInventory", () =>{
        const player = users[socket.id].player
        //fjerner highlight
        if(player.selectedSwap) player[player.selectedSwap.container].arr[player.selectedSwap.index].highlighted = false

        player.selectedSwap = null
        player.safe = null

        //sørger for at player.hand er oppdatert
        updatePlayerHand(player)
    })


    socket.on('swap', (index, container, button) => {
        if(!userExists(users, socket.id)) return
        swap(users[socket.id].player, index, container, button)
    })

    socket.on('pickUpCraftedItem', ()=>{
        pickupItem(users[socket.id].player, map, true)
    })

    socket.on('disconnect', () => {
        if(!userExists(users, socket.id)) return
        // updatePlayerInfo(socket[id].username)
        delete users[socket.id]
        console.log(socket.id + " disconnected.")
    })


    socket.on('new-insert', (collection, data) => {
        console.log("new insert!!", collection)
        insertIntoCollection(collection, data)
    })

})