let showInventory = false
let showSafe = false
let selectedInventoryIndex = 0
let inventorySwap = false
let animationSkipCount = 0
let fpsNumber = 0
form.onsubmit = (e) => {
    // dette er henriks kommentar
    //Jørgen er kul
    e.preventDefault()
        socket.emit('new-user', textField.value, w, h)
        form.style.display = "none"
        fpsNumber = (fps[0].checked==true) ? 2 : 1
        console.log(fpsNumber)
        socket.on("playerID", id => {
            playerID = id
            console.log(playerID)
        })
        socket.on('heartbeat', (users, mapWidth, mapHeight) => {
            for (let [id, user] of Object.entries(users)) {
                user.player.img = playerSprites[user.player.sprite.playerSprite][user.player.movement][user.player.direction][user.player.sprite.index]
            }
            animationSkipCount+=1
            if(animationSkipCount==fpsNumber){
                if(playerID) draw(users, mapWidth, mapHeight)
                animationSkipCount = 0
            }
        })
    
        window.addEventListener("keydown", e => {
            if(equalsSome(e.keyCode, [65, 68, 32, 66, 16])) socket.emit('keysD', e.keyCode, clientX, clientY, canvas.width, canvas.height)
            if(e.keyCode == 69/*nice*/ && !showSafe){
                showInventory = !showInventory
                if(!showInventory) socket.emit("closeInventory")
            }
            if(e.keyCode == 27/*nice*/){
                showSafe = false
                showInventory = false
                socket.emit("closeInventory")
            }

            //hotbar-opplegg
            if(Number(e.key)){
                socket.emit("changeItem", Number(e.key))
            }
        })
    
        window.addEventListener("keyup", e => {
            if(equalsSome(e.keyCode, [65, 68, 66, 16])) socket.emit('keysU', e.keyCode)
        })

        window.addEventListener("mousemove", e => {
            clientX = e.clientX
            clientY = e.clientY
        })

        function emitMouseMove(e){
            socket.emit("mousemove", e.clientX, e.clientY, canvas.width, canvas.height)
        }

        window.addEventListener("mousedown", e => {
            if(!showInventory && !showSafe){
                if(e.button == 0 || e.button == 2){
                    window.addEventListener("mousemove", emitMouseMove)
                    socket.emit('mousedown', e.button, e.clientX, e.clientY, canvas.width, canvas.height)
                }
            }
            else if(showInventory){
                const x = e.clientX
                const y = e.clientY
                if(x<(w-800-660)/2+800){
                    const p = Math.floor((x-(canvas.width-800-660)/2)/80-1) + Math.floor((y-(canvas.height-480)/2)/80-1)*8
                    if(p>=0 && p<=31){
                        socket.emit('swap', p, "inventory", e.button)
                    }
                }
                else if(x<(w-800-660)/2+800+420){
                    const p = Math.floor((x-(canvas.width-800-660)/2-860)/120 + Math.floor((y-(canvas.height-480)/2-60)/120)*3)
                    if(p>=0 && p<=8){
                        socket.emit('swap', p, "crafting", e.button)
                    }
                }
                else{
                    if(y<(h-480)/2+300 && y>(h-480)/2+180 && x>(w-800-660)/2+800+480 && x<(w-800-660)/2+800+600){
                        socket.emit('pickUpCraftedItem')
                    }
                }
            }
            else if(showSafe){
                var x = e.clientX
                var y = e.clientY
                if(x>(canvas.width - 1300)/2+800){
                    var p = Math.floor((x-(canvas.width-1300)/2-800)/100) + Math.floor((y-(canvas.height-500)/2)/100)*5
                    if(p>=0 && p<25){
                        socket.emit('swap', p, "safe", e.button)
                    }
                }
                else{
                    var p = Math.floor((x-(canvas.width-1300)/2-80)/80) + Math.floor((y-(canvas.height-480)/2-80)/80)*8
                    if(p>=0 && p<32){
                        socket.emit('swap', p, "inventory", e.button)
                    }
                }
            }
        })

        window.addEventListener("mouseup", e => {
            if(e.button == 0 || e.button == 2){
                window.removeEventListener("mousemove", emitMouseMove)
                socket.emit("mouseup", e.button)
            }
        })
        

        socket.on("safeOpened",() => {
            showSafe = true
        })
        
}

function draw(users, mapWidth, mapHeight){

    c.textAlign = "center"
    
    const player = users[playerID].player
    const inv = player.inventory.arr
    const map = player.map
    const world = player.world
    const lightMap = world.lightLevels.map
    // console.log(player.x, player.y)
    c.clearRect(0,0,w,h)
    c.drawImage(sky, 0, 0, w, h)
    c.fillStyle = `rgba(0, 0, 0, ${1-(world.lightLevels.sun+1)/10}`
    c.fillRect(0,0,w,h)
    c.drawImage(sun, h/2*Math.cos(world.sunAngle)*(1+Math.abs(Math.cos(world.sunAngle)*(w/h-1)))-64+w/2, h/2*Math.sin(world.sunAngle)+h/2, 128, 128)
    c.drawImage(moon, h/2*Math.cos(world.moonAngle)*(1+Math.abs(Math.cos(world.moonAngle)*(w/h-1)))-64+w/2, h/2*Math.sin(world.moonAngle)+h/2, 128, 128)
    
    //draws tilemap with shadows
    for(i=Math.floor(player.y - 32/64 - canvas.height/64); i<Math.ceil(player.y - 32/64 + canvas.height/64)+1; i++){
        if(i<0) continue
        if(i>=mapHeight) break
        for(j=Math.floor(player.x - 7/32 - canvas.width/64); j<Math.ceil(player.x - 7/32 + canvas.width/64)+1; j++){
            if(j<0) continue
            if(j>=mapWidth) break
            
            c.drawImage(imgs[map[i][j]], canvas.width/2 + 32*(j-player.x-7/32), canvas.height/2 + 32*(i-player.y-32/64), 32, 32)
            
            if(map[i][j]!=0){
                if(world.lightLevels.map[i][j]!=10){
                    c.drawImage(shadows[world.lightLevels.map[i][j]], canvas.width/2 + 32*(j-player.x-7/32), canvas.height/2 + 32*(i-player.y-32/64), 32, 32)
                }
            }
        }
    }
    
    //draw miningprogression
    if(player.mining.active && Math.floor(player.mining.stage) <= 4){
        c.drawImage(miningImgs[Math.floor(player.mining.stage)], canvas.width/2 + 32*(player.mining.current.x-player.x-7/32), canvas.height/2 + 32*(player.mining.current.y-player.y-32/64), 32, 32)
    }
    

    const px = Math.round(player.x - 7/32 + (clientX - canvas.width/2)/32)
    const py = Math.round(player.y + (clientY - canvas.height/2)/32)
    //tegne inn den blokken man titter på med hvit rundt
    if((map[py] && map[py][px]) || (map[py] && map[py][px+1]) || (map[py] && map[py][px-1]) || (map[py+1] && map[py+1][px]) || (map[py-1] && map[py-1][px])/*sjekker om det går an å sette ut blokk på stedet*/ ){
        c.strokeStyle = "white"
        c.strokeRect(canvas.width/2 + 32*(px-player.x-7/32), canvas.height/2 + 32*(py-player.y-32/64), 32, 32)
    }

    if(player.img) c.drawImage(player.img, (canvas.width-16)/2, (canvas.height-32)/2, 32, 64)
    c.fillStyle = "black"
    c.font = "20px Arial bold"
    c.fillText(users[playerID].username, (canvas.width-16)/2 + 16, (canvas.height-32)/2 - 16)


  
    for (let [id, user] of Object.entries(users)){
        if(id != playerID){
            if(user.player.img) c.drawImage(user.player.img, canvas.width/2 + 32*(user.player.x-player.x-7/32), canvas.height/2 + 32*(user.player.y-player.y-32/64), 32, 64)
            c.fillText(user.username, canvas.width/2 + 32*(user.player.x-player.x-7/32) + 16, canvas.height/2 + 32*(user.player.y-player.y-32/64) - 16)
        }
    }

    //tegne inn mobs
    // for(i=0; i<player.mobs.length; i++){
    //     c.drawImage(zombie.left, canvas.width/2 + 32*(player.mobs[i].x-player.x-7/32), canvas.height/2 + 32*(player.mobs[i].y-player.y-32/64), 32, 64)
    // }

    //font for inventory og hotbar
    c.font = "20px Arial bold"
    c.fillStyle = "black"

    if(showSafe){
        //tegner inventory i tillegg til safe
        c.drawImage(inventory, (canvas.width-1300)/2, (canvas.height-480)/2, 800, 480)
        for(i=0; i<32; i+=1){
            if(inv[i].type != "empty"){
                c.drawImage(imgs[inv[i].value], 100 + i%8*80 + (canvas.width - 1300)/2, 100 + Math.floor(i/8)*80 + (canvas.height-480)/2, 40, 40)

                //hvis boksen skal highlightes
                if(inv[i].highlighted){
                    c.strokeStyle = "white"
                    c.lineWidth = 4
                    c.strokeRect(100 + i%8*80 + (canvas.width - 1300)/2 - 5, 100 + Math.floor(i/8)*80 + (canvas.height-480)/2 - 5, 50, 50)
                }
                c.fillText(inv[i].number, 95 + (i%8)*80 + (canvas.width - 1300)/2, 100 + Math.floor(i/8)*80 + (canvas.height-480)/2)
            }
        }
        c.drawImage(safe_inside, (canvas.width-1300)/2+800, (canvas.height-500)/2, 500, 500)

        c.fillStyle = "white"
        for(i=0; i<25; i+=1){
            if(player.safe.arr[i].type != "empty"){
                c.drawImage(imgs[player.safe.arr[i].value], 30 + i%5*100 + (canvas.width - 1300)/2+800, 30 + Math.floor(i/5)*100 + (canvas.height-500)/2, 40, 40)
                
                //hvis boksen skal highlightes
                if(player.safe.arr[i].highlighted){
                    c.strokeStyle = "white"
                    c.lineWidth = 4
                    c.strokeRect(30 + i%5*100 + (canvas.width - 1300)/2+800 - 5, 30 + Math.floor(i/5)*100 + (canvas.height-500)/2 - 5, 50, 50)
                }  
                c.fillText(player.safe.arr[i].number, 30 + (i%5)*100 + (canvas.width - 1300)/2+800, 30 + Math.floor(i/5)*100 + (canvas.height-500)/2)
            }
        }
    }
    if(showInventory){
        c.fillStyle = "black"
        //tegner kun inventory
        //definerer disse to slik at man evt kan flytte de litt, uten at alt det andre ødelegges også (fungerer kanskje da ikke for swap?)
        const invPos = {x: (canvas.width-800-660)/2, y: (canvas.height-480)/2}
        const craftPos = {x: invPos.x+800, y: invPos.y}
        c.drawImage(inventory, invPos.x, invPos.y, 800, 480)
        c.drawImage(crafting, craftPos.x, craftPos.y, 660, 480)

        //tegne alt inne i inventory
        for(i=0; i<32; i+=1){
            if(inv[i].type != "empty"){
                //hvis boksen skal highlightes
                if(inv[i].highlighted){
                    c.strokeStyle = "white"
                    c.lineWidth = 4
                    c.strokeRect(100 + i%8*80 + invPos.x - 5, 100 + Math.floor(i/8)*80 + invPos.y - 5, 50, 50)
                }

                c.drawImage(imgs[inv[i].value], 100 + i%8*80 + invPos.x, 100 + Math.floor(i/8)*80 + invPos.y, 40, 40)
                c.fillText(inv[i].number, 95 + (i%8)*80 + invPos.x, 100 + Math.floor(i/8)*80 + invPos.y)
                
                
            }
        }

        //tegne alt inne i crafting
        for(let i=0; i<9; i++){
            if(player.crafting.arr[i].type != "empty"){
                //hvis boksen skal highlightes
                if(player.crafting.arr[i].highlighted){
                    c.strokeStyle = "white"
                    c.lineWidth = 4
                    c.strokeRect(95 + i%3*120 + craftPos.x -5, 95 + Math.floor(i/3)*120 + craftPos.y - 5, 60, 60)
                }

                c.drawImage(imgs[player.crafting.arr[i].value], 95 + i%3*120 + craftPos.x, 95 + Math.floor(i/3)*120 + craftPos.y, 50, 50)
                c.fillText(player.crafting.arr[i].number, 90 + (i%3)*120 + craftPos.x, 95 + Math.floor(i/3)*120 + craftPos.y)
            }
        }
        //tegne inn hvis spilleren har klart å lage et item som finnes i recipe
        if(player.craftedItem){
            c.drawImage(imgs[player.craftedItem.value], craftPos.x + 515, craftPos.y + 215, 50, 50)
            c.fillText(player.craftedItem.quantity, craftPos.x + 510, craftPos.y + 215)
        }
    }


    //kun tegne inn hotbaren
    else{

        //tenger rektangel rundt den valgte
        c.strokeStyle = "white"
        c.lineWidth = 4
        c.strokeRect(100 + (player.hotBarSpot + 23)%8*80 + (canvas.width - 800)/2-5, canvas.height-105, 50, 50)

        for(let i=24; i<32; i++){
            if(inv[i].type != "empty"){
                c.drawImage(imgs[inv[i].value], 100 + i%8*80 + (canvas.width - 800)/2, canvas.height-100, 40, 40)
                c.fillText(inv[i].number, 95 + (i%8)*80 + (canvas.width - 800)/2, canvas.height-100)
            }
            c.fillStyle = "black"
            c.fillText(i-23, 95 + (i%8)*80 + (canvas.width - 800)/2 + 52, canvas.height-100 + 52)
        }
    }
}

//Sjekker om det er blokker mellom spilleren og musa
function sight(pPos, mPos, py, px, map){
    let a = (mPos[1]-pPos[1])/(mPos[0]-pPos[0])
    for(x=pPos[0]; x<mPos[0]; x+=0.01){
        if(Math.floor(pPos[1]+(x-pPos[0])*a)==py && Math.floor(x)==px){
            return true
        }
        if(map[Math.floor(pPos[1]+(x-pPos[0])*a)][Math.floor(x)]!=0){
            return false
        }
    }
    for(x=pPos[0]; x>mPos[0]; x-=0.01){
        if(Math.floor(pPos[1]+(x-pPos[0])*a)==py && Math.floor(x)==px){
            return true
        }
        if(map[Math.floor(pPos[1]+(x-pPos[0])*a)][Math.floor(x)]!=0){
            return false
        }
    }
    return true
}