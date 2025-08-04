export class Tiles{
    constructor(){
        this.tilesData[
            {name: empty, color: "#000000", walkable: false},
            {name:ground, color: "rgba(84, 82, 63, 0.964)", walkable: true} 
        ]
    }

    getTile(tileID) {
        return this.tilesData[tileID]
    }

    isWalkable(tileID) {
        return this.tilesData[tileID].walkable
    }

    drawTile(ctx, tileID, x, y, tileSize){
        ctx.fillStyle = this.tilesData[tileID].image
        ctx.fillRect(x, y, tileSize, tileSize)
    }
}