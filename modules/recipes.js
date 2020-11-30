const variables = require("./variables")
const Item = variables.Item
let recipes = {}

function addRecipe(grid, type, value, quantity){
    current = recipes
    for(i=0; i<grid.length; i++){
        if(current[grid[i]]==undefined){
            current[grid[i]] = {}
        }
        current = current[grid[i]]
    }
    current.value = value
    current.quantity = quantity
    current.type = type
}


function checkRecipe(currentRecipe){
    try{
        const a = recipes[currentRecipe[0].value][currentRecipe[1].value][currentRecipe[2].value][currentRecipe[3].value][currentRecipe[4].value][currentRecipe[5].value][currentRecipe[6].value][currentRecipe[7].value][currentRecipe[8].value]
        if(a==undefined){
            return false
        }
        return a
    }
    catch{
        return false
    }
}




function addRecipeSingleItem(val, type, outComeValue, quantity){
    for(let i = 0; i < 9; i++){
        let arr = []
        for(let j = 0; j < 9; j++){
            if(i==j) arr[j] = val
            else arr[j] = 0
        }
        addRecipe(arr, type, outComeValue, quantity)
    }
}
function addToolRecipe(recipe, valArr, type, outComeArr){
    for(let i = 0; i < valArr.length; i++){
        let rec = []
        for(let j = 0; j < recipe.length; j++){
            if(recipe[j] == 1)rec[j] = valArr[i]
            else if(recipe[j] == 2) rec[j] = 9
            else rec[j] = 0
        }
        addRecipe(rec, type, outComeArr[i])
    }
}
//pickaxes
addToolRecipe([1,1,1,0,2,0,0,2,0], [1, 2, 17], "pickaxe", [12, 23, 22])
addToolRecipe([0,1,1,0,2,1,0,2,0], [1, 2, 17], "axe", [25, 26, 24])
addToolRecipe([1,1,0,1,2,0,0,2,0], [1, 2, 17], "axe", [25, 26, 24])
addToolRecipe([0,1,0,0,2,0,0,2,0], [1, 2, 17], "shovel", [28, 29, 27])
//torches
addRecipe([0,0,0,0,21,0,0,9,0], "block", 11, 4)

//1 wood til 4 sticks
addRecipeSingleItem(2, "material", 9, 4)
//iron og coal og gold og silver til ingots
addRecipeSingleItem(4, "material", 21, 2)
addRecipeSingleItem(6, "material", 17, 2)
addRecipeSingleItem(13, "material", 18, 2)
addRecipeSingleItem(14, "material", 19, 2)
addRecipeSingleItem(16, "material", 20, 2)

//safe
addRecipe([1,1,1,17,18,17,1,1,1], "interactable", 8, 1)



module.exports = {checkRecipe}