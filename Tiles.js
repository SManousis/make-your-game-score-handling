export class Tiles{
    constructor(){
        this.tileData = [
            { name: "empty",  color: "#000000", walkable: false },
            { name: "floor",  color: "rgba(255, 255, 255, 0.96)",    walkable: true  },
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