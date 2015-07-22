Cursor is a plugin for [SpringRoll](http://github.com/SpringRoll/SpringRoll). It is designed to be a self contained way to have an on-canvas cursor with normal and pointer states, when using the SpringRoll forks of EaselJS and PIXI.js.

_**Note:** due to currently ongoing changes to our PIXI support and loading process, the PIXI.js side of this has not been implemented within this library yet._

## Installation

SpringRoll Cursor can be installed using Bower.

```bash
bower install springroll-cursor
```

## Usage

Include **easeljs-cursor.min.js** in your libraries js or html, after your other libraries. Create a `cursorSetting` option when creating your SpringRoll Application. This is required to have `normal` and `pointer` properties which are image source for either cursor.

```js
var app = new Application({
  cursorSettings: {
		normal: "assets/images/Cursor-normal.png",
		pointer: "assets/images/Cursor-pointer.png"
	}
});
```

Or use a `springroll.easeljs.TextureAtlas` to combine the cursors into a single spritesheet. Where `cursorSettings.normal` and `cursorSettings.pointer` are the names of the frames in the `TextureAtlas`.

```js
var app = new Application({
  cursorSettings: {
		atlasData: "assets/images/Cursor.json",
		atlasImage: "assets/images/Cursor.png",
		normal: "NormalCursor",
		pointer: "PointerCursor"
	}
});
```

## License

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
