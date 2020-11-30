const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const form = document.querySelector('form')
const textField = document.getElementById('textField')
const socket = io.connect("localhost:3000")//io.connect('172.104.146.167:3000')
let playerID


function newImg(src){
    let img = new Image()
    img.src = src
    return img
}

const playerSprites = {
    // girl: [newImg("assets/girl_left.png"), newImg("assets/girl_left.png"), newImg("assets/girl_front.png"), newImg("assets/girl_right.png"), newImg("assets/girl_right.png")],
    boy: {
      running: {
        left: [
          newImg("assets/player/man/running_left/1.png"), 
          newImg("assets/player/man/running_left/2.png"), 
          newImg("assets/player/man/running_left/3.png"), 
          newImg("assets/player/man/running_left/4.png")],
        front: [newImg("assets/player/man/front/boy_front.png")],
        right: [
          newImg("assets/player/man/running_right/1.png"), 
          newImg("assets/player/man/running_right/2.png"), 
          newImg("assets/player/man/running_right/3.png"), 
          newImg("assets/player/man/running_right/4.png")]
      },
      walking: {
        left: [
          newImg("assets/player/man/walking_left/1.png"), 
          newImg("assets/player/man/walking_left/mid.png"), 
          newImg("assets/player/man/walking_left/2.png"), 
          newImg("assets/player/man/walking_left/mid.png")],
        front: [newImg("assets/player/man/front/boy_front.png")],
        right: [
          newImg("assets/player/man/walking_right/1.png"), 
          newImg("assets/player/man/walking_right/mid.png"), 
          newImg("assets/player/man/walking_right/2.png"), 
          newImg("assets/player/man/walking_right/mid.png")]
      },
      mining: ["assets/player/man/mining/1.png", "assets/player/man/mining/2.png", "assets/player/man/mining/3.png", "assets/player/man/mining/4.png"]
    }
}
const air = newImg("../game/assets/blocks/general/air.png")

const grass = newImg("../game/assets/blocks/general/grass.png")
const zombie = {left: newImg("../game/assets/mobs/zombie_left.png"), right: newImg("../game/assets/mobs/zombie_left.png")}

const dirt = newImg("../game/assets/blocks/general/dirt.png")

const log = newImg("../game/assets/blocks/general/log.png")

const leaves = newImg("../game/assets/blocks/general/leaves.png")

const stone = newImg("../game/assets/blocks/general/stone.png")

const coal_ore = newImg("../game/assets/blocks/ores/coal_ore.png")

const iron_ore = newImg("../game/assets/blocks/ores/iron_ore.png")

const gold_ore = newImg("../game/assets/blocks/ores/gold_ore.png")

const plutonium_ore = newImg("../game/assets/blocks/ores/plutonium_ore.png")

const silver_ore = newImg("../game/assets/blocks/ores/silver_ore.png")

const uranium_ore = newImg("../game/assets/blocks/ores/uranium_ore.png")
const sun = newImg("../game/assets/backgrounds/sun.png")
const moon = newImg("../game/assets/backgrounds/moon.png")

const shadow10 = newImg("../game/assets/backgrounds/shadow10.png")
const shadow20 = newImg("../game/assets/backgrounds/shadow20.png")
const shadow30 = newImg("../game/assets/backgrounds/shadow30.png")
const shadow40 = newImg("../game/assets/backgrounds/shadow40.png")
const shadow50 = newImg("../game/assets/backgrounds/shadow50.png")
const shadow60 = newImg("../game/assets/backgrounds/shadow60.png")
const shadow70 = newImg("../game/assets/backgrounds/shadow70.png")
const shadow80 = newImg("../game/assets/backgrounds/shadow80.png")
const shadow90 = newImg("../game/assets/backgrounds/shadow90.png")
const shadow100 = newImg("../game/assets/backgrounds/shadow100.png")
const shadows = [shadow10, shadow20, shadow30, shadow40, shadow50, shadow60, shadow70, shadow80, shadow90, shadow100]
shadows.reverse()


const sky = newImg("../game/assets/backgrounds/sky.png")

const inventory = newImg("../game/assets/ui/inventory.png")

const safe_inside = newImg("../game/assets/ui/safe_inside.png")

const crafting = newImg("../game/assets/ui/crafting.png")

const tool_base = newImg("../game/assets/tools/tool_base.png")

const bedrock = newImg("../game/assets/blocks/general/bedrock.png")

const safe = newImg("../game/assets/blocks/interactables/safe.png")

const torch = newImg("../game/assets/blocks/special/torch_straight.png")

const iron_nugget = newImg("assets/materials/iron_nugget.png")
const silver_nugget = newImg("assets/materials/silver_nugget.png")
const gold_nugget = newImg("assets/materials/gold_nugget.png")
const coal = newImg("assets/materials/coal.png")
const uranium = newImg("assets/materials/uranium.png")

const iron_pick = newImg("../game/assets/tools/iron_pick.png")
const stone_pick = newImg("../game/assets/tools/stone_pick.png")
const wood_pick = newImg("../game/assets/tools/wood_pick.png")
const iron_shovel = newImg("../game/assets/tools/iron_shovel.png")
const stone_shovel = newImg("../game/assets/tools/stone_shovel.png")
const wood_shovel = newImg("../game/assets/tools/wood_shovel.png")
const iron_axe = newImg("../game/assets/tools/iron_axe.png")
const stone_axe = newImg("../game/assets/tools/stone_axe.png")
const wood_axe = newImg("../game/assets/tools/wood_axe.png")

const imgs = [air, stone, log, leaves, coal_ore, grass, iron_ore, dirt, safe, tool_base, bedrock, torch, stone_pick, gold_ore, silver_ore, plutonium_ore, uranium_ore, iron_nugget, gold_nugget, silver_nugget, uranium, coal, iron_pick, wood_pick, iron_axe, stone_axe, wood_axe, iron_shovel, stone_shovel, wood_shovel]



const stage1 = newImg("assets/mining/stage1.png")
const stage2 = newImg("assets/mining/stage2.png")
const stage3 = newImg("assets/mining/stage3.png")
const stage4 = newImg("assets/mining/stage4.png")
const stage5 = newImg("assets/mining/stage5.png")
const miningImgs = [stage1, stage2, stage3, stage4, stage5]

canvas.width = window.innerWidth
canvas.height = window.innerHeight
const w = window.innerWidth
const h = window.innerHeight
var clientX = 0
var clientY = 0
var users = {}

function equalsSome(val, arr){
  let value = val
  for(let i = 0; i < arr.length; i++){
    if(arr[i] == value) return true
  }
  return false
}

const fl = num => Math.floor(num)
const ce = num => Math.ceil(num)
const ro = num => Math.r(num)
const sq = num => Math.sqrt(num)
const pow = (num, ex) => Math.pow(num, ex)
const dist = (p1, p2) => sq(pow(p2.x-p1.x, 2) + pow(p2.y-p1.y, 2))
