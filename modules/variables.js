const usefulFuncions = require(__dirname+"/usefulFunctions")
const getLevel = usefulFuncions.getLevel
//smeller inn firebase storage
const firebase = require("firebase")
const firebaseConfig = {
    apiKey: "AIzaSyC_qo-PKhtoAUMq-8hz3N5pW8nwbVLMRTE",
    authDomain: "paaskespill.firebaseapp.com",
    databaseURL: "https://paaskespill.firebaseio.com",
    projectId: "paaskespill",
    storageBucket: "paaskespill.appspot.com",
    messagingSenderId: "200950577223",
    appId: "1:200950577223:web:919978e4905514e8fc5962",
    measurementId: "G-HXN2PSV4SQ"
}
firebase.initializeApp(firebaseConfig);
storage = firebase.firestore()


// function getMap(db){
//   return new Promise( (resolve, reject) =>{
//     db.collection("map").get().then(snap =>{
//       resolve(JSON.parse(snap.docs[2].data().stringifiedMap))
//     })
//   })
// }




class Player {
    constructor(username, canWidth, canHeight) {
        this.username = username
        this.canWidth = canWidth
        this.canHeight = canHeight
        this.x = 60
        this.y = 8
        this.sightPos = {x: this.x+16, y: this.y+16}
        this.direction = "front"
        this.moving = false
        this.movement = "walking"
        this.falling = false
        this.vx = 0
        this.vy = 0
        this.inventory = {
            arr: []
        }

        for(let i = 0; i < 32; i++){
            if(i == 24) this.inventory.arr[24] = new Item("pickaxe", 12, null, 24, "inventory", false)
            
            else if(i == 25) this.inventory.arr[25] = new Item("interactable", 8, 2, 25, "inventory", false)
            else if(Math.random() > 0.5) this.inventory.arr.push(new Item("block", Math.floor(Math.random()*7)+1, Math.floor(Math.random()*64 +1), i, "inventory", false))
            else if(Math.random() > 0.7) this.inventory.arr.push(new Item("block", 10, Math.floor(Math.random()*64 +1), i, "inventory", false))
            else this.inventory.arr.push(new Item("empty", 0, null, i, "inventory", false))
        }
    
    

        this.pos = {
            topLeft: undefined,
            topRight: undefined,
            midLeft: undefined,
            midRight: undefined,
            botLeft: undefined,
            botRight: undefined
        }
        this.sprite = {
            index: 2,
            playerSprite: "boy",
            delay: 25,
            counter: 0
        }

        this.mouse = {
            x: undefined,
            y: undefined,
            counter: 0,
            delay: 15,
            keys: {
                0: false,
                2: false
            },
            r:{
                x: undefined,
                y: undefined
            }
            }
            this.hotBarSpot = 1
            this.hand = this.inventory.arr[24]
            
            this.selectedSwap = 0
            this.safe = ""

        //mining
        this.mining = {
            active: false,
            current: undefined,
            stage: 0,
            difficulty: 1
        }

        this.craftedItem = undefined
        this.crafting = {
            arr: []
        }
        for(let i = 0; i < 9; i++){
            this.crafting.arr.push(new Item("empty", 0, null, i, "crafting", false))
        }
        this.world = {
            lightLevels:{ 
                map:[],
                sun:0
            },
            time:0,
            sunAngle:0,
            moonAngle:0,
            mobs: [0]
        }
    }
}

class Zombie{
    constructor(x, y){
        this.x = x
        this.y = y
        this.health = 100
        this.damage = 10
        this.speed = 0.00005
        this.img = "zombie"
        this.dead = false
    }
    kill(mobs){
        this.dead = true
        for(i=0; i<mobs.length; i++){
            if(mobs[i].dead){
                mobs.splice(i, 1)
            }
        }
    }

}

// let mobs = []

class Controller {
    constructor() {
        this.left = false,
        this.right = false,
        this.up = false
    }
}




const solidBlocks = [1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 14, 15, 16]
const lightEmittingBlocks = [11]
const lightThroughBlocks = [0, 11]
const val = {air:0, stone:1, log:2, leaves:3, coal_ore:4, grass:5, iron_ore:6, dirt:7, safe:8, grill:9, iron_pick:12}


class Item{
    constructor(type, value, number, index, container, highlight){
        this.type = type
        this.value = value
        if(this.type == "block" || this.type == "material" || this.type == "interactable") this.number = number
        this.index = index
        this.container = container
        this.highlight = highlight
        if(this.type == "pickaxe"){
            this.level = getLevel(this.value)
            this.efficientOn = [1, 2, 3, 4, 5, 6, 7]
        }
    }
}


class Safe{
    constructor(x, y){
        this.arr = []
        for(let i = 0; i < 25; i++){
            this.arr.push(new Item("empty", 0, null, i, "safe", false))
        }
        this.x = x
        this.y = y
        this.name = "Safe"
    }
}       

//map med ting man kan iteragere med 


const speed = 0.02
let interactables = [8]
module.exports = {storage, interactables, solidBlocks, lightEmittingBlocks, lightThroughBlocks, speed, Safe, Item, Player, Controller, Zombie}
