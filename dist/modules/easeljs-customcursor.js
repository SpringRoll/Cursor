/*! CustomCursor 0.1.0 */
/**
 * @namespace springroll
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var ListTask = include('springroll.ListTask');
	var Container = include('createjs.Container');
	var TextureAtlas = include('springroll.easeljs.TextureAtlas');
	var BitmapUtils = include('springroll.easeljs.BitmapUtils');
	var Bitmap = include('createjs.Bitmap');

	/**
	 * Create an app plugin for EaselJSCursorPlugin, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class EaselJSCursorPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Init the Keyboard
	plugin.setup = function()
	{
		/**
		 *	The cursor settings to use for a custom cursor.
		 *	@property {Object} options.cursorSettings
		 */
		this.options.add("cursorSettings", null, true);
		
		//ensure that keepMouseover is true, so that the cursor can continue to move during
		//state transitions
		if(this.options._options.displayOptions)
			this.options._options.displayOptions.keepMouseover = true;
		
		/**
		 *	The url to a JSON file describing the atlas that cursor images can be found in.
		 *	@property {String} [options.cursorSettings.atlasData]
		 */
		/**
		 *	The url to a image file that cursor images can be found in.
		 *	@property {String} [options.cursorSettings.atlasImage]
		 */
		/**
		 *	The url to a image file that is the normal cursor. If atlasData and atlasImage are
		 *	being used, this is the frame/sprite name instead.
		 *	@property {String} [options.cursorSettings.normal]
		 */
		/**
		 *	The url to a image file that is the pointer cursor. If atlasData and atlasImage are
		 *	being used, this is the frame/sprite name instead.
		 *	@property {String} [options.cursorSettings.pointer]
		 */
		/**
		 *	The origin for the normal cursor state. The default is the center of the art.
		 *	@property {Object} [options.cursorSettings.normalOrigin]
		 */
		/**
		 *	The origin for the pointer cursor state. The default is the center of the art.
		 *	@property {Object} [options.cursorSettings.pointerOrigin]
		 */
		
		//don't do anything on mobile
		if(this.hasTouch) return;
		
		//load assets during the standard loading phase from ConfigPlugin
		this.once("loading", loadAssets.bind(this));
	};
	
	function loadAssets(taskArray)
	{
		//don't do anything on mobile
		if(this.hasTouch) return;
		
		var options = this.options.cursorSettings;
		if(!options) return;
		
		var manifest;
		if(options.atlasData && options.atlasImage)
		{
			manifest =
			[
				{
					"id":"atlasData",
					"src":options.atlasData
				},
				{
					"id":"atlasImage",
					"src":options.atlasImage
				}
			];
		}
		else
		{
			manifest =
			[
				{
					"id":"cursorNormal",
					"src":options.normal
				},
				{
					"id":"cursorPointer",
					"src":options.pointer
				}
			];
		}
		taskArray.push(new ListTask("", manifest, onAssetsLoaded.bind(this)));
	}
	
	function onAssetsLoaded(results)
	{
		//don't do anything on mobile
		if(this.hasTouch) return;
		
		this.stageOut = stageOut.bind(this);
		this.stageIn = stageIn.bind(this);
		this.onMouseMove = onMouseMove.bind(this);
		this.onCursorChange = onCursorChange.bind(this);
		
		var stage = this.display.stage;
		stage.addEventListener("mouseleave", this.stageOut);
		stage.addEventListener("mouseenter", this.stageIn);
		stage.addEventListener("stagemousemove", this.onMouseMove);
		stage.addEventListener("changecursor", this.onCursorChange);
		//hide the OS cursor
		this.display.canvas.style.cursor = "none";
		//Create the cursor
		var options = this.options.cursorSettings;
		this.cursor = new Container();
		if(results.atlasData)
		{
			var atlas = new TextureAtlas(results.atlasImage.content, results.atlasData.content);
			this.cursorDefault = BitmapUtils.bitmapFromTexture(atlas.getFrame(options.normal));
			this.cursorPointer = BitmapUtils.bitmapFromTexture(atlas.getFrame(options.pointer));
			
			this.cursorAtlas = atlas;
		}
		else
		{
			this.cursorDefault = new Bitmap(results.cursorNormal.content);
			this.cursorPointer = new Bitmap(results.cursorPointer.content);
		}
		//set up origin of art
		if(options.normalOrigin)
		{
			//specified setting
			this.cursorDefault.regX = options.normalOrigin.x;
			this.cursorDefault.regY = options.normalOrigin.y;
		}
		else if(this.cursorAtlas)
		{
			//boundaries defined by frame
			this.cursorDefault.regX = this.cursorDefault.nominalBounds.width * 0.5;
			this.cursorDefault.regY = this.cursorDefault.nominalBounds.height * 0.5;
		}
		else
		{
			//boundaries defined by image size
			this.cursorDefault.regX = this.cursorDefault.image.width * 0.5;
			this.cursorDefault.regY = this.cursorDefault.image.height * 0.5;
		}
		if(options.pointerOrigin)
		{
			//specified setting
			this.cursorPointer.regX = options.pointerOrigin.x;
			this.cursorPointer.regY = options.pointerOrigin.y;
		}
		else if(this.cursorAtlas)
		{
			//boundaries defined by frame
			this.cursorPointer.regX = this.cursorPointer.nominalBounds.width * 0.5;
			this.cursorPointer.regY = this.cursorPointer.nominalBounds.height * 0.5;
		}
		else
		{
			//boundaries defined by image size
			this.cursorPointer.regX = this.cursorPointer.image.width * 0.5;
			this.cursorPointer.regY = this.cursorPointer.image.height * 0.5;
		}
		
		this.cursor.addChild(this.cursorDefault);
		this.cursor.addChild(this.cursorPointer);
		this.cursorPointer.visible = false;
		
		stage.addChild(this.cursor);
		//ensure the cursor is still on top later on, when any states/panels have been added
		this.once("init", reAddCursor.bind(this), -20);
	}
	
	function reAddCursor()
	{
		this.display.stage.addChild(this.cursor);
	}
	
	function stageOut(ev)
	{
		if(this.cursor)
			this.cursor.visible = false;
	}
	
	function stageIn(ev)
	{
		if(this.cursor)
			this.cursor.visible = true;
	}
	
	function onMouseMove(ev)
	{
		this.cursor.x = ev.stageX;
		this.cursor.y = ev.stageY;
	}
	
	function onCursorChange(ev)
	{
		this.cursorPointer.visible = ev.cursor == "pointer";
		this.cursorDefault.visible = ev.cursor != "pointer";
	}

	// Destroy the animator
	plugin.teardown = function()
	{
		if(this.cursorAtlas)
		{
			this.cursorAtlas.destroy();
			this.cursorAtlas = null;
		}
		if(this.cursor)
		{
			if(this.cursor.parent)
				this.cursor.parent.removeChild(this.cursor);
			this.cursor.removeAllChildren();
			this.cursor = this.cursorPointer = this.cursorNormal = null;
		}
		
		var stage = this.display.stage;
		stage.removeEventListener("mouseleave", this.stageOut);
		stage.removeEventListener("mouseenter", this.stageIn);
		stage.removeEventListener("stagemousemove", this.onMouseMove);
		stage.removeEventListener("changecursor", this.onCursorChange);
		
		this.stageOut = this.stageIn = this.onMouseMove = this.onCursorChange = null;
	};

}());