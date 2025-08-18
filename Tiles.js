export class Tiles{
    constructor(){
        this.tileData = [
            { name: "empty",  color: "#000000", walkable: false },
            { name: "floor",  color: "linear-gradient(to bottom, #e0e0e0 0%, #c0c0c0 45%, #a0a0a0 100%)",    walkable: true  },
            { name: "wall",   color: "#222",    walkable: false }
          ];
    }

    getTile(tileID) {
        return this.tileData[tileID]
    }

    isWalkable(tileID) {
        return this.tileData[tileID].walkable
    }
}