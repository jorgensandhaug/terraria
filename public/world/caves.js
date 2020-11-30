function getWallCount(arr, x, y){
    let wallCount = 0
    for(let i = y-1; i <= y+1; i++){
        for(let j = x-1; j <= x+1; j++){
            if(!arr[i]) wallCount++
            else if(arr[i][j] == undefined) wallCount++
            else if(arr[i][j]) wallCount++
        }
    }
    return wallCount
}

function createCaveMap(width, height, blockSize, fillPercent){
    //lage et tomt 2-dimensjonalt array
    let arr = []
    for(let y = 0; y < Math.floor(height/blockSize); y++){
        arr.push([])
        for(let x = 0; x < Math.floor(width/blockSize); x++){
            arr[y].push([])
            arr[y][x] = random(100) < fillPercent ? 1 : 0
        }
    }

    //smooth map
    for(let i = 0; i < 10; i++){
        for(let y = 0; y < arr.length; y++){
            for(let x = 0; x < arr[0].length; x++){
                const wallCount = getWallCount(arr, x, y)
                if(wallCount > 4) arr[y][x] = 1
                else if(wallCount < 4) arr[y][x] = 0
            }
        }
    }
    // console.log("starter ny seksjon etter dette")
    //floodfill
    removeSmallTilesInMap(arr, width, height, blockSize, 8, 60)
    
    // let region = getRegionTiles(arr, 100, 80, width, height, blockSize, map[80][100])
    // console.log(region.tiles, region.flags)
    return arr
}


//implementerer cavemappet inn i det andre mappet
function adjustMap(caveMap, map){
    
    for(let y = 0; y < map.length; y++){
        for(let x = 0; x < map[0].length; x++){
            if(caveMap[y][x] == 0 && !equalsSome(map[y][x], [2, 3, 10])) map[y][x] = 0
        }
    }
    
    //fjerner trær som henger i luften
    for(let y = 0; y < map.length; y++){
        for(let x = 0; x < map[0].length; x++){
            //woodblock = 2
            if(map[y][x] == 2 && map[y-2][x] == 2 && map[y+1][x] == 0){
                
                //fjerner treet
                map[y+1][x] = 0
                map[y][x] = 0
                map[y-1][x] = 0
                map[y-2][x] = 0
                map[y-2][x-1] = 0
                map[y-2][x-2] = 0
                map[y-2][x+1] = 0
                map[y-2][x+2] = 0
                map[y-3][x] = 0
                map[y-3][x-1] = 0
                map[y-3][x-2] = 0
                map[y-3][x+1] = 0
                map[y-3][x+2] = 0
                map[y-4][x-1] = 0
                map[y-4][x] = 0
                map[y-4][x+1] = 0
                map[y-5][x] = 0
            }
        }
    }
}

function getRegionTiles(map, startX, startY, width, height, blockSize, tileType){
    let list = []
    let mapFlags = []
    let queue = [{x:startX, y:startY}]
    //fylle mapFlags
    for(let y = 0; y < f(height/blockSize); y++){
        mapFlags[y] = []
        for(let x = 0; x < f(width/blockSize); x++){
            mapFlags[y][x] = 0
        }
    }

    mapFlags[startY][startX] = 1
    // debugger
    while(queue.length > 0){
        const tile = queue[0]
        queue.splice(0, 1)
        list.push(tile)
        
        for(let y = tile.y-1; y<=tile.y+1; y++){
            for(let x = tile.x-1; x<=tile.x+1; x++){
                if(map[y] && map[y][x] != undefined && (y==tile.y || x==tile.x)){
                   if(mapFlags[y][x] == 0 && map[y][x] == tileType){
                        mapFlags[y][x] = 1
                        queue.push({x:x,y:y})
                   }
                } 
            }
        }
    }
    
    return {tiles: list, flags: mapFlags}
}


function getAllRegions(map, width, height, blockSize, tileType){
    let regions = []
    let mapFlags = []
    //fylle mapFlags med nuller
    for(let y = 0; y < f(height/blockSize); y++){
        mapFlags[y] = []
        for(let x = 0; x < f(width/blockSize); x++){
            mapFlags[y][x] = 0
        }
    }


    //funksjonaliteten
    for(let y = 0; y < f(height/blockSize); y++){
        for(let x = 0; x < f(width/blockSize); x++){
            if(mapFlags[y][x]==0 && map[y][x] == tileType){
                let newRegion = getRegionTiles(map, x, y, width, height, blockSize, tileType)
                regions.push(newRegion.tiles)
                //adder alle flags fra regionen til alle flags
                newRegion.flags.forEach( (row, i) =>{
                    row.forEach( (val, j) =>{
                        if(val == 1){
                            mapFlags[i][j] = 1
                        }
                    })
                })
                
            }
        }
    }
    return regions
}

function removeSmallTilesInMap(map, width, height, blockSize, thresholdWall, thresholdAir){
    let wallRegions = getAllRegions(map, width, height, blockSize, 1)
    let airRegions = getAllRegions(map, width, height, blockSize, 0)
    
    wallRegions.forEach( (region, i) => {
        if(region.length < thresholdWall){
            //sletter denne regionen fra mappet
            region.forEach( (tile, j) => {
                map[tile.y][tile.x] = 0
            })
        }
    })
    airRegions.forEach( (region, i) => {
        if(region.length < thresholdAir){
            //sletter denne regionen fra mappet
            region.forEach( (tile, j) => {
                map[tile.y][tile.x] = 1
            })
        }
    })
}