export default function pathfinding(currentScene, tiles) {

  // TODO: create separate file for pathfinding
  // Initializing the pathfinder
  currentScene.finder = new EasyStar.js();

  // We create the 2D array representing all the tiles of our map
  var grid = [];
  for(var y = 0; y < currentScene.map.height; y++){
      var col = [];
      for(var x = 0; x < currentScene.map.width; x++){
          // In each cell we store the ID of the tile, which corresponds
          // to its index in the tileset of the map ("ID" field in Tiled)

          if (currentScene.getTileID(x,y) === null) {
            console.log('Null Value detected!!!');
          } else {
            col.push(currentScene.getTileID(x,y));
          }

      }
      grid.push(col);
  }
  currentScene.finder.setGrid(grid);
  console.table(grid);

  var tileset = currentScene.map.tilesets[0];
  var properties = tileset.tileProperties;
  var acceptableTiles = [];

  // We need to list all the tile IDs that can be walked on. Let's iterate over all of them
  // and see what properties have been entered in Tiled.

  for(var i = tileset.firstgid-1; i < tiles.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
      if(!properties.hasOwnProperty(i)) {
          // If there is no property indicated at all, it means it's a walkable tile
          // if(!properties[i].collides) acceptableTiles.push(i+1);
          acceptableTiles.push(i+1)
          continue;
      }
      //TODO: If there are multiple properties, need to check just for 'collides' in the future

      // if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
  }
  currentScene.finder.setAcceptableTiles(acceptableTiles);




}
