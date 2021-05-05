const variables = require(__dirname+'/variables')
let storage = variables.storage
let interactMap = variables.interactMap
const Zombie = variables.Zombie
const solidBlocks = variables.solidBlocks
const lightThroughBlocks = variables.lightThroughBlocks
const speed = variables.speed
// const world = variables.world
const lightEmittingBlocks = variables.lightEmittingBlocks
const Item = variables.Item
const Safe = variables.Safe
const recipes = require(__dirname+"/recipes")
const checkRecipe = recipes.checkRecipe

const usefulFunctions = require(__dirname+"/usefulFunctions")
const equalsSome = usefulFunctions.equalsSome
const equalsAll = usefulFunctions.equalsAll
const mapValue = usefulFunctions.mapValue
const playerMovement = usefulFunctions.playerMovement
const stageIncrement = usefulFunctions.stageIncrement

function updateSprites(player){
    if(player.direction == "front") player.sprite.index = 0
    else{
        player.sprite.index = player.sprite.index == 3 ? 0 : player.sprite.index + 1
    }
    player.sprite.counter = 0
}


function update(player, map, g, world, users){
    player.indexes = {
        startX: Math.floor(player.x-player.canWidth/64)-1 > 0 ? Math.floor(player.x-player.canWidth/64)-1 : 0,
        startY: Math.floor(player.y-player.canHeight/64)-1 > 0 ? Math.floor(player.y-player.canHeight/64)-1 : 0,
        endX: Math.ceil(player.x+player.canWidth/64) < map[0].length ? Math.ceil(player.x+player.canWidth/64) : map[0].length,
        endY: Math.ceil(player.y+player.canHeight/64) < map.length ? Math.ceil(player.y+player.canHeight/64) : map.length
    }
    //oppdaterer mappet som skal tegnes
    player.map = {}
    for(y=player.indexes.startY; y<=player.indexes.endY; y++){
        player.map[y] = {}
        for(x=player.indexes.startX; x<=player.indexes.endX; x++){
            if(!map[y] || map[y][x] == undefined) player.map[y][x] = 0
            else player.map[y][x] = map[y][x]
        }
    }
    // console.log(typeof(player.map))
    player.world.lightLevels.map = {}
    player.world.lightLevels.sun = world.lightLevels.sun
    player.world.sunAngle = world.sunAngle
    player.world.moonAngle = world.moonAngle
    player.world.mobs = world.mobs
    player.world.time = world.time

    for(y=player.indexes.startY; y<=player.indexes.endY; y++){
        player.world.lightLevels.map[y] = {}
        for(x=player.indexes.startX; x<=player.indexes.endX; x++){
            if(!world.lightLevels.map[y] || world.lightLevels.map[y][x] == undefined) player.world.lightLevels.map[y][x] = 0
            else player.world.lightLevels.map[y][x] = world.lightLevels.map[y][x]
        }
    }

    let r = Math.random()
    // console.log(world)
    if(r<0.1) spawnMob(player, world, map)
    player.world.mobs = world.mobs

    //movement og collision
    if(player.moving){
        if(player.direction=="left"){
            if(player.movement == "running") player.vx = -speed*2
            else player.vx = -speed
        }
        else{
            if(player.movement == "running") player.vx = speed*2
            else player.vx = speed
        }
    }
    else{
        if(player.falling){
            player.vx *= 0.95
        }
        else{
            player.vx *= 0.9
        }
    }

    if(player.sprite.counter > player.sprite.delay) updateSprites(player)
    else player.sprite.counter ++

    if(player.mouse.counter > player.mouse.delay){
        if(player.mouse.keys[0]) click(0, player, map, world, users)
        else if(player.mouse.keys[2]) click(2, player, map, world, users)
    }
    else player.mouse.counter ++

    //klatring i stige
    // if(map[Math.floor(player.y + 2)][Math.floor(player.x + 1)] == 11 || map[Math.floor(player.y + 1)][Math.floor(player.x + 1)] ==11 || map[Math.floor(player.y + 2)][Math.floor(player.x)] ==11 || map[Math.floor(player.y + 1)][Math.floor(player.x)] == 11){
    //     if(player.controller.up){
    //         player.vy = -0.005
    //     }
    // }


    // viktige punkter på spilleren
    player.pos.topRight = {x: player.x+1-9/32, y: player.y+20/64}
    player.pos.midRight = {x: player.x+1-9/32, y: player.y+1+20/64}
    player.pos.botRight = {x: player.x+1-9/32, y: player.y+1.99}
    player.pos.topLeft = {x: player.x+9/32, y: player.y+20/64}
    player.pos.midLeft = {x: player.x+9/32, y: player.y+1+20/64}
    player.pos.botLeft = {x: player.x+9/32, y: player.y+1.99}


    //kollisjon høyre side
    if(player.vx>0){
        if(equalsSome(mapValue(player.pos.topRight, map), solidBlocks) || equalsSome(mapValue(player.pos.midRight, map), solidBlocks) || equalsSome(mapValue(player.pos.botRight, map), solidBlocks)){
            player.vx = 0
        }
    }

    //kollissjon venstre side
    if(player.vx<0){
        if(equalsSome(mapValue(player.pos.topLeft, map), solidBlocks) || equalsSome(mapValue(player.pos.midLeft, map), solidBlocks) || equalsSome(mapValue(player.pos.botLeft, map), solidBlocks)){
            player.vx = 0
        }
    }

    //kollisjon når spilleren beveger seg oppover
    if(player.vy<0){
        if(equalsSome(mapValue(player.pos.topLeft, map), solidBlocks) || equalsSome(mapValue(player.pos.topRight, map), solidBlocks)){
            player.vy = 0
        }
    }


    if(solidBlocks.indexOf(map[Math.round(player.y+2)][Math.floor(player.pos.botLeft.x)])==-1 && solidBlocks.indexOf(map[Math.round(player.y+2)][Math.floor(player.pos.botRight.x)])==-1){
        player.falling = true
    }

    //kollisjon når spilleren faller og treffer bakken
    if(player.falling){
        if((equalsSome(mapValue(player.pos.botLeft, map), solidBlocks) || equalsSome(mapValue(player.pos.botRight, map), solidBlocks)) && player.vy>0){
            player.falling = false
            player.y = Math.round(player.y)
            player.vy = 0
        }
        else{
            player.vy+=g
        }
    }
    if(player.vx < 0 && player.x < 0) player.x = 0
    else if(player.vx > 0 && player.x > map[0].length-1) player.x = map[0].length-1
    else player.x+=player.vx
    player.y+=player.vy
}



function keysD(keyCode, player, controller){
    if(keyCode==65){
        if(equalsSome(player.direction, ["right", "front"])) player.sprite.index = 0
        player.direction = "left"
        player.moving = true
        controller.left = true
    }
    else if(keyCode==68){
        if(equalsSome(player.direction, ["left", "front"])) player.sprite.index = 0
        player.direction = "right"
        player.moving = true
        controller.right = true
    }
    else if(keyCode==66){
        player.moving = true
        controller.up = true
    }
    else if(keyCode==32){
        if(!player.falling){
            player.falling = true
            player.vy = -0.01*4
        }
    }
    //shift, aka sprint
    else if(keyCode == 16){
        playerMovement(player, "running")
    }
}

function keysU(keyCode, player, controller){
    if(keyCode==65){
        if(!controller.right){
            player.moving = false
            player.direction = "front"
            player.sprite.index = 0
        }
        controller.left = false
    }
    if(keyCode==68){
        if(!controller.left){
            player.moving = false
            player.direction = "front"
            player.sprite.index = 0
        }
        controller.right = false
    }
    //shift, aka sprint
    else if(keyCode == 16){
        playerMovement(player, "walking")
    }
}

function updatePlayerHand(player){
    player.hand = player.inventory.arr[23+player.hotBarSpot]
}
function click(keyCode, player, map, world, users){
    player.mouse.counter = 0    
    //høyreklikk, sjekker om man kan sette ut blokk
    const [py, px, PY, PX] = [player.mouse.r.y, player.mouse.r.x, player.mouse.y, player.mouse.x]
    if(py < 1 || py > map.length-1 || px < 1 || px > map[0].length-1) return false
    if(keyCode==2){
        if(map[py][px]==0){
            if(px!=Math.floor(player.x) || (py!=Math.floor(player.y) && py!=Math.floor(player.y+1))){
                if(map[py+1][px]!=0 || map[py-1][px]!=0 || map[py][px+1]!=0 || map[py][px-1]!=0){
                    if(Math.sqrt(Math.pow(player.x+1-7/32 - PX, 2) + Math.pow(player.y+16/32 - PY, 2))<=5){
                        if(sight([player.x+0.5, player.y+1], [PX, PY], py, px, map)){
                            //sjekker om spiller trykker på en interactable
                            if(player.hand){
                                //sjekker om spiller holder en blokk i hånden
                                if(player.hand.type == "block"){
                                                                
                                    map[py][px] = player.hand.value

                                    player.hand.number -= 1
                                    if(player.hand.value == 11) updateLightLevels(users, world.time, map, world, users)
                                }
                                else if(player.hand.type == "interactable"){
                                    map[py][px] = player.hand.value
                                    if(!world.interactMap[py]) world.interactMap[py] = {}
                                    if(player.hand.value == 8) world.interactMap[py][px] = new Safe(px, py)
                                    player.hand.number -= 1
                                }

                                //hvis spiller har brukt opp den siste av en blokk skal den fjernes
                                if(player.hand.number <= 0){
                                    delete player.inventory.arr[player.hand.index]
                                    player.inventory.arr[player.hand.index] = new Item("empty", 0, null, player.hand.index, player.hand.container, false)
                                    delete player.hand
                                    updatePlayerHand(player)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if(keyCode==0){
        if(Math.sqrt(Math.pow(player.x+1-7/32 - PX, 2) + Math.pow(player.y+16/32 - PY, 2))<=5){
            if(sight([player.x+0.5, player.y+1], [PX, PY], py, px, map)){
                if(mapValue(player.mouse.r, map) != 0) mine(player, map, world, users)
            }
        }
    }
}
//oppdaterer om recipien gir noen match
function updateCraftedItem(player){
    const craftedItem = checkRecipe(player.crafting.arr)
    if(craftedItem){
        player.craftedItem = craftedItem
        delete craftedItem
    }
    else{
        if(player.craftedItem) delete player.craftedItem
    }
}
function craftingMinus(player){
    for(let i = 0; i < player.crafting.arr.length; i++){
        if(player.crafting.arr[i].type != "empty"){
            player.crafting.arr[i].number --
            if(player.crafting.arr[i].number <= 0){
                delete player.crafting.arr[i]
                player.crafting.arr[i] = new Item("empty", 0, null, i, "crafting", false)
            }
        }
    }
    updateCraftedItem(player)
}
function pickupItem(player, map, fromCrafting){
    //hvis det ikke finnes noe i "ferdig-craft" ruten
    if(fromCrafting && !player.craftedItem) return

    //adde til inventory, sjekker først om man kan legge den inn i en eksisterende bunke
    for(let i = player.inventory.arr.length-1; i >= 0; i--){
        //hvis det finnes en stack med itemet fra før der det er plass
        if(fromCrafting && player.inventory.arr[i].number < 65-player.craftedItem.quantity && player.craftedItem.value == player.inventory.arr[i].value){
            player.inventory.arr[i].number += player.craftedItem.quantity
            delete player.craftedItem
            craftingMinus(player)
            return
        }
        else if(!fromCrafting && player.inventory.arr[i].value == mapValue(player.mining.current, map) && player.inventory.arr[i].number < 64){
            player.inventory.arr[i].number += 1
            map[player.mining.current.y][player.mining.current.x] = 0
            player.mining.active = false
            return
        }
    }
    //hvis det ikke finnes prøver den å fylle en tom plass
    for(let i = player.inventory.arr.length-1; i >= 0; i--){
        //hvis det finnes en stack med itemet fra før der det er plass
        if(player.inventory.arr[i].type == "empty"){
            delete player.inventory.arr[i]
            if(fromCrafting){
                player.inventory.arr[i] = new Item(player.craftedItem.type, player.craftedItem.value, player.craftedItem.quantity, i, "inventory", false)
                delete player.craftedItem
                craftingMinus(player)
                return
            }
            else if(!fromCrafting){
                player.inventory.arr[i] = new Item("block", mapValue(player.mining.current, map), 1, i, "inventory", false)
                map[player.mining.current.y][player.mining.current.x] = 0
                player.mining.active = false
                return
            }
        }
    }
}
function mine(player, map, world, users){
    if(player.mining.active && player.mining.current.x == player.mouse.r.x && player.mining.current.y == player.mouse.r.y){
        player.mining.stage += stageIncrement(player.hand, player.mining.current, map)
        if(player.mining.stage > 5){
            pickupItem(player, map, false)
            updateLightLevels(users, world.time, map, world)
        }
    }
    else{
        player.mining.active = true
        player.mining.current = {x: player.mouse.r.x, y: player.mouse.r.y}
        player.mining.stage = 0
        player.mining.difficulty = 1
    }
}
//Sjekker om det er blokker mellom spilleren og musa
function sight(pPos, mPos, py, px, map){
    let a = (mPos[1]-pPos[1])/(mPos[0]-pPos[0])
    for(x=pPos[0]; x<mPos[0]; x+=0.1){
        if(Math.floor(pPos[1]+(x-pPos[0])*a)==py && Math.floor(x)==px){
            return true
        }
        if(solidBlocks.indexOf(map[Math.floor(pPos[1]+(x-pPos[0])*a)][Math.floor(x)])!=-1){
            return false
        }
    }
    for(x=pPos[0]; x>mPos[0]; x-=0.1){
        if(Math.floor(pPos[1]+(x-pPos[0])*a)==py && Math.floor(x)==px){
            return true
        }
        if(solidBlocks.indexOf(map[Math.floor(pPos[1]+(x-pPos[0])*a)][Math.floor(x)])!=-1){
            return false
        }
    }
    return true
}
//Sjekker om spilleren har trykket på en block man kan interagere med
function interaction(player, interactMap){
    if(interactMap[player.mouse.r.y][player.mouse.r.x].name == "Safe"){
        player.safe = interactMap[player.mouse.r.y][player.mouse.r.x]
        return "safeOpened"
    }
    return false
}


// funksjon som bytter plass på 2 inventoryItems, kan være et tomt item og en blokk f.eks
// parameterene index og container fortelleren hvor brukeren har trykket, og hvilken container den har trykket i
// hvilken index i hvilken container
// den åpnede safen og inventory er accesible gjennom player
function swap(player, index, container, button){
    if(player.selectedSwap){

        //tidligere valgte Item (allerede highlighted)
        const swap = player.selectedSwap
  
        //senest valgte Item
        const cItem = player[container].arr[index]

        //for crafting lenger nede
        const container1 = swap.container
        const container2 = cItem.container


        if(cItem.container == swap.container && cItem.index == swap.index){
            delete player.selectedSwap
            player[swap.container].arr[swap.index].highlighted = false
            return
        }
        if(button == 2){
            if(equalsSome(swap.type, ["block", "material"]) && equalsSome(cItem.type, ["empty", "block", "material"])){
                if(cItem.type == "empty"){
                    delete player[container].arr[index]
                    player[container].arr[index] = new Item(swap.type, swap.value, 1, cItem.index, cItem.container, false)
                    player[swap.container].arr[swap.index].number --
                    delete player.selectedSwap
                    player.selectedSwap = player[swap.container].arr[swap.index]
                }
                else if(cItem.value == swap.value && cItem.number < 64){
                    cItem.number ++
                    player[swap.container].arr[swap.index].number --
                    delete player.selectedSwap
                    player.selectedSwap = player[swap.container].arr[swap.index]
                }
                
                //hvis itemet du holder går tomt skal det bli borte
                if(player[swap.container].arr[swap.index].number <= 0){
                    delete player[swap.container].arr[swap.index]
                    player[swap.container].arr[swap.index] = new Item("empty", 0, null, swap.index, swap.container, false)
                    delete player.selectedSwap
                }
            }
        }
        else{

            //sjekker først om det er items av samme type, slik at vi kan legge de sammen
            if(cItem.value == swap.value && equalsSome(cItem.type, ["material", "block"]) && equalsSome(swap.type, ["material", "block"]) && swap.number != 64 && cItem.number != 64){
                //kan endre på cItem istedenfor å endre på player[container].arr[index] fordi de henger sammen (begge er pekere på det samme stedet i minne)
                //men kan ikke endre på swap for å endre på den forrige man trykket på, fordi den kun er linket til player.selectedSwap, og player.selectedSwap
                //er ikke linket til denne plassen, den er bare en "kopi", dermed er cItem og bare en kopi
                cItem.number += swap.number
                if(cItem.number > 64){
                    player[swap.container].arr[swap.index].number = cItem.number - 64
                    cItem.number = 64
                    player[swap.container].arr[swap.index].highlighted = false
                    //legges bare tilbake igjen
                }
                else{
                    delete player[swap.container].arr[swap.index]
                    player[swap.container].arr[swap.index] = new Item("empty", 0, null, swap.index, swap.container, false)
                }
            }
            else{
                //hvis de itemsa som skal byttes ikke er av samme type
                //bruker delete for unngå at serveren kan krasje ved lange kjøretider pga fullt minne
                delete player[swap.container].arr[swap.index]
                player[swap.container].arr[swap.index] = new Item(cItem.type, cItem.value, cItem.number, swap.index, swap.container, false)
                delete player[container].arr[index]
                player[container].arr[index] = new Item(swap.type, swap.value, swap.number, cItem.index, cItem.container, false)
            }
            //sletter sånn at ikke minnet blir fylt opp igjen og igjen hver gang man lager new Object()
            delete cItem
            delete swap
            delete player.selectedSwap
        }
        if(container1 == "crafting" || container2 == "crafting"){
            updateCraftedItem(player)
        }
    }
  
    //hvis spilleren ikke har valgt et Item for bytte enda, og det ikke er et tomt item der du trykker
    else if(player[container].arr[index].type != "empty" && button == 0){
    player[container].arr[index].highlighted = true
    const cItem = player[container].arr[index]
    player.selectedSwap = new Item(cItem.type, cItem.value, cItem.number, index, container, true)
    delete cItem
    }
}
let dayLength = Math.floor(30000/4)
function updateTime(world){
    world.time+=1
    if(world.time==dayLength){
        world.time = 0
    }
    updateSunAngle(world.time, dayLength, world)
}

function spawnMob(player, world, map){
    if(world.mobs.lenght>20) return
    let r1 = Math.floor(Math.random()*(player.indexes.endY-player.indexes.startY) + player.indexes.startY) 
    let r2 = Math.floor(Math.random()*(player.indexes.endX-player.indexes.startX) + player.indexes.startX)
    if(player.world.lightLevels.map[r1][r2]<4 && solidBlocks.indexOf(map[r1][r2])==-1 && solidBlocks.indexOf(map[r1+1][r2])==-1 && solidBlocks.indexOf(map[r1+2][r2])!=-1){
        world.mobs.push(new Zombie(r2, r1))
        let mob = world.mobs[world.mobs.length-1]
        setTimeout(
            function(){
                mob.kill(world.mobs)
            },
            18000
        )
        // console.log(mobs.length)
    }
    
}

function updateSunAngle(time, maxTime, world){
    world.sunAngle = (time/maxTime)*2*Math.PI - Math.PI
    world.moonAngle = world.sunAngle + Math.PI
}

function updateLightLevels(users, time, map, world){
    // console.log(lightEmittingBlocks)
    // if(world.lightLevels.sun==Math.floor(5*Math.sin(time/6000*2*Math.PI)+5) && !change) return
    
    world.lightLevels.sun = Math.floor(5*Math.sin(time/6000*2*Math.PI)+5)
    for (let [id, user] of Object.entries(users)) {
        const indexes = user.player.indexes
        for(i= indexes.startX - 2; i<indexes.endX +2; i++){
            if(i < 0 || i >= map[0].length) continue
            let sunLight = world.lightLevels.sun
            for(j=indexes.startY -2; j<indexes.endY +2; j++){
                if(j < 0 || j >= map.length) continue

                world.lightLevels.map[j][i] = sunLight
                if(!equalsSome(map[j][i], lightThroughBlocks)){
                    sunLight = 0
                }
                if(lightEmittingBlocks.indexOf(map[j][i])!=-1){
                    world.lightLevels.map[j][i] = 10
                }
            }
        }
        for(i=indexes.startY -2; i<indexes.endY +2; i++){
            if(i < 0 || i >= world.lightLevels.map.length) continue
            for(j=indexes.startX -2; j<indexes.endX +2; j++){
                if(j < 0 || j >= world.lightLevels.map[0].length) continue
                rec(j,i, world.lightLevels.map, map, indexes)
            }
        }      
    }
}

function rec(x, y, lightmap, map, indexes){
    if(lightmap[y][x]==1) return
    if(x < indexes.startX-2 || x > indexes.endX+2 || y < indexes.startY-2 || y > indexes.endY+2) return
    if(y<map.length-1){
        if(lightmap[y][x]>lightmap[y+1][x]+1){
            lightmap[y+1][x] = lightmap[y][x]-1
            rec(x,y+1, lightmap, map, indexes)
        }
    }
    if(y>0){
        if(lightmap[y][x]>lightmap[y-1][x]+1){
            lightmap[y-1][x] = lightmap[y][x]-1
            rec(x,y-1, lightmap, map, indexes)
        }
    }
    if(x<map[0].length-1){
        if(lightmap[y][x]>lightmap[y][x+1]+1){
            lightmap[y][x+1] = lightmap[y][x]-1
            rec(x+1,y, lightmap, map, indexes)
        }
    }
    if(x>0){
        if(lightmap[y][x]>lightmap[y][x-1]+1){
            lightmap[y][x-1] = lightmap[y][x]-1
            rec(x-1,y, lightmap, map, indexes)
        }
    }
}







module.exports = {update, keysD, keysU, click, sight, updateSprites, interaction, updatePlayerHand, swap, pickupItem, updateTime, updateLightLevels}
