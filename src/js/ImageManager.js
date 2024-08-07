var ImageManager = {
	imageContainer: null,
	imageContainerPreload: null,
	imageContainerCum: null,
	finalImages: [],
	preloadedIndex: -1,
	preloadCallback: null,
	preloadAttemptsLeft: 5,
	curPictureIndex: -1,
	prevPictureIndex: -1,
	previousImages: [],
	
	initialize: function(callback)
	{
		debugConsole.log("初始化 ImageManager");

		ImageManager.imageContainer = document.getElementById("imageDisplayed");
		ImageManager.imageContainerPreload = document.getElementById("imageDisplayed2");
		ImageManager.imageContainerCum = document.getElementById("imgDisplayedCum");

		ImageManager.preloadCallback = callback;

		ImageManager.imageContainer.addEventListener("load", ImageManager.onImagePreload);
		ImageManager.imageContainer.addEventListener("error", ImageManager.onImagePreloadError);
		ImageManager.imageContainerPreload.addEventListener("load", ImageManager.onImagePreload);
		ImageManager.imageContainerPreload.addEventListener("error", ImageManager.onImagePreloadError);
		
		ImageManager.preloadedIndex = -1;
		ImageManager.prevPictureIndex = -1;
		ImageManager.curPictureIndex = -1;

		ImageManager.imageContainer.removeAttribute("src");
		ImageManager.imageContainerPreload.removeAttribute("src");
		ImageManager.imageContainerCum.removeAttribute("src");

		ImageManager.imageContainer.style.removeProperty("display");
		ImageManager.imageContainerPreload.style.setProperty("display", "none");
		ImageManager.imageContainerCum.style.setProperty("display", "none");
		
		// Check if there is a cum picture loaded, prepare display if so.
		if (document.getElementById("imgCumPic").getAttribute("loadSuccess"))
		{
			ImageManager.imageContainerCum.src = document.getElementById("imgCumPic").src;
		}
		
		ImageManager.preloadNextImage();
	},
	
	onImagePreload: function(event)
	{
		var evSrc = event.srcElement || event.target;
		
		debugConsole.log("图像已预载: " + evSrc.src);
		ImageManager.preloadAttemptsLeft = 5;
		
		if (ImageManager.preloadCallback)
		{
			var callback = ImageManager.preloadCallback;
			ImageManager.preloadCallback = null;
			callback();
		}
	},
	
	onImagePreloadError: function(event)
	{
		var evSrc = event.srcElement || event.target;
		
		debugConsole.log("加载时出错 : " + evSrc.src);
		
		
		if (StringIndexOf(evSrc.src, "sample") != -1)
		{
			// try the non-sample version.
			var images = ImageManager.finalImages;
			evSrc.src = images[ImageManager.preloadedIndex];
			debugConsole.log("未找到样本，正在尝试完整 URL: " + evSrc.src); 
		}
		else
		{
			debugConsole.log("未找到图像: " + evSrc.src + " ; 预载下一幅图像。");
			
			--ImageManager.preloadAttemptsLeft;
			
			if (ImageManager.preloadAttemptsLeft)
			{
				ImageManager.preloadNextImage();
			}
			else
			{
				// Give up on preloading a picture, next loaded picture will be broken.
				// Reset counter so next preload can try a few times again.
				ImageManager.preloadAttemptsLeft = 5;
				if (ImageManager.preloadCallback)
				{
					var callback = ImageManager.preloadCallback;
					ImageManager.preloadCallback = null;
					callback();
				}
			}
		}
	},
	
	preloadNextImage: function()
	{
		var images = ImageManager.finalImages;
		var numImages = images.length;
		var randImg = RNGList.getRand(images.length - 1);
		if (ImageManager.prevPictureIndex>=0) {
			ImageManager.previousImages.push(ImageManager.prevPictureIndex)
		}
		ImageManager.prevPictureIndex = ImageManager.curPictureIndex;
		ImageManager.curPictureIndex = ImageManager.preloadedIndex;
		ImageManager.preloadedIndex = randImg;
		
		if (numImages > randImg)
		{
			debugConsole.log("预载图片 " + randImg + ".");
			
			if (State.optionFastQuality && images[randImg].substr(0, E621_IMAGES_URL.length) == E621_IMAGES_URL)
			{
				var indexUrl = StringIndexOf(images[randImg], "data") + 5;
				ImageManager.imageContainerPreload.src = E621_IMAGES_URL + "data/sample/" + images[randImg].substr(indexUrl, 38) + ".jpg";
			}
			else
			{
				ImageManager.imageContainerPreload.src = images[randImg];
			}
			
			debugConsole.log("URL name: " + ImageManager.imageContainerPreload.src); 
		}
		else
		{
			// No picture to preload, run the callback right away.
			if (ImageManager.preloadCallback)
			{
				var callback = ImageManager.preloadCallback;
				ImageManager.preloadCallback = null;
				callback();
			}
		}
	},

	displayNextImage: function()
	{
		if ((blacklistedPictures[ImageManager.imageContainerPreload.src] && !document.getElementById("rbPicUseList").checked)
		|| ImageManager.preloadedIndex >= ImageManager.finalImages.length)
		{
			// The preloaded image is a picture we just blacklisted, skip and repreload.
			ImageManager.imageContainerPreload.removeAttribute("src");
			ImageManager.preloadNextImage();
		}
		
		// Switch containers.
		var prevImage = ImageManager.imageContainer;
		ImageManager.imageContainer = ImageManager.imageContainerPreload;
		ImageManager.imageContainerPreload = prevImage;
		debugConsole.log("显示图片 " + ImageManager.preloadedIndex + ".");
		debugConsole.log("URL name: " + ImageManager.imageContainer.src);

		ImageManager.imageContainerCum.style.setProperty("display", "none");
		ImageManager.imageContainerPreload.style.setProperty("display", "none");
		ImageManager.imageContainer.style.removeProperty("display");
		
		// Preload next.
		ImageManager.imageContainerPreload.removeAttribute("src");
		ImageManager.preloadNextImage();
		
		if (typeof ListManager.bookmarkedImages[ImageManager.finalImages[ImageManager.curPictureIndex]] == "object") {
			document.getElementById("buttonImageAddToListGameText").style.backgroundImage = "linear-gradient(rgb(4, 2, 4) 0px, rgb(61, 21, 100) 100%)";
		}else {
			document.getElementById("buttonImageAddToListGameText").style.backgroundImage = ""
		}
		
		if (ImageManager.prevPictureIndex !== -1)
		{
			document.getElementById("buttonSlideshowPrev").classList.remove("disabled");
			document.getElementById("buttonSlideshowPrev").removeAttribute("disabled");
		}
		
		if (ImageManager.imageContainer.src.substr(0, E621_IMAGES_URL.length) == E621_IMAGES_URL)
		{
			document.getElementById("buttonSlideshowView").style.removeProperty("display");
		}
		else
		{
			document.getElementById("buttonSlideshowView").style.setProperty("display", "none");
		}
	},
	
	displayPrevImage: function()
	{
		if (this.previousImages.length < 1 && ImageManager.prevPictureIndex === -1) {
			return;
		}
		
		State.viewingPrevImage = true;

		var images = ImageManager.finalImages;
		var numImages = images.length;		
		var randImg = ImageManager.prevPictureIndex;
		if (ImageManager.prevPictureIndex < 0){
			randImg = ImageManager.previousImages.pop()
		}
		
		if (numImages <= randImg)
		{
			return;
		}
		
		RNGList.insert(ImageManager.preloadedIndex);
		RNGList.insert(ImageManager.curPictureIndex);
		
		ImageManager.preloadedIndex = randImg;
		
		ImageManager.prevPictureIndex = -1;
		ImageManager.curPictureIndex = -1;
		
		debugConsole.log("预载图片 " + randImg + ".");
		
		if (State.optionFastQuality && images[randImg].substr(0, E621_IMAGES_URL.length) == E621_IMAGES_URL)
		{
			var indexUrl = StringIndexOf(images[randImg], "data") + 5;
			ImageManager.imageContainerPreload.src = E621_IMAGES_URL + "data/sample/" + images[randImg].substr(indexUrl, 38) + ".jpg";
		}
		else
		{
			ImageManager.imageContainerPreload.src = images[randImg];
		}
		
		debugConsole.log("URL name: " + ImageManager.imageContainerPreload.src);
		
		ImageManager.displayNextImage();
		
		if (this.previousImages.length < 1)
		{
			document.getElementById("buttonSlideshowPrev").classList.add("disabled");
			document.getElementById("buttonSlideshowPrev").setAttribute("disabled", "disabled");
		}
	},
	
	displayCumImage: function()
	{
		if (!ImageManager.imageContainerCum.src)
		{
			ImageManager.displayNextImage();
			return;
		}
		
		ImageManager.imageContainer.style.setProperty("display", "none");
		ImageManager.imageContainerCum.style.removeProperty("display");
		
		debugConsole.log("显示精液图片: " + ImageManager.imageContainerCum.src);
	},

	displayNoImage: function()
	{
		ImageManager.imageContainerCum.style.setProperty("display", "none");
		ImageManager.imageContainer.removeAttribute("src");
		ImageManager.imageContainer.style.setProperty("display", "none");
	},
	
	openCurPicturePage: function()
	{
		if (ImageManager.curPictureIndex === -1)
		{
			return;
		}

		// Find which container is currently displayed.
		let imageContainer = ImageManager.imageContainer;

		if (imageContainer.style.getPropertyValue("display") === "none")
		{
			imageContainer = ImageManager.imageContainerPreload;
		}

		// Open e6 page of currently displayed picture.
		var imgUrl = imageContainer.src;
		
		if (imgUrl.substr(0, E621_IMAGES_URL.length) !== E621_IMAGES_URL)
		{
			// This is not an e6 picture, don't do anything.
			return;
		}
		
		if (!arrImgIdByUrl[imgUrl])
		{
			NotifMessage.displayError(`错误： 未找到图像 ID: ${imgUrl}`);
			return;
		}

		var imgPageUrl = E621_URL + "posts/" + arrImgIdByUrl[imgUrl];
		
		window.open(imgPageUrl, '_blank');
	},
};
