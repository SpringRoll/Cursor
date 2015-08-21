/**
 * @namespace springroll
 */
(function ()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var ListTask = include('springroll.ListTask');
	var Container = include('createjs.Container');
	var TextureAtlas = include('springroll.easeljs.TextureAtlas');
	var BitmapUtils = include('springroll.easeljs.BitmapUtils');
	var Bitmap = include('createjs.Bitmap');

	/**
	 * Plugin for EaselJS Cursor to the SpringRoll Application. All these
	 * properties and methods are automatically added to new Applications
	 * when this dependency is included in a project.
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Init the Keyboard
	plugin.setup = function ()
	{
		/**
		 *	The cursor settings to use for a custom cursor.
		 *	@property {Object} options.cursorSettings
		 */
		this.options.add("cursorSettings", null, true);

		// ensure that keepMouseover is true, so that the cursor can continue to move during
		// state transitions
		if (this.options._options.displayOptions)
			this.options._options.displayOptions.keepMouseover = true;

		/**
		 * The url to a JSON file describing the atlas that cursor images can be found in.
		 * @property {String} options.cursorSettings.atlasData
		 * @default  null
		 */

		/**
		 * The url to a image file that cursor images can be found in.
		 * @property {String} options.cursorSettings.atlasImage
		 * @default  null
		 */

		/**
		 * The url to a image file that is the normal cursor. If atlasData and atlasImage are
		 * being used, this is the frame/sprite name instead.
		 * @property {String} options.cursorSettings.normal
		 * @default  null
		 */

		/**
		 * The url to a image file that is the pointer cursor. If atlasData and atlasImage are
		 * being used, this is the frame/sprite name instead.
		 * @property {String} options.cursorSettings.pointer
		 * @default  null
		 */

		/**
		 * The origin for the normal cursor state. The default is the center of the art.
		 * @property {Object} options.cursorSettings.normalOrigin
		 * @default  null
		 */

		/**
		 * The origin for the pointer cursor state. The default is the center of the art.
		 * @property {Object} options.cursorSettings.pointerOrigin
		 * @default  null
		 */

		/**
		 * The container for the cursor object
		 * @property {createjs.Container} cursor
		 * @default  null
		 */
		this.cursor = null;

		/**
		 * The image for the default cursor display
		 * @property {createjs.Bitmap} cursorNormal
		 * @private
		 * @default  null
		 */
		this._cursorNormal = null;

		/**
		 * The image for the cursor pointer display
		 * @property {createjs.Bitmap} cursorPointer
		 * @private
		 * @default  null
		 */
		this._cursorPointer = null;

		/**
		 * Handler when the mouse leaves the stage
		 * @method _stageOut
		 * @private
		 * @default  null
		 */
		this._stageOut = null;

		/**
		 * Handler when the mouse enters the stage
		 * @method _stageIn
		 * @private
		 * @default  null
		 */
		this._stageIn = null;

		/**
		 * Handler when the mouse moves over the stage
		 * @method _onMouseMove
		 * @private
		 * @default  null
		 */
		this._onMouseMove = null;

		/**
		 * Handler when the cursor changes
		 * @method _stageOut
		 * @private
		 * @default  null
		 */
		this._onCursorChange = null;

		// don't do anything on mobile
		if (this.hasTouch) return;

		// load assets during the standard loading phase from ConfigPlugin
		this.once("loading", loadAssets.bind(this));
	};

	function loadAssets(assets)
	{
		// don't do anything on mobile
		if (this.hasTouch) return;

		var options = this.options.cursorSettings;

		if (!options) return;

		var cursorAssets;
		if (options.atlasData && options.atlasImage)
		{
			cursorAssets = {
				id: 'cursorAtlas',
				atlas: options.atlasData,
				image: options.atlasImage
			};
		}
		else
		{
			cursorAssets = {
				cursorNormal: options.normal,
				cursorPointer: options.pointer
			};
		}
		assets.push(
		{
			id: 'CursorAssets',
			assets: [cursorAssets],
			complete: onAssetsLoaded.bind(this)
		});
	}

	function onAssetsLoaded(results)
	{
		// don't do anything on mobile
		if (this.hasTouch) return;

		// Setup binds
		this._stageOut = stageOut.bind(this);
		this._stageIn = stageIn.bind(this);
		this._onMouseMove = onMouseMove.bind(this);
		this._onCursorChange = onCursorChange.bind(this);

		// Add the stage listeners
		var stage = this.display.stage;
		stage.addEventListener("mouseleave", this._stageOut);
		stage.addEventListener("mouseenter", this._stageIn);
		stage.addEventListener("stagemousemove", this._onMouseMove);
		stage.addEventListener("changecursor", this._onCursorChange);

		// hide the OS cursor
		this.display.canvas.style.cursor = "none";

		//Create the cursor
		var options = this.options.cursorSettings;

		// Create local vars
		var cursor = new Container();
		var cursorAtlas = results.cursorAtlas || null;
		var cursorNormal;
		var cursorPointer;

		if (cursorAtlas)
		{
			cursorNormal = BitmapUtils.bitmapFromTexture(
				cursorAtlas.getFrame(options.normal)
			);
			cursorPointer = BitmapUtils.bitmapFromTexture(
				cursorAtlas.getFrame(options.pointer)
			);
		}
		else
		{
			cursorNormal = new Bitmap(results.cursorNormal);
			cursorPointer = new Bitmap(results.cursorPointer);
		}

		// set up origin of art
		if (options.normalOrigin)
		{
			// specified setting
			cursorNormal.regX = options.normalOrigin.x;
			cursorNormal.regY = options.normalOrigin.y;
		}
		else if (cursorAtlas)
		{
			// boundaries defined by frame
			cursorNormal.regX = cursorNormal.nominalBounds.width * 0.5;
			cursorNormal.regY = cursorNormal.nominalBounds.height * 0.5;
		}
		else
		{
			// boundaries defined by image size
			cursorNormal.regX = cursorNormal.image.width * 0.5;
			cursorNormal.regY = cursorNormal.image.height * 0.5;
		}
		if (options.pointerOrigin)
		{
			// specified setting
			cursorPointer.regX = options.pointerOrigin.x;
			cursorPointer.regY = options.pointerOrigin.y;
		}
		else if (cursorAtlas)
		{
			// boundaries defined by frame
			cursorPointer.regX = cursorPointer.nominalBounds.width * 0.5;
			cursorPointer.regY = cursorPointer.nominalBounds.height * 0.5;
		}
		else
		{
			// boundaries defined by image size
			cursorPointer.regX = cursorPointer.image.width * 0.5;
			cursorPointer.regY = cursorPointer.image.height * 0.5;
		}

		cursor.addChild(cursorNormal, cursorPointer);
		cursorPointer.visible = false;

		// Save as application properties
		this.cursor = cursor;
		this._cursorNormal = cursorNormal;
		this._cursorPointer = cursorPointer;

		stage.addChild(cursor);

		// ensure the cursor is still on top later on,
		// when any states/panels have been added
		this.once("afterInit", function ()
		{
			this.display.stage.addChild(this.cursor);
		}, -1);
	}

	function stageOut(ev)
	{
		if (this.cursor)
			this.cursor.visible = false;
	}

	function stageIn(ev)
	{
		if (this.cursor)
			this.cursor.visible = true;
	}

	function onMouseMove(ev)
	{
		this.cursor.x = ev.stageX;
		this.cursor.y = ev.stageY;
	}

	function onCursorChange(ev)
	{
		this._cursorPointer.visible = ev.cursor == "pointer";
		this._cursorNormal.visible = ev.cursor != "pointer";
	}

	// Destroy the animator
	plugin.teardown = function ()
	{
		var cursor = this.cursor;

		if (cursor)
		{
			if (cursor.parent)
			{
				cursor.parent.removeChild(this.cursor);
			}
			cursor.removeAllChildren();
		}

		this.cursor =
			this._cursorPointer =
			this._cursorDefault = null;

		// Unlaod the assets
		this.unload('CursorAssets');

		if (this.display)
		{
			var stage = this.display.stage;
			stage.removeEventListener("mouseleave", this._stageOut);
			stage.removeEventListener("mouseenter", this._stageIn);
			stage.removeEventListener("stagemousemove", this._onMouseMove);
			stage.removeEventListener("changecursor", this._onCursorChange);
		}

		this._stageOut =
			this._stageIn =
			this._onMouseMove =
			this._onCursorChange = null;
	};

}());