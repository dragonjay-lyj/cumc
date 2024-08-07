var debugConsole = {
	enabled: true,
	quickTestMode: true,

	log: function(text)
	{
		if (debugConsole.enabled)
			console.log(text);
	},

	warn: function(text)
	{
		if (debugConsole.enabled)
			console.warn(text);
	},

	error: function(text)
	{
		console.error(text);
	},
};

debugConsole.enabled = false;
debugConsole.quickTestMode = false;

var VERSION = "1.4.6";
var USER_AGENT = `Heat Control/${VERSION} (by howling-strawberries on e621)`;
var E621_URL = "https://e621.net/";
var E621_IMAGES_URL = "https://static1.e621.net/";

const EVENT_MOUSEDOWN = "ontouchstart" in window ? "touchstart" : "mousedown";
const EVENT_MOUSEUP = "ontouchstart" in window ? "touchend" : "mouseup";

var strCharName = "Lucia";

var isPageLoaded = false;
var bIsFirstLocalClick = true;
var bIncludeSubfolders = false;
var pass = 0;
var baseMultiplier = 1.0;
var pauseMultiplier = 1.0;
var cumFactor = 0;
var targetDuration = 0;
var startTime;

var buttplugConnection = null;

// Fast swipe easter egg
var flagFastSwipeTriggered = false;
var countFastSwipes = 0;
var timeoutResetConsecutiveFastSwipes = null;
var lucarioEasterEggQueries = {
	Lucas: `${E621_URL}posts.json?_client=${USER_AGENT}&tags=-webm+-swf+-rating:s+score:>500+order:random+limit:1+lucario+solo+male&callback=?`,
	Lucia: `${E621_URL}posts.json?_client=${USER_AGENT}&tags=-webm+-swf+-rating:s+score:>500+order:random+limit:1+lucario+solo+female&callback=?`
};

// This is retrieved with a query to e621 when needed.
var lucarioEasterEggPic = {
	Lucas: "",
	Lucia: ""
}


var favImages = [];
var arrLocalPictures = [];
arrLocalPictures.nTotalPics = 0;
var mapLocalFoldersLoaded = {};
var gameListPictures = { lists: {} };
var arrImgIdByUrl = {};
var blacklistedPictures = {};



// Get a random decimal number between an interval, max not included.
function getRandInInterval(min, max)
{
	return Math.random() * (max - min) + min;
}

// Get a random integer number between an interval, max included.
function getRandInteger(min, max)
{
	return Math.floor(getRandInInterval(min, max + 1));
}

function setCharHead(headExpression)
{
	document.getElementById("imageHead").src = `https://cdn.jsdelivr.net/gh/dragonjay-lyj/cumc@master/src/assets/head_${headExpression}_${strCharName}.avif`;
	document.getElementById("imageHead").style.removeProperty("display");
}

function StringIndexOf(str, query)
{
  for(var i = 0; i < str.length; i++)
  {
    for(var q = 0; q < query.length; q++)
	{
      if (str[i+q] !== query[q])
	  {
        break;
      }
	  
      if (q === query.length - 1)
	  {
        return i;
      } 
    }
  }
   return -1;
};

function getMessageCopy(msg)
{
	var msgCopy = {};
	msgCopy.msg = msg.msg;
	msgCopy.minTime = msg.minTime;
	msgCopy.maxTime = msg.maxTime;
	
	if (msg.beatRate)
	{
		msgCopy.beatRate = msg.beatRate;
	}
	
	return msgCopy;
};

function onGameModeRadioClick(event)
{
	let radioNormal = document.getElementById("rbGameModeNormal");
	let radioEndurance = document.getElementById("rbGameModeEndurance");
	let radioSlideshow = document.getElementById("rbGameModeSlideshow");
	
	let nodeListGameModeNormal = document.querySelectorAll(".gameModeNormal");
	let nodeListGameModeEndurance = document.querySelectorAll(".gameModeEndurance");
	let nodeListGameModeSlideshow = document.querySelectorAll(".gameModeSlideshow");

	// First hide everything so we only display relevant items next.
	for (let i = 0; i < nodeListGameModeNormal.length; ++i)
	{
		nodeListGameModeNormal[i].style.setProperty("display", "none");
	}

	for (let i = 0; i < nodeListGameModeEndurance.length; ++i)
	{
		nodeListGameModeEndurance[i].style.setProperty("display", "none");
	}

	for (let i = 0; i < nodeListGameModeSlideshow.length; ++i)
	{
		nodeListGameModeSlideshow[i].style.setProperty("display", "none");
	}
	
	if (radioNormal.checked)
	{
		// Display normal gamemode options.
		for (let i = 0; i < nodeListGameModeNormal.length; ++i)
		{
			nodeListGameModeNormal[i].style.removeProperty("display");
		}
	}
	else if (radioEndurance.checked)
	{
		// Display endurance gamemode options.
		for (let i = 0; i < nodeListGameModeEndurance.length; ++i)
		{
			nodeListGameModeEndurance[i].style.removeProperty("display");
		}
	}
	else if (radioSlideshow.checked)
	{
		// Display slideshow gamemode options.
		for (let i = 0; i < nodeListGameModeSlideshow.length; ++i)
		{
			nodeListGameModeSlideshow[i].style.removeProperty("display");
		}
	}
};

function onUsePicturesRadioClick(event)
{
	let radioLocal = document.getElementById("rbPicUseLocal");
	let radioFavorites = document.getElementById("rbPicUseFavorites");
	let radioSearch = document.getElementById("rbPicUseSearch");
	let radioList = document.getElementById("rbPicUseList");

	let nodeListPicUseLocal = document.querySelectorAll(".picUseLocal");
	let nodeListPicUseFavorites = document.querySelectorAll(".picUseFavorites");
	let nodeListPicUseSearch = document.querySelectorAll(".picUseSearch");
	let nodeListPicUseList = document.querySelectorAll(".picUseList");

	// First hide everything so we only display relevant items next.
	for (let i = 0; i < nodeListPicUseLocal.length; ++i)
	{
		nodeListPicUseLocal[i].style.setProperty("display", "none");
	}

	for (let i = 0; i < nodeListPicUseFavorites.length; ++i)
	{
		nodeListPicUseFavorites[i].style.setProperty("display", "none");
	}

	for (let i = 0; i < nodeListPicUseSearch.length; ++i)
	{
		nodeListPicUseSearch[i].style.setProperty("display", "none");
	}

	for (let i = 0; i < nodeListPicUseList.length; ++i)
	{
		nodeListPicUseList[i].style.setProperty("display", "none");
	}
	
	if (radioLocal.checked)
	{
		// Display the help popup the first time a user selects the local pictures option.
		if (localStorage.getItem("bFirstClickRadioLocal") !== "false")
		{
			document.getElementById("buttonOwnPicHelp").click();
			localStorage.setItem("bFirstClickRadioLocal", "false");
		}
		
		// Display local files options.
		for (let i = 0; i < nodeListPicUseLocal.length; ++i)
		{
			nodeListPicUseLocal[i].style.removeProperty("display");
		}

		// On first click, autoload folders used in last session.
		if (bIsFirstLocalClick)
		{
			bIsFirstLocalClick = false;

			// Only possible on Electron.
			if (typeof electronApi !== "undefined" && localStorage.getItem("mapLastUsedLocalPaths") !== null)
			{
				let mapLastUsedLocalPaths = JSON.parse(localStorage.getItem("mapLastUsedLocalPaths"));

				Object.keys(mapLastUsedLocalPaths).forEach(function(key)
				{
					// Load each folder.
					let tFolderData = mapLastUsedLocalPaths[key];
					electronApi.loadFolderContent(tFolderData).then(onElectronFolderSelected);
				});
			}
		}
	}
	else if (radioFavorites.checked)
	{
		// Display favorites selection options.
		for (let i = 0; i < nodeListPicUseFavorites.length; ++i)
		{
			nodeListPicUseFavorites[i].style.removeProperty("display");
		}

		document.getElementById("spanImageCount").textContent = `找到图片: ${favImages.length}`;
	}
	else if (radioSearch.checked)
	{
		// Display search selection options.
		for (let i = 0; i < nodeListPicUseSearch.length; ++i)
		{
			nodeListPicUseSearch[i].style.removeProperty("display");
		}
		
		document.getElementById("spanImageCount").textContent = `找到图片: ${favImages.length}`;
	}
	else if (radioList.checked)
	{
		// Display list selection options.
		for (let i = 0; i < nodeListPicUseList.length; ++i)
		{
			nodeListPicUseList[i].style.removeProperty("display");
		}
	}
};

function onLoadFavoritesClick()
{
	var maxImageNumber = 6400;
	var maxPerRequest = 320;
	var page = 1;
	
	var userName = document.getElementById("textfieldUsername").value;
	var numPics = parseInt(document.getElementById("nbMaxPicNum").value);
	
	if (isNaN(numPics) || numPics <= 0)
	{
		NotifMessage.displayError("请输入有效的图片数量。");
		return;
	}

	if (userName === "")
	{
		NotifMessage.displayError("请输入用户名。");
		return;
	}

	let buttonLoadFavorites = document.getElementById("buttonLoadFavorites");

	buttonLoadFavorites.setAttribute("disabled", "disabled");
	buttonLoadFavorites.value = "Loading...";
	buttonLoadFavorites.classList.add("disabled");

	favImages = [];
	document.getElementById("spanImageCount").textContent = `找到图片: ${favImages.length}`;

	// Disable "Display images" button after emptying the image array.
	let buttonDisplayImages = document.getElementById("buttonDisplayImages");
	buttonDisplayImages.setAttribute("disabled", "disabled");
	buttonDisplayImages.classList.add("disabled");

	if (numPics > maxImageNumber)
	{
		numPics = maxImageNumber;
	}
	
	if (numPics < maxPerRequest / 2)
	{
		maxPerRequest = numPics * 2;
	}
	
	function displayError()
	{
		NotifMessage.displayError("网络错误，请检查网络连接。");

		// Reenable button.
		buttonLoadFavorites.removeAttribute("disabled");
		buttonLoadFavorites.value = "加载收藏夹";
		buttonLoadFavorites.classList.remove("disabled");
	}
	
	function sendRequest()
	{
		fetch(
			`${E621_URL}posts.json?_client=${USER_AGENT}&limit=${maxPerRequest}&page=${page}&tags=-webm+-swf+-rating:s+favoritedby:${userName}&callback=?`
		).then(getPicsFromRequest, displayError);
	};
	
	async function getPicsFromRequest(response)
	{
		// Handle error responses.
		if (response.status < 200 || response.status > 299)
		{
			if (response.status === 403)
			{
				NotifMessage.displayError("该用户的收藏夹为私人收藏，无法加载。");
			}
			else
			{
				NotifMessage.displayError("向 e621 发送请求时出错，网站可能已关闭，请稍后再试。");
			}

			// Reenable button.
			buttonLoadFavorites.removeAttribute("disabled");
			buttonLoadFavorites.value = "加载收藏夹";
			buttonLoadFavorites.classList.remove("disabled");

			return;
		}

		
		let responseJson = await response.json();
		let posts = responseJson.posts;

		// Check for no results.
		if (page == 1 && !posts.length)
		{
			NotifMessage.displayWarning("该用户没有任何收藏夹。");
			
			// All done, reenable buttons.
			buttonLoadFavorites.removeAttribute("disabled");
			buttonLoadFavorites.value = "加载收藏夹";
			buttonLoadFavorites.classList.remove("disabled");

			return;
		}
		
		for (var indexPic = 0; indexPic < posts.length; ++indexPic)
		{
			// Skip if file isn't an image.
			if (posts[indexPic].file.ext !== "png"
				&& posts[indexPic].file.ext !== "jpg"
				&& posts[indexPic].file.ext !== "gif")
			{
				continue;
			}
			
			var strPictureUrl = posts[indexPic].file.url;
			if (strPictureUrl === null)
			{
				// Fallback for globally blacklisted pictures.
				var strMd5 = posts[indexPic].file.md5;
				
				strPictureUrl = E621_IMAGES_URL + "data/";
				strPictureUrl += strMd5.substr(0,2) + "/";
				strPictureUrl += strMd5.substr(2,2) + "/";
				strPictureUrl += strMd5 + "." + posts[indexPic].file.ext;
			}
			
			--numPics;
			favImages.push(strPictureUrl);
			arrImgIdByUrl[strPictureUrl] = posts[indexPic].id;
			
			
			if (numPics <= 0)
			{
				break;
			}
		}
		
		debugConsole.log(`inserted ${favImages.length} pictures in favImages.`);
		document.getElementById("spanImageCount").textContent = `找到图片: ${favImages.length}`;

		++page;
		
		// Check if enough pics collected, or no more available.
		if (posts.length == 0 || numPics <= 0 || page > 750)
		{
			// All done, reenable buttons.
			buttonLoadFavorites.removeAttribute("disabled");
			buttonLoadFavorites.value = "加载收藏夹";
			buttonLoadFavorites.classList.remove("disabled");

			if (favImages.length)
			{
				// Enable the "Display images" button if there are images to display.
				buttonDisplayImages.removeAttribute("disabled");
				buttonDisplayImages.classList.remove("disabled");
			}
			
			return;
		}
		
		// Still some pics left to get, recurse.
		
		// Wait for 1 second before sending next request, to respect the server.
		setTimeout(sendRequest, 1000);
	}
	
	sendRequest();
};

function onLoadSearchClick()
{
	var maxImageNumber = 6400;
	var maxPerRequest = 320;
	var page = 1;
	var mapPictures = {};
	
	// In random mode, we are likely to get pictures we've already added as we go from page to page.
	// This flag is used to prevent pictures from being added more than once.
	var bUseMapDupCheck = false;

	var strSearchQuery = document.getElementById("textfieldSearchQuery").value;
	var strTagsBlacklist = document.getElementById("textfieldTagsBlacklist").value;
	var strAdditionalQueryTags = "";
	var numPics = parseInt(document.getElementById("nbMaxPicNum").value);
	var scoreThreshold = parseInt(document.getElementById("nbSearchScore").value);

	if (isNaN(numPics) || numPics <= 0)
	{
		NotifMessage.displayError("请输入有效的图片数量。");
		return;
	}
	
	// Cap the number of pictures to get.
	if (numPics > maxImageNumber)
	{
		numPics = maxImageNumber;
	}

	// Ease the server request when the user doesn't want many.
	if (numPics < maxPerRequest / 2)
	{
		maxPerRequest = numPics * 2;
	}
	
	favImages = [];
	document.getElementById("spanImageCount").textContent = `找到图片: ${favImages.length}`;

	// Disable "Display images" button after emptying the image array.
	let buttonDisplayImages = document.getElementById("buttonDisplayImages");
	buttonDisplayImages.setAttribute("disabled", "disabled");
	buttonDisplayImages.classList.add("disabled");
	
	// First check for obvious invalid characters
	if (strSearchQuery.includes("&") || strSearchQuery.includes("="))
	{
		NotifMessage.displayError("搜索查询包含无效字符。请尝试其他搜索。");
		return;
	}
	
	if (strTagsBlacklist.includes("&") || strTagsBlacklist.includes("="))
	{
		NotifMessage.displayError("标签黑名单包含无效字符。请尝试其他搜索。");
		return;
	}
	
	// Tags are separated by spaces, but in the URL, spaces are turned into +.
	strSearchQuery = strSearchQuery.trim().replace(/\s+/g, " ");
	strSearchQuery = strSearchQuery.replace(/\s/g, "+");
	
	// Do the same to blacklisted tags, and also append "-".
	strTagsBlacklist = strTagsBlacklist.trim().replace(/\s+/g, " ");
	if (strTagsBlacklist !== "")
	{
		strTagsBlacklist = "+-" + strTagsBlacklist.replace(/\s/g, "+-");
	}
	
	// Create the additional tags from other fields.
	if (document.getElementById("rbSearchOrderRandom").checked)
	{
		strAdditionalQueryTags += "+order:random";
		bUseMapDupCheck = true;
	}
	else if (document.getElementById("rbSearchOrderPopular").checked)
	{
		strAdditionalQueryTags += "+order:score";
	}

	// The recent order is the default order, we can just add nothing to the query.
	
	// Filter by score.
	if (!isNaN(scoreThreshold))
	{
		strAdditionalQueryTags += `+score:>=${scoreThreshold}`;
	}

	let buttonLoadSearch = document.getElementById("buttonLoadSearch");
	
	buttonLoadSearch.setAttribute("disabled", "disabled");
	buttonLoadSearch.value = "Loading...";
	buttonLoadSearch.classList.add("disabled");

	// Possible dialog if search query includes Lucario.
	if (strSearchQuery.toLowerCase().includes("lucario"))
	{
		// Lucario isn't a removed tag.
		if (!strSearchQuery.toLowerCase().includes("-lucario"))
		{
			// 25% chance of getting the message upon doing a search including Lucario.
			if (Math.random() <= 0.25)
			{
				NotifMessage.displayCharText("卢卡里奥斯很不错，不是吗？");
			}
		}
	}
	
	function displayError()
	{
		NotifMessage.displayError("网络错误，请检查网络连接。");
		
		// Reenable button.
		buttonLoadSearch.removeAttribute("disabled");
		buttonLoadSearch.value = "Load search";
		buttonLoadSearch.classList.remove("disabled");
	}
	
	function sendRequest()
	{
		fetch(
			`${E621_URL}posts.json?_client=${USER_AGENT}&limit=${maxPerRequest}&page=${page}&tags=-webm+-swf+-rating:s+${strSearchQuery}${strTagsBlacklist}${strAdditionalQueryTags}&callback=?`
		).then(getPicsFromRequest, displayError);
	};
	
	async function getPicsFromRequest(response)
	{
		// Handle error responses.
		if (response.status < 200 || response.status > 299)
		{
			if (response.status === 403)
			{
				NotifMessage.displayError("搜索查询失败。请尝试其他搜索。");
			}
			else
			{
				NotifMessage.displayError("向 e621 发送请求时出错，网站可能已关闭，请稍后再试。");
			}

			// Reenable button.
			buttonLoadSearch.removeAttribute("disabled");
			buttonLoadSearch.value = "加载搜索";
			buttonLoadSearch.classList.remove("disabled");

			return;
		}

		
		let responseJson = await response.json();
		let posts = responseJson.posts;

		++page;
		
		for (var indexPic = 0; indexPic < posts.length; ++indexPic)
		{
			// Skip if file isn't an image.
			if (posts[indexPic].file.ext !== "png"
				&& posts[indexPic].file.ext !== "jpg"
				&& posts[indexPic].file.ext !== "gif")
			{
				continue;
			}
			
			if (bUseMapDupCheck && mapPictures[posts[indexPic].file.md5])
			{
				continue;
			}
			
			var strPictureUrl = posts[indexPic].file.url;
			if (strPictureUrl === null)
			{
				// Fallback for globally blacklisted pictures.
				var strMd5 = posts[indexPic].file.md5;
				
				strPictureUrl = E621_IMAGES_URL + "data/";
				strPictureUrl += strMd5.substr(0,2) + "/";
				strPictureUrl += strMd5.substr(2,2) + "/";
				strPictureUrl += strMd5 + "." + posts[indexPic].file.ext;
			}
			
			// Filter out blacklisted pictures.
			if (blacklistedPictures[strPictureUrl])
			{
				continue;
			}
			
			--numPics;
			favImages.push(strPictureUrl);
			arrImgIdByUrl[strPictureUrl] = posts[indexPic].id;
			
			if (bUseMapDupCheck)
			{
				mapPictures[posts[indexPic].file.md5] = 1;
			}
			
			if (numPics <= 0)
			{
				break;
			}
		}
		
		debugConsole.log(`inserted ${favImages.length} pictures in favImages.`);
		document.getElementById("spanImageCount").textContent = `找到图片: ${favImages.length}`;
		
		if (posts.length == 0 || numPics <= 0 || page > 750)
		{
			// All done, reenable buttons.
			buttonLoadSearch.removeAttribute("disabled");
			buttonLoadSearch.value = "Load search";
			buttonLoadSearch.classList.remove("disabled");
			
			if (favImages.length)
			{
				// Enable the "Display images" button if there are images to display.
				buttonDisplayImages.removeAttribute("disabled");
				buttonDisplayImages.classList.remove("disabled");
			}
			else
			{
				NotifMessage.displayError("未找到结果。检查标签拼写、黑名单标签和评分阈值。");
			}
			
			return;
		}
		
		// Still some pics left to get, recurse.
		
		// Wait for 1 second before sending next request, to respect the server.
		setTimeout(sendRequest, 1000);
	}
	
	sendRequest();
};

function onDisplayImagesClick()
{
	initExternalPicturesFavorites();
	ImageBrowser.start();
};

function onLoadCumPicClick()
{
	let imgCumPic = document.getElementById("imgCumPic");
	let buttonLoadCumPic = document.getElementById("buttonLoadCumPic");

	document.getElementById("buttonCancelCumPic").style.setProperty("display", "none");
	imgCumPic.style.setProperty("display", "none");
	
	buttonLoadCumPic.setAttribute("disabled", "disabled");
	buttonLoadCumPic.value = "Loading...";
	buttonLoadCumPic.classList.add("disabled");
	
	imgCumPic.removeAttribute("loadSuccess");
	imgCumPic.src = document.getElementById("textfieldCumPic").value;
};

function onCumPicLoaded(event)
{
	let imgCumPic = document.getElementById("imgCumPic");
	let buttonLoadCumPic = document.getElementById("buttonLoadCumPic");

	buttonLoadCumPic.removeAttribute("disabled");
	buttonLoadCumPic.value = "Load";
	buttonLoadCumPic.classList.remove("disabled");
	
	
	imgCumPic.setAttribute("loadSuccess", "1");
	imgCumPic.style.removeProperty("display");
	document.getElementById("buttonCancelCumPic").style.removeProperty("display");

	// If we detect this is a picture from e621 tagged Lucario, special message.
	let imgUrl = imgCumPic.src;

	if (imgUrl.substring(0, E621_IMAGES_URL.length) !== E621_IMAGES_URL)
	{
		// This is not an e6 picture.
		return;
	}

	let strFileFullName = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
	let strMd5 = strFileFullName.split(".")[0];

	// Request to get the picture info.
	function sendRequest()
	{
		fetch(
			`${E621_URL}posts.json?_client=${USER_AGENT}&tags=md5:${strMd5}&callback=?`
		).then(getInfoFromRequest, displayError);
	};

	function displayError()
	{
		// Fail silently.
		debugConsole.error("Network error.");
	};
	
	async function getInfoFromRequest(response)
	{
		// Fail silently.
		if (response.status < 200 || response.status > 299)
		{
			if (response.status === 403)
			{
				debugConsole.error(`无法打开此图片的 e621 页面: ${imgUrl}`);
			}
			else
			{
				debugConsole.error("向 e621 发送请求时出错，网站可能已关闭。");
			}

			return;
		}

		
		let responseJson = await response.json();
		let posts = responseJson.posts;

		if (!posts.length)
		{
			// MD5 Not found.
			debugConsole.error(`在 e621 上找不到图片: ${imgUrl}`);
			return;
		}

		// Check the tags, if Lucario is in, display the special message.
		if (posts[0].tags.species.includes("lucario"))
		{
			NotifMessage.displayCharText("哦，你真的喜欢卢卡里奥斯？<3");
		}
	}
	
	sendRequest();
};

function onCumPicLoadError(event)
{
	let buttonLoadCumPic = document.getElementById("buttonLoadCumPic");

	buttonLoadCumPic.removeAttribute("disabled");
	buttonLoadCumPic.value = "Load";
	buttonLoadCumPic.classList.remove("disabled");
	
	NotifMessage.displayError(`无法加载图片: ${document.getElementById("imgCumPic").src}`);
};

function onCancelCumPicClick()
{
	// Restore buttons.
	document.getElementById("imgCumPic").style.setProperty("display", "none");
	document.getElementById("buttonCancelCumPic").style.setProperty("display", "none");
	
	document.getElementById("imgCumPic").removeAttribute("loadSuccess");
	document.getElementById("textfieldCumPic").value = "";
};

function updateCharacter()
{
	localStorage.setItem("strCharName", strCharName);
	
	// Set name in description.
	document.getElementById("spanCharName").textContent = strCharName;
	
	// Set character picture.
	document.getElementById("imgIntro").setAttribute("src", `https://cdn.jsdelivr.net/gh/dragonjay-lyj/cumc@master/src/assets/intro_${strCharName}.avif`);

	// Set easter egg Lucario picture.
	// Use local variable in case the global one changes while the picture is loading.
	let strCharNameLoading = strCharName;

	// Request to get the picture info.
	function sendRequest()
	{
		fetch(
			lucarioEasterEggQueries[strCharNameLoading]
		).then(getPicsFromRequest, displayError);
	};

	function displayError()
	{
		// Fail silently.
		debugConsole.error("Network error.");
	};
	
	async function getPicsFromRequest(response)
	{
		// Fail silently.
		if (response.status < 200 || response.status > 299)
		{
			debugConsole.error("向 e621 发送请求时出错，网站可能已关闭。");
			return;
		}

		let responseJson = await response.json();
		let posts = responseJson.posts;

		if (!posts.length)
		{
			// No image found (Should never happen, there's plenty of Lucario solos with a high score).
			debugConsole.error("复活节彩蛋路卡利欧的图片在 e621 上找不到。");
			return;
		}

		// Set the image in the hidden image container.
		lucarioEasterEggPic[strCharNameLoading] = posts[0].file.url;

		// Add the entry if we want to view in e6.
		arrImgIdByUrl[posts[0].file.url] = posts[0].id;

		document.getElementById("imgEasterEggLucario").setAttribute("src", lucarioEasterEggPic[strCharNameLoading]);
	}
	
	// Load a picture if not already done.
	if (!lucarioEasterEggPic[strCharNameLoading])
	{
		sendRequest();
	}
	else
	{
		// Set the picture in the hidden container.
		document.getElementById("imgEasterEggLucario").setAttribute("src", lucarioEasterEggPic[strCharNameLoading]);
	}
};

function onSetCharMaleClick()
{
	if (strCharName === "Lucas")
	{
		return;
	}

	NotifMessage.displayCharText("今天我来当你的 '爸爸';3");

	strCharName = "Lucas";
	updateCharacter();
};

function onSetCharFemaleClick()
{
	if (strCharName === "Lucia")
	{
		return;
	}

	NotifMessage.displayCharText("今天我来当你的 '妈妈';3");

	strCharName = "Lucia";
	updateCharacter();
};

function onElectronFolderSelected(data) {
    if (!data) {
        // Clicked "cancel" in dialog, nothing to do.
        return;
    }

    let filelist = data.filelist;

    if (filelist.length <= 1) {
        NotifMessage.displayError("该文件夹中没有文件。");
        return;
    }

    if (mapLocalFoldersLoaded[filelist[0]]) {
        NotifMessage.displayError("已添加文件夹。");
        return;
    }

    let nFolderIndex = arrLocalPictures.length;
    arrLocalPictures[nFolderIndex] = [];

    // Start at index 1, the 1st element is the folder name.
    for (var indexFile = 1; indexFile < filelist.length; ++indexFile) {
        var fileName = filelist[indexFile];

        // Extract file extension.
        var arrStrFileName = fileName.split(".");
        var strFileExt = arrStrFileName[arrStrFileName.length - 1].toUpperCase();

        // Filter out files that don't match the extension.
        if (strFileExt != "JPG" &&
            strFileExt != "JPEG" &&
            strFileExt != "PNG" &&
            strFileExt != "GIF" &&
            strFileExt != "BMP" &&
            strFileExt != "WEBP") {
            // Skip files that aren't images.
            continue;
        }

        var strFileFullName = "file:///";
        arrStrFileName = fileName.split("\\");
        strFileFullName += arrStrFileName[0];

        for (var indexNamePart = 1; indexNamePart < arrStrFileName.length; ++indexNamePart) {
            strFileFullName += "\\" + encodeURIComponent(arrStrFileName[indexNamePart]);
        }

        arrLocalPictures[nFolderIndex].push(strFileFullName);
    }

    let strFolderName = filelist[0];

    // Only keep the last part of the path if it's long.
    if (strFolderName.length > 33) {
        strFolderName = "..." + strFolderName.slice(strFolderName.length - 30);
    }

    arrLocalPictures.nTotalPics += arrLocalPictures[nFolderIndex].length;
    console.log('Total Pics:', arrLocalPictures.nTotalPics); // 调试日志

    mapLocalFoldersLoaded[filelist[0]] = { strPath: filelist[0], bIncludeSubfolders: data.bIncludeSubfolders };

    // Save currently loaded folders.
    localStorage.setItem("mapLastUsedLocalPaths", JSON.stringify(mapLocalFoldersLoaded));

    // Update the UI.
    document.getElementById("labelInputFiles").textContent = `Pics: ${arrLocalPictures.nTotalPics}`;

    // Generate the UI.
    let divFolder = document.createElement("div");
    divFolder.setAttribute("id", `divSelectedFolder${nFolderIndex}`);
    document.getElementById("divSelectedFolders").appendChild(divFolder);

    let labelFolder = document.createElement("label");
    labelFolder.classList.add("col-sm-4");
    labelFolder.classList.add("control-label");
    divFolder.appendChild(labelFolder);

    let divFolderInfo = document.createElement("div");
    divFolderInfo.classList.add("col-sm-8");
    divFolderInfo.style.setProperty("margin-top", "10px");
    divFolder.appendChild(divFolderInfo);

    let strIconPath = "https://w3s.link/ipfs/QmRcRBcH8je2xk1j6DD7gGXLwyxeZmLLptY8Vsne44YSW2";

    if (data.bIncludeSubfolders) {
        strIconPath = "https://w3s.link/ipfs/Qma6M8rcff4P8GLEbgiTrGT9Kz2ab3siBeLUmAmhXWA4of";
    }

    let imgFolder = document.createElement("img");
    imgFolder.setAttribute("src", strIconPath);
    imgFolder.style.setProperty("vertical-align", "middle");
    imgFolder.style.setProperty("width", "20px");
    imgFolder.style.setProperty("height", "20px");
    divFolderInfo.appendChild(imgFolder);

    let labelFolderInfoText = document.createElement("label");
    labelFolderInfoText.textContent = `${strFolderName} - Pics: ${arrLocalPictures[nFolderIndex].length}`;
    labelFolderInfoText.style.setProperty("margin-left", "10px");
    labelFolderInfoText.style.setProperty("margin-right", "10px");
    divFolderInfo.appendChild(labelFolderInfoText);

    let buttonCancel = document.createElement("input");
    buttonCancel.setAttribute("folderIndex", "" + nFolderIndex);
    buttonCancel.setAttribute("folderPath", filelist[0]);
    buttonCancel.setAttribute("type", "image");
    buttonCancel.setAttribute("src", "https://w3s.link/ipfs/QmXDnKVwexxbpReTBFUzX8htgWugSjJGmqCknP3ACnw8F4");
    buttonCancel.style.setProperty("vertical-align", "middle");
    buttonCancel.style.setProperty("margin-top", "0px");
    buttonCancel.style.setProperty("width", "20px");
    buttonCancel.style.setProperty("height", "20px");
    divFolderInfo.appendChild(buttonCancel);

    buttonCancel.addEventListener("click", onLocalFolderCancelClick);
};

const electronApi = {
    showDialog: (includeSubfolders) => {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true; // 允许选择文件夹
            input.multiple = true; // 允许选择多个文件

            input.onchange = (event) => {
                const files = Array.from(event.target.files);
                const folderPath = files.length > 0 ? files[0].webkitRelativePath.split('/')[0] : null;

                if (!folderPath) {
                    resolve(null); // 用户取消选择
                    return;
                }

                // 构建符合代码预期的数据结构
                const filelist = [folderPath, ...files.map(file => file.webkitRelativePath)];

                resolve({
                    filelist,
                    bIncludeSubfolders: includeSubfolders
                });
            };

            input.click(); // 触发文件选择对话框
        });
    }
};

function onLocalPicturesFolderClick(event)
{
	bIncludeSubfolders = document.getElementById("cbIncludeSubfolders").checked;
	electronApi.showDialog(bIncludeSubfolders).then(onElectronFolderSelected);
};

// 模拟的回调函数
function onElectronFolderSelected(filePaths) {
	console.log('Selected folders:', filePaths);
}

function onLocalFolderCancelClick(event)
{
	let strFolderIndex = event.target.getAttribute("folderIndex");
	let strFolderPath = event.target.getAttribute("folderPath");
	
	// Remove UI.
	document.getElementById(`divSelectedFolder${strFolderIndex}`).remove();
	
	// Remove corresponding pictures from list.
	arrLocalPictures.nTotalPics -= arrLocalPictures[strFolderIndex].length;
	arrLocalPictures[strFolderIndex] = [];

	delete mapLocalFoldersLoaded[strFolderPath];

	// Save currently loaded folders.
	localStorage.setItem("mapLastUsedLocalPaths", JSON.stringify(mapLocalFoldersLoaded));
	
	// Update UI.
	document.getElementById("labelInputFiles").textContent = `Pics: ${arrLocalPictures.nTotalPics}`;
};

function initImageManagerAndStart()
{
	// Start the game once the ImageManager has been initialized.
	let buttonStartGame = document.getElementById("buttonStartGame");

	buttonStartGame.setAttribute("disabled", "disabled");
	buttonStartGame.value = "Loading...";
	buttonStartGame.classList.add("disabled");
	
	ImageManager.initialize(startGame);
}

function initializePictures()
{
	document.getElementById("labelCumbar").textContent = "CUM?";
	
	if (document.getElementById("rbPicUseLocal").checked)
	{
		initOwnPictures();
	}
	else
	{
		// Cap the picture change speed to 5 seconds if using online pictures.
		let bSpeedTooLow = false;
		let nbPictureChangeSpeed = document.getElementById("nbPictureChangeSpeed");
		let nbPictureChangeSpeedCum = document.getElementById("nbPictureChangeSpeedCum");

		if (nbPictureChangeSpeed.value < 5)
		{
			bSpeedTooLow = true;
			nbPictureChangeSpeed.value = 5;
		}

		if (nbPictureChangeSpeedCum.value < 5)
		{
			bSpeedTooLow = true;
			nbPictureChangeSpeedCum.value = 5;
		}

		if (bSpeedTooLow)
		{
			NotifMessage.displayWarning("图片更换速度太快，不适合在线使用，因此上限为 5 秒。");
		}

		if (document.getElementById("rbPicUseList").checked)
		{
			initListPictures();
		}
		else
		{
			initExternalPicturesFavorites();
		}	
	}
	
	if (ImageManager.finalImages.length === 0)
	{
		// Start the game if the user clicks on the "Continue" button.
		let popup = new Popup("无图片显示。继续？");
		popup.addOption("继续", initImageManagerAndStart);
		popup.addOption("返回");

		return;
	}

	// Pictures set, continue initialisation and start the game.
	initImageManagerAndStart();
};

function initOwnPictures()
{
	ImageManager.finalImages = [];

	// Populate from given pictures list.
	for (let nIndexArr = 0; nIndexArr < arrLocalPictures.length; ++nIndexArr)
	{
		ImageManager.finalImages = ImageManager.finalImages.concat(arrLocalPictures[nIndexArr]);
	}
};

function initExternalPicturesFavorites()
{
	ImageManager.finalImages = [];
	ImageManager.finalImages = ImageManager.finalImages.concat(favImages);
	
	debugConsole.log(`inserted ${ImageManager.finalImages.length} pictures.`);
};

function initListPictures()
{
	ImageManager.finalImages = [];

	let keys = Object.keys(gameListPictures);
	for (let i = 0; i < keys.length; ++i)
	{
		if (keys[i] != "lists")
		{
			ImageManager.finalImages.push(keys[i]);
		}
	}
};


var timeoutOnCumPercentChangeComment = null;

function onCumPercentChange()
{
	clearTimeout(timeoutOnCumPercentChangeComment);
	timeoutOnCumPercentChangeComment = null;

	document.getElementById("divCumPercent").textContent = `${document.getElementById("cumPercent").value}%`;

	// Don't trigger any flavour text if changes were triggered by settings loading.
	if (!isPageLoaded)
	{
		return;
	}

	if (document.getElementById("cumPercent").value == "100")
	{
		timeoutOnCumPercentChangeComment = setTimeout(NotifMessage.displayCharText, 500, "看来有人很饥渴......");
	}
	else if (document.getElementById("cumPercent").value == "0")
	{
		timeoutOnCumPercentChangeComment = setTimeout(NotifMessage.displayCharText, 500, "纪律严明，不是吗？");
	}
};


var flagOnEdgeDurationChangeLastMessage = 0;

function onEdgeDurationChange()
{
	var nMinutes = parseInt(document.getElementById("rangeEdgeDuration").value);
	
	var nHours = parseInt(nMinutes / 60);
	nMinutes = nMinutes % 60;
	
	if (nHours > 0)
	{
		document.getElementById("divEdgeDuration").textContent = `${nHours}h ${nMinutes}min`;
	}
	else
	{
		document.getElementById("divEdgeDuration").textContent = `${nMinutes}min`;
	}

	// Don't trigger any flavour text if changes were triggered by settings loading.
	if (!isPageLoaded)
	{
		return;
	}

	if (nHours * 60 + nMinutes <= 10 && flagOnEdgeDurationChangeLastMessage !== 1)
	{
		flagOnEdgeDurationChangeLastMessage = 1;
		NotifMessage.displayCharText("去快活一下？");
	}
	else if (nHours * 60 + nMinutes >= 3 * 60 && flagOnEdgeDurationChangeLastMessage !== 2)
	{
		flagOnEdgeDurationChangeLastMessage = 2;
		NotifMessage.displayCharText("你不可能坚持那么久的");
	}
};

function onStepSpeedGoChange()
{
	document.getElementById("spanStepSpeedGo").textContent = `x${document.getElementById("rangeStepSpeedGo").value}`;
}

function onStepSpeedStopChange()
{
	document.getElementById("spanStepSpeedStop").textContent = `x${document.getElementById("rangeStepSpeedStop").value}`;
}

function onVibratePowerChange()
{
	// Update the Buttplug setting.
	let strPowerPercent = document.getElementById("rangeVibratePower").value;
	ButtplugConnection.setMaxVibratePower(parseFloat(strPowerPercent) / 100.0);

	document.getElementById("spanVibratePower").textContent = `${strPowerPercent}%`;
};

function onOscillatePowerChange()
{
	// Update the Buttplug setting.
	let strPowerPercent = document.getElementById("rangeOscillatePower").value;
	ButtplugConnection.setMaxOscillatePower(parseFloat(strPowerPercent) / 100.0);

	document.getElementById("spanOscillatePower").textContent = `${strPowerPercent}%`;
};

function onRotatePowerChange()
{
	// Update the Buttplug setting.
	let strPowerPercent = document.getElementById("rangeRotatePower").value;
	ButtplugConnection.setMaxRotatePower(parseFloat(strPowerPercent) / 100.0);

	document.getElementById("spanRotatePower").textContent = `${strPowerPercent}%`;
};

function onMoveSpeedMinChange()
{
	let dMinBps = parseFloat(document.getElementById("rangeMoveSpeedMin").value);
	let dMaxBps = parseFloat(document.getElementById("rangeMoveSpeedMax").value);

	if (dMaxBps < dMinBps)
	{
		dMaxBps = dMinBps;
		document.getElementById("rangeMoveSpeedMax").value = dMaxBps;
	}

	onMoveSpeedChange(dMinBps, dMaxBps);
};

function onMoveSpeedMaxChange()
{
	let dMinBps = parseFloat(document.getElementById("rangeMoveSpeedMin").value);
	let dMaxBps = parseFloat(document.getElementById("rangeMoveSpeedMax").value);

	if (dMinBps > dMaxBps)
	{
		dMinBps = dMaxBps;
		document.getElementById("rangeMoveSpeedMin").value = dMinBps;
	}

	onMoveSpeedChange(dMinBps, dMaxBps);
};

function onMoveSpeedChange(dMinBps, dMaxBps)
{
	// Update the Buttplug setting.
	ButtplugConnection.setMoveBpsRange(dMinBps, dMaxBps);

	document.getElementById("spanMoveSpeedMin").textContent = `${dMinBps}BPS`;
	document.getElementById("spanMoveSpeedMax").textContent = `${dMaxBps}BPS`;
};

function onMoveLengthChange()
{
	let dLengthPercent = parseInt(document.getElementById("rangeMoveLength").value);

	// Cap the min length to 20%.
	if (dLengthPercent < 20)
	{
		dLengthPercent = 20;
		document.getElementById("rangeMoveLength").value = dLengthPercent;
	}

	// Update the Buttplug setting.
	ButtplugConnection.setMaxMoveLength(dLengthPercent / 100.0);

	document.getElementById("spanMoveLength").textContent = `${dLengthPercent}%`;
};

function onConstrictChange()
{
	let bConstrict = document.getElementById("cbButtplugConstrict").checked;

	// Update the Buttplug setting.
	ButtplugConnection.setConstrictEnabled(bConstrict);
};

function onClickShowRules()
{
	var buttonShowRules = document.getElementById("buttonShowRules");
	var rulesText = document.getElementById("rulesText");
	
	if (rulesText.style.getPropertyValue("display") === "none")
	{
		buttonShowRules.value = "Hide";
		rulesText.style.removeProperty("display");
	}
	else
	{
		buttonShowRules.value = "Show";
		rulesText.style.setProperty("display", "none");
	}
}

function onClickCredits()
{
	var buttonShowCredits = document.getElementById("buttonShowCredits");
	var creditsSection = document.getElementById("creditsSection");
	
	if (creditsSection.style.getPropertyValue("display") === "none")
	{
		buttonShowCredits.value = "Hide";
		creditsSection.style.removeProperty("display");
	}
	else
	{
		buttonShowCredits.value = "Credits";
		creditsSection.style.setProperty("display", "none");
	}
}

function onClickAdvancedOptions()
{
	document.getElementById("advancedOptionsWrapper").style.removeProperty("display");
	document.getElementById("basicOptionsWrapper").style.setProperty("display", "none");
}

function onExitAdvancedOptions()
{
	document.getElementById("advancedOptionsWrapper").style.setProperty("display", "none");
	document.getElementById("basicOptionsWrapper").style.removeProperty("display");
}

function onClickEditTrainer()
{
	document.getElementById("trainerOptionsWrapper").style.removeProperty("display");
	document.getElementById("basicOptionsWrapper").style.setProperty("display", "none");
}

function onClickExitTrainer()
{
	document.getElementById("trainerOptionsWrapper").style.setProperty("display", "none");
	document.getElementById("basicOptionsWrapper").style.removeProperty("display");
}

function onClickEditLists()
{
	document.getElementById("listsWrapper").style.removeProperty("display");
	document.getElementById("basicOptionsWrapper").style.setProperty("display", "none");
}

function onExitListsEditor()
{
	document.getElementById("listsWrapper").style.setProperty("display", "none");
	document.getElementById("basicOptionsWrapper").style.removeProperty("display");
}

function resetConsecutiveFastSwipes()
{
	countFastSwipes = 0;
	timeoutResetConsecutiveFastSwipes = null;
}

function onClickNext()
{
	// Check the button is clickable.
	if (document.getElementById("divGameControls").style.getPropertyValue("display") === "none"
		|| document.getElementById("buttonSlideshowNext").getAttribute("disabled"))
	{
		return;
	}
	
	if (State.optionGameMode == State.GAMEMODE_SLIDESHOW)
	{
		GameModeSlideshow.onClickNext();
	}
	else
	{
		if (State.optionGameMode == State.GAMEMODE_ENDURANCE) {
			GameModeEndurance.onClickNext();
		}
		else {
			GameModeNormal.onClickNext();
		}

		ImageManager.displayNextImage();

		// Easter egg trigger.
		if (!flagFastSwipeTriggered)
		{
			++countFastSwipes;
			clearTimeout(timeoutResetConsecutiveFastSwipes);

			if (countFastSwipes < 8)
			{
				// Wait for more successive fast swipes.
				timeoutResetConsecutiveFastSwipes = setTimeout(resetConsecutiveFastSwipes, 2000);
			}
			else
			{
				// Trigger comment.
				flagFastSwipeTriggered = true;
				countFastSwipes = 0;

				let arrMsg = [
					"这些都不合你眼缘？莫非你更愿意一睹我的芳容？",
					"瞧你跳过不看... 不如来欣赏一下英俊潇洒的路卡利欧如何？",
					"你怕是得重新斟酌一下搜索内容了。来，且看这个！"
				];

				NotifMessage.displayCharText(arrMsg[getRandInteger(0, arrMsg.length - 1)]);

				// Replace picture about to be displayed with a Lucario.
				ImageManager.imageContainer.setAttribute("src", document.getElementById("imgEasterEggLucario").getAttribute("src"));
			}
		}
	}
}

function onClickPrev()
{
	// Check the button is clickable.
	if (document.getElementById("divGameControls").style.getPropertyValue("display") === "none"
		|| document.getElementById("buttonSlideshowPrev").getAttribute("disabled"))
	{
		return;
	}
	
	if (State.optionGameMode == State.GAMEMODE_SLIDESHOW)
	{
		GameModeSlideshow.onClickPrev();
	}
	else
	{
		ImageManager.displayPrevImage();
	}
}

function onClickView()
{
	ImageManager.openCurPicturePage();
}

function onClickBlacklist(bool)
{
	let check = true;
	let blacklistedIndex = false;
	let tempURL = State.tempURL;
	let count = [];
	let keys = Object.keys(ListManager.lists);

	if ((tempURL == null || tempURL == undefined || tempURL == "") && bool != true)
	{
		for (let i = 0; i < keys.length; ++i)
		{
			if (ListManager.lists[keys[i]][ImageManager.finalImages[ImageManager.curPictureIndex]] != null
				&& ListManager.lists[keys[i]][ImageManager.finalImages[ImageManager.curPictureIndex]] != undefined)
			{
				count.push(keys[i]);
			}
		}

		let strMsg = "";

		if (count.length > 0)
		{
			strMsg = "此图像存在于列表中。将其列入黑名单将从所有列表中删除。存在于: " + count.join(", ");
		}
		else
		{
			strMsg = "确认黑名单？";
		}

		let popup = new Popup(strMsg);
			
		if (!ProgressBarManager.isPaused)
		{
			onClickPause();
			State.notPuasedWhenBlacklisted = true;
		}
		else
		{
			State.notPuasedWhenBlacklisted = false;
		}

		popup.addOption("Confirm", () => {
			onClickBlacklist(true);
			if (State.notPuasedWhenBlacklisted)
			{
				onClickPause();
			}
		});
		popup.addOption("Cancel", () => {
			if (State.notPuasedWhenBlacklisted)
			{
				onClickPause();
			}
		});

		return;
	}

	if (ImageManager.curPictureIndex === -1 && !tempURL)
	{
		return;
	}
	
	for (let i = 0; i < ImageManager.finalImages.length; ++i)
	{
		if (ImageManager.finalImages[i] == tempURL)
		{
			check = false;
			blacklistedIndex = i;
			break;
		}
	}

	// This check is here to stop the process if initiated from the ImageBrowser.
	// Blacklisting isn't the same process when in browse view.
	if (!check)
	{
		return;
	}
	
	var strImageURL;

	if (tempURL !== null && tempURL !== undefined && tempURL != "")
	{
		strImageURL = tempURL;
	}
	else
	{
		strImageURL = ImageManager.finalImages[ImageManager.curPictureIndex];
	}
	
	ImageManager.finalImages.splice(ImageManager.finalImages.indexOf(strImageURL), 1);
	favImages.splice(favImages.indexOf(strImageURL), 1);

	// Add the picture to the blacklist, along with useful info about the picture.
	blacklistedPictures[strImageURL] = {id: arrImgIdByUrl[strImageURL], url: strImageURL};
	if (!blacklistedIndex)
	{
		blacklistedIndex = ImageManager.curPictureIndex;
	}

	if (ImageManager.preloadedIndex > blacklistedIndex)
	{
		--ImageManager.preloadedIndex;
	}
	else if (ImageManager.preloadedIndex == blacklistedIndex)
	{
		ImageManager.preloadedIndex = -1;
	}
	
	if (ImageManager.prevPictureIndex > blacklistedIndex)
	{
		--ImageManager.prevPictureIndex;
	}
	else if (ImageManager.prevPictureIndex == blacklistedIndex)
	{
		ImageManager.prevPictureIndex = -1;
	}

	for (let i = 0; i < ImageManager.previousImages.length; ++i)
	{
		if (ImageManager.previousImages[i] > blacklistedIndex)
		{
			--ImageManager.previousImages[i];
		}
		else if (ImageManager.previousImages[i] == blacklistedIndex)
		{
			ImageManager.previousImages.splice(i,1);
			--i;
		}
	}
	
	debugConsole.log(`Blacklisted ${strImageURL}`);

	for (let i = 0; i < keys.length; ++i)
	{
		if (ListManager.lists[keys[i]][strImageURL] != null
			&& ListManager.lists[keys[i]][strImageURL] != undefined)
		{
			delete ListManager.lists[keys[i]][strImageURL];
		}
	}

	// Save lists to local storage.
	localStorage.setItem("blacklistedPicturesJSON", JSON.stringify(blacklistedPictures));
	localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));

	if (gameListPictures[strImageURL] >= 1)
	{
		delete gameListPictures[strImageURL];
		document.getElementById("labelInputList").textContent = `独特照片总数: ${Object.keys(gameListPictures).length - 1}`;
	}

	RNGList.decrement(ImageManager.curPictureIndex);
	--ImageManager.curPictureIndex;

	onClickNext();
}

function onClickPause()
{
	let buttonSlideshowPause = document.getElementById("buttonSlideshowPause");

	ProgressBarManager.togglePause();
	
	if (ProgressBarManager.isPaused)
	{
		buttonSlideshowPause.style.setProperty("background-image", "linear-gradient(#040204 0px, #3d1564 100%)");
		ButtplugConnection.pauseAll();
	}
	else
	{
		buttonSlideshowPause.style.removeProperty("background-image");
		ButtplugConnection.unpauseAll();
	}
}

async function onClickButtonButtplugConnect()
{
	// When receiving a disconnect event, update the UI.
	function onButtplugDisconnect()
	{
		document.getElementById("spanButtplugConnectionStatus").textContent = "Disconnected";
	}

	// Only allowing one connection at a time for now.
	if (buttplugConnection)
	{
		await buttplugConnection.disconnect();
	}

	buttplugConnection = new ButtplugConnection(document.getElementById("textServerUrl").value);
	buttplugConnection.setHandlerDisconnect(onButtplugDisconnect);
	
	buttplugConnection.connect().then((strServerUrl) => {
		document.getElementById("spanButtplugConnectionStatus").textContent = `Connected to ${strServerUrl}`;
	}).catch((e) => {
		debugConsole.error("Connection failed.");
		debugConsole.error(e);
	});
}

function onClickButtonButtplugDisconnect()
{
	if (!buttplugConnection)
	{
		return;
	}

	buttplugConnection.disconnect();
}

var timeoutOnClickButtonButtplugStop = null;

function stopButtplugDevices()
{
	ButtplugConnection.stopAllDevicesConnected();
}

function onClickButtonButtplugVibrate()
{
	stopButtplugDevices();

	clearTimeout(timeoutOnClickButtonButtplugStop);
	timeoutOnClickButtonButtplugStop = null;

	if (!buttplugConnection)
	{
		NotifMessage.displayWarning("无法振动：客户端断开连接。");
		return;
	}
	
	buttplugConnection.vibrateAll(1.0);

	// Stop the vibration after 1 second.
	timeoutOnClickButtonButtplugStop = setTimeout(stopButtplugDevices, 1000);
}

function onClickButtonButtplugOscillate()
{
	stopButtplugDevices();

	clearTimeout(timeoutOnClickButtonButtplugStop);
	timeoutOnClickButtonButtplugStop = null;

	if (!buttplugConnection)
	{
		NotifMessage.displayWarning("无法振荡：客户端断开连接。");
		return;
	}
	
	buttplugConnection.oscillateAll(1.0);

	// Stop the oscillation after 1 second.
	timeoutOnClickButtonButtplugStop = setTimeout(stopButtplugDevices, 1000);
}

function onClickButtonButtplugRotate()
{
	stopButtplugDevices();

	clearTimeout(timeoutOnClickButtonButtplugStop);
	timeoutOnClickButtonButtplugStop = null;

	if (!buttplugConnection)
	{
		NotifMessage.displayWarning("无法旋转：客户端断开连接。");
		return;
	}
	
	buttplugConnection.rotateAll(1.0);

	// Stop the rotation after 1 second.
	timeoutOnClickButtonButtplugStop = setTimeout(stopButtplugDevices, 1000);
}

function onClickButtonButtplugConstrict()
{
	stopButtplugDevices();

	clearTimeout(timeoutOnClickButtonButtplugStop);
	timeoutOnClickButtonButtplugStop = null;

	if (!buttplugConnection)
	{
		NotifMessage.displayWarning("无法旋转：客户端断开连接。");
		return;
	}
	
	buttplugConnection.constrictAll(1.0);

	// Stop the constriction after 1 second.
	timeoutOnClickButtonButtplugStop = setTimeout(stopButtplugDevices, 1000);
}

function onClickButtonButtplugMove()
{
	stopButtplugDevices();

	clearTimeout(timeoutOnClickButtonButtplugStop);
	timeoutOnClickButtonButtplugStop = null;

	if (!buttplugConnection)
	{
		NotifMessage.displayWarning("无法移动：客户端断开连接。");
		return;
	}
	
	// Get test BPS.
	let dBps = parseFloat(document.getElementById("nbMovePowerTestBps").value);

	// Convert to power.
	let dPower = dBps / 5.0;
	ButtplugConnection.setLastPower(dPower);
	buttplugConnection.moveAll(dPower);

	// Stop the rotation after 3 second.
	timeoutOnClickButtonButtplugStop = setTimeout(stopButtplugDevices, 3000);
}

function onBackgroundColorChange()
{
	// Set the background colour, and compute all other colours from it.
	Visuals.backgroundColor.go = Visuals.backgroundColor.first = Visuals.backgroundColor.finish = parseInt(document.getElementById("backgroundColorGo").value.substr(1), 16);

	Visuals.backgroundColor.stop = Visuals.backgroundColor.cancel = parseInt(document.getElementById("backgroundColorStop").value.substr(1), 16);

	Visuals.updateColors();
}

function onExpandBrowserSelectors()
{
	if (State.newBrowserList)
	{
		// If the user pressed "n".
		document.getElementById("browserButtonImageAddToListNew").value = "New";
		document.getElementById("browserButtonExpandListSelectors").value = "<";
		document.getElementById("browserNewListNameField").value = "";
		document.getElementById("browserNewListNameField").style.setProperty("display", "none");

		if (document.getElementById("browserListOfListsSelector").classList.contains("containsCurrentImage"))
		{
			document.getElementById("buttonImageAddToListBrowserText").value = "Already in";
			document.getElementById("buttonImageAddToListBrowserText").setAttribute("disabled", "disabled");
			document.getElementById("buttonImageAddToListBrowserText").classList.add("disabled");
		}
		else
		{
			document.getElementById("buttonImageAddToListBrowserText").value = "Add to list";
			document.getElementById("buttonImageAddToListBrowserText").removeAttribute("disabled");
			document.getElementById("buttonImageAddToListBrowserText").classList.remove("disabled");
		}

		State.newBrowserList = !State.newBrowserList;
		return;
	}

	if (!State.expandedBrowser)
	{
		document.getElementById("browserButtonExpandListSelectors").style.removeProperty("display");
		document.getElementById("browserExtensionWrapper").style.setProperty("display", "flex");
	}
	else
	{
		document.getElementById("browserExtensionWrapper").style.setProperty("display", "none");
		document.getElementById("browserButtonExpandListSelectors").style.setProperty("display", "none");

		document.getElementById("buttonImageAddToListBrowserText").value = "Add to list";
		document.getElementById("buttonImageAddToListBrowserText").removeAttribute("disabled");
		document.getElementById("buttonImageAddToListBrowserText").classList.remove("disabled");
	}

	State.expandedBrowser = !State.expandedBrowser;
}

function onNewBrowserList()
{
	if (!State.newBrowserList)
	{
		document.getElementById("buttonImageAddToListBrowserText").value = "Name list";
		document.getElementById("browserButtonImageAddToListNew").value = "y";
		document.getElementById("browserButtonExpandListSelectors").value = "n";
		document.getElementById("browserNewListNameField").focus();
		document.getElementById("browserNewListNameField").style.removeProperty("display");
	}
	else
	{
		let strListName = document.getElementById("browserNewListNameField").value;
		document.getElementById("browserNewListNameField").value = "";
		ListManager.initializeNewList(strListName);

		let buttonImageAddToListBrowserText = document.getElementById("buttonImageAddToListBrowserText");

		if (document.getElementById("browserListOfListsSelector").classList.contains("containsCurrentImage"))
		{
			buttonImageAddToListBrowserText.value = "Already in";
			buttonImageAddToListBrowserText.setAttribute("disabled", "disabled");
			buttonImageAddToListBrowserText.classList.add("disabled");
		}
		else
		{
			buttonImageAddToListBrowserText.value = "Add to list";
			buttonImageAddToListBrowserText.removeAttribute("disabled");
			buttonImageAddToListBrowserText.classList.remove("disabled");
		}

		document.getElementById("browserButtonImageAddToListNew").value = "New";
		document.getElementById("browserButtonExpandListSelectors").value = "<";

		localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));

		document.getElementById("browserNewListNameField").style.setProperty("display", "none");
	}

	State.newBrowserList = !State.newBrowserList;
}

function onBrowserAddToList()
{
	if (!State.expandedBrowser)
	{
		let buttonImageAddToListBrowserText = document.getElementById("buttonImageAddToListBrowserText");

		if (document.getElementById("browserListOfListsSelector").classList.contains("containsCurrentImage"))
		{
			buttonImageAddToListBrowserText.value = "Already in";
			buttonImageAddToListBrowserText.setAttribute("disabled", "disabled");
			buttonImageAddToListBrowserText.classList.add("disabled");
		}
		else
		{
			buttonImageAddToListBrowserText.value = "Add to list";
			buttonImageAddToListBrowserText.removeAttribute("disabled");
			buttonImageAddToListBrowserText.classList.remove("disabled");
		}

		document.getElementById("browserButtonExpandListSelectors").style.removeProperty("display");
		document.getElementById("browserExtensionWrapper").style.setProperty("display", "flex");

		State.expandedBrowser = !State.expandedBrowser;
	}
	else
	{
		let srcElement = document.getElementById("bigImageSrcHolder");
		if (State.imageBrowserCurrentList == null && State.imageBrowserListName == null || State.imageBrowserListName == "bookmarked")
		{
			ListManager.lists[document.getElementById("browserListOfListsSelector").value][srcElement.src] = { id: arrImgIdByUrl[srcElement.src], url: srcElement.src };
		}
		else
		{
			ListManager.lists[document.getElementById("browserListOfListsSelector").value][srcElement.src] = Object.assign(
				(State.imageBrowserCurrentList == blacklistedPictures) ? 
				blacklistedPictures[srcElement.src] : 
				ListManager.lists[State.imageBrowserListName][srcElement.src]
			);
		}
		
		document.getElementById("browserButtonExpandListSelectors").style.setProperty("display", "none");
		document.getElementById("browserExtensionWrapper").style.setProperty("display", "none");

		localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));

		State.expandedBrowser = !State.expandedBrowser;

		if (gameListPictures.lists[document.getElementById("browserListOfListsSelector").value])
		{
			if (!gameListPictures[srcElement.src] >= 1)
			{
				gameListPictures[srcElement.src] = 1;
				document.getElementById("labelInputList").textContent = `Total Unique Pics: ${Object.keys(gameListPictures).length - 1}`;
			}
			else
			{
				++gameListPictures[srcElement.src];
			}
		}

		ListManager.checkAddedBrowserLists();
	}
}

function onImageViewerViewE6()
{
	ImageBrowser.openCurPicturePage();
}

function calcPicValue(listName, addOrSub)
{
	list = Object.keys(ListManager.lists[listName]);
	let origCount = Object.keys(gameListPictures).length;

	if (gameListPictures["lists"][listName] && addOrSub)
	{
		return false;
	}

	if (addOrSub)
	{
		gameListPictures["lists"][listName] = true;
	}
	else
	{
		gameListPictures["lists"][listName] = false;
	}

	if (addOrSub)
	{
		for (let i = 0; i < list.length; ++i)
		{
			if (!gameListPictures[list[i]])
			{
				gameListPictures[list[i]] = 1;
			}
			else
			{
				++gameListPictures[list[i]];
			}
		}
	}
	else
	{
		for (let i = 0; i < list.length; ++i)
		{
			if (gameListPictures[list[i]] == 1)
			{
				delete gameListPictures[list[i]];
			}
			else if (gameListPictures[list[i]])
			{
				--gameListPictures[list[i]];
			}
		}
	}
	
	return [Object.keys(gameListPictures).length - origCount, Object.keys(gameListPictures).length - 1];
}

function onClickLoadList()
{
	let strSelectedList = document.getElementById("picUseListSelector").value;

	// Generate the UI.
	let picValue = calcPicValue(strSelectedList, true);
	if (!picValue)
	{
		return;
	}

	document.getElementById("labelInputList").textContent = `独特照片总数: ${picValue[1]}`;
	
	let divList = document.createElement("div");
	divList.setAttribute("id", `divSelectedList${strSelectedList}`);
	document.getElementById("divSelectedLists").appendChild(divList);
	
	let labelList = document.createElement("label");
	labelList.classList.add("col-sm-4");
	labelList.classList.add("control-label");
	divList.appendChild(labelList);
	
	let divListInfo = document.createElement("div");
	divListInfo.classList.add("col-sm-8");
	divListInfo.style.setProperty("margin-top", "10px");
	divList.appendChild(divListInfo);
	
	let strIconPath = "https://w3s.link/ipfs/QmRcRBcH8je2xk1j6DD7gGXLwyxeZmLLptY8Vsne44YSW2";
	
	let imgList = document.createElement("img");
	imgList.setAttribute("src", strIconPath);
	imgList.style.setProperty("vertical-align", "middle");
	imgList.style.setProperty("width", "20px");
	imgList.style.setProperty("height", "20px");
	divListInfo.appendChild(imgList);
	
	
	let labelListInfoText = document.createElement("label");
	labelListInfoText.textContent = `${strSelectedList} - Unique Pics: ${picValue[1]}`;
	labelListInfoText.style.setProperty("margin-left", "10px");
	labelListInfoText.style.setProperty("margin-right", "10px");
	divListInfo.appendChild(labelListInfoText);
	
	let buttonCancel = document.createElement("input");
	buttonCancel.setAttribute("listIndex", strSelectedList);
	buttonCancel.setAttribute("type", "image");
	buttonCancel.setAttribute("src", "https://w3s.link/ipfs/QmXDnKVwexxbpReTBFUzX8htgWugSjJGmqCknP3ACnw8F4");
	buttonCancel.style.setProperty("vertical-align", "middle");
	buttonCancel.style.setProperty("margin-top", "0px");
	buttonCancel.style.setProperty("width", "20px");
	buttonCancel.style.setProperty("height", "20px");
	divListInfo.appendChild(buttonCancel);
	
	buttonCancel.addEventListener("click", onListCancelClick);

	updateIndividualPicValues();
}

function onListCancelClick(event)
{
	let strListTarget = event.target.getAttribute("listIndex");

	// Remove UI.
	document.getElementById(`divSelectedList${strListTarget}`).remove();

	// Remove corresponding pictures from list.
	let picValue = calcPicValue(strListTarget, false);

	// Update UI.
	document.getElementById("labelInputList").textContent = `独特照片总数: ${picValue[1]}`;
	updateIndividualPicValues();
}

function updateMainDisplay(passType, message)
{
	State.updatePassType(passType);

	if (passType != State.STATE_STOP || document.getElementById("sexyNoFap").checked)
	{
		if (passType === State.STATE_FINISH)
		{
			ImageManager.displayCumImage();
		}
		else
		{
			ImageManager.displayNextImage();
		}
	}
	else
	{
		ImageManager.displayNoImage();
	}
	
	if (!message)
	{
		document.getElementById("message").innerText = "";
		FlashManager.updateFlash(0);
		return;
	}
	
	document.getElementById("message").innerText = message.msg;
	
	var randBeatRate = message.beatRate;
	
	if (randBeatRate)
	{
		// Disable stroke control on cum phase if option was selected.
		if (document.getElementById("cbCumNoTick").checked && State.passType == State.STATE_FINISH)
		{
			FlashManager.setEnabled(false);
		}

		// Add or substract 20%
		randBeatRate += (Math.random() - 0.5) * randBeatRate * 0.4;
		
		FlashManager.updateFlash(randBeatRate);
	}
	else
	{
		FlashManager.updateFlash(0);
	}
}

function startGame()
{
	ImageManager.previousImages = [];

	let buttonStartGame = document.getElementById("buttonStartGame");

	buttonStartGame.value = "START";
	buttonStartGame.removeAttribute("disabled");
	buttonStartGame.classList.remove("disabled");
	
	document.getElementById("buttonSlideshowPrev").classList.add("disabled");
	document.getElementById("buttonSlideshowPrev").setAttribute("disabled", "disabled");

	document.getElementById("mainwrapper").classList.add(State.optionGameMode);

	Visuals.updateColors();

	ListManager.bookmarkedImages = {};

	// Part of the hack to fix the Notifs, get rid of this once a cleaner way is found.
	document.body.style.setProperty("height", "100%");
	
	if (State.optionGameMode == State.GAMEMODE_NORMAL)
	{
		GameModeNormal.startGame();
	}
	else if (State.optionGameMode == State.GAMEMODE_ENDURANCE)
	{
		GameModeEndurance.startGame();
	}
	else if (State.optionGameMode == State.GAMEMODE_SLIDESHOW)
	{
		GameModeSlideshow.startGame();
	}
}

function backToMenu()
{
	if (GameModeNormal.timeTracker)
	{
		GameModeNormal.timeTracker.disable();
		GameModeNormal.timeTracker = null;
	}

	if (GameModeEndurance.timeTracker)
	{
		GameModeEndurance.timeTracker.disable();
		GameModeEndurance.timeTracker = null;
	}

	FlashManager.updateFlash(0);
	ProgressBarManager.cancelProgress();
	ProgressBarManager.cancelSlideProgress();
	document.getElementById("mainwrapper").classList.value = "";
	ImageManager.displayNoImage();
	State.passType = "";
	State.muted = false;
	updateIndividualPicValues();

	// If the game was paused when exiting, restore the state to unpaused for the next game.
	if (ProgressBarManager.isPaused)
	{
		ProgressBarManager.togglePause();
		document.getElementById("buttonSlideshowPause").style.removeProperty("background-image");
	}

	// Part of the hack to fix the Notifs, get rid of this once a cleaner way is found.
	document.body.style.setProperty("height", "fit-content");

	// After exiting a game, if the player bookmarked pictures,
	// open the Bookmarked picture browser.
	if (Object.keys(ListManager.bookmarkedImages).length > 0)
	{
		ImageBrowser.viewBookmarkedImages();

		// Display a popup instructing the player on what to do.
		new Popup("您已将图片加入书签。现在您可以浏览这些图片并将它们添加到列表中。\r\n\
		退出浏览器后，您的书签将被丢弃。");
	}
}

function saveSettings()
{
	localStorage.setItem("nbEdgeDuration", document.getElementById("rangeEdgeDuration").value);
	localStorage.setItem("nbCumPercent", document.getElementById("cumPercent").value);
	localStorage.setItem("bStrokeControl", document.getElementById("optionStrokeControl").value);
	localStorage.setItem("bStrokeControlTick", document.getElementById("cbStrokeControlTick").checked);
	localStorage.setItem("bCumNoTick", document.getElementById("cbCumNoTick").checked);

	localStorage.setItem("bStopSteps", document.getElementById("cbStopSteps").checked);
	localStorage.setItem("bShowTimerMessages", document.getElementById("cbShowTimerMessages").checked);
	localStorage.setItem("sexyNoFap", document.getElementById("sexyNoFap").checked);
	localStorage.setItem("permaSlideshow", document.getElementById("permaSlideshow").checked);
	
	localStorage.setItem("strMood", document.getElementById("selectMood").value);
	
	localStorage.setItem("nbSlideshowMinSpeed", document.getElementById("nbSlideshowMinSpeed").value);
	localStorage.setItem("nbSlideshowMaxSpeed", document.getElementById("nbSlideshowMaxSpeed").value);

	localStorage.setItem("pictureChangeSpeed", document.getElementById("nbPictureChangeSpeed").value);
	localStorage.setItem("nbPictureChangeSpeedCum", document.getElementById("nbPictureChangeSpeedCum").value);
	
	localStorage.setItem("strFavUsername", document.getElementById("textfieldUsername").value);
	localStorage.setItem("nbMaxPicNum", document.getElementById("nbMaxPicNum").value);
	
	localStorage.setItem("strSearchQuery", document.getElementById("textfieldSearchQuery").value);
	localStorage.setItem("strTagsBlacklist", document.getElementById("textfieldTagsBlacklist").value);
	localStorage.setItem("nbSearchScore", document.getElementById("nbSearchScore").value);

	localStorage.setItem("nbStepSpeedGo", document.getElementById("rangeStepSpeedGo").value);
	localStorage.setItem("nbStepSpeedStop", document.getElementById("rangeStepSpeedStop").value);
	
	localStorage.setItem("cbFastQuality", document.getElementById("cbFastQuality").checked);

	localStorage.setItem("backgroundColorGo", document.getElementById("backgroundColorGo").value);
	localStorage.setItem("backgroundColorStop", document.getElementById("backgroundColorStop").value);

	localStorage.setItem("cbFinishStepMaxVibe", document.getElementById("cbFinishStepMaxVibe").checked);
}

function loadSettings()
{
	// Load last used character.
	var strSavedCharName = localStorage.getItem("strCharName");
	
	if (strSavedCharName)
	{
		strCharName = strSavedCharName;
	}
	
	updateCharacter();
	
	// Load blacklist
	var strJSONBlacklist = localStorage.getItem("blacklistedPicturesJSON");
	
	if (strJSONBlacklist)
	{
		try
		{
			blacklistedPictures = JSON.parse(strJSONBlacklist);

			// Updates the cache to be able to open e621 pages.
			ListManager.updateUrlToIdInfo(blacklistedPictures);
		}
		catch (e)
		{
			debugConsole.error("由于 JSON 解析错误，无法加载黑名单。");
		}
	}
	
	
	if (localStorage.getItem("nbEdgeDuration") != null)
	{
		document.getElementById("rangeEdgeDuration").value = localStorage.getItem("nbEdgeDuration");
	}
		
	if (localStorage.getItem("nbCumPercent") != null)
	{
		document.getElementById("cumPercent").value = localStorage.getItem("nbCumPercent");
	}
	
	if (localStorage.getItem("bStrokeControl") != null)
	{
		document.getElementById("optionStrokeControl").value = localStorage.getItem("bStrokeControl");
	}
	
	if (localStorage.getItem("bStrokeControlTick") != null)
	{
		document.getElementById("cbStrokeControlTick").checked = localStorage.getItem("bStrokeControlTick") == "true";
	}

	if (localStorage.getItem("bCumNoTick") != null)
	{
		document.getElementById("cbCumNoTick").checked = localStorage.getItem("bCumNoTick") == "true";
	}

	if (localStorage.getItem("bStopSteps") != null)
	{
		document.getElementById("cbStopSteps").checked = localStorage.getItem("bStopSteps") == "true";
	}

	if (localStorage.getItem("bShowTimerMessages") != null)
	{
		document.getElementById("cbShowTimerMessages").checked = localStorage.getItem("bShowTimerMessages") == "true";
	}

	if (localStorage.getItem("sexyNoFap") != null)
	{
		document.getElementById("sexyNoFap").checked = localStorage.getItem("sexyNoFap") == "true";
	}

	if (localStorage.getItem("permaSlideshow") != null)
	{
		document.getElementById("permaSlideshow").checked = localStorage.getItem("permaSlideshow") == "true";
	}
	
	if (localStorage.getItem("strMood") != null)
	{
		document.getElementById("selectMood").value = localStorage.getItem("strMood");
	}
	
	if (localStorage.getItem("nbSlideshowMinSpeed") != null)
	{
		document.getElementById("nbSlideshowMinSpeed").value = localStorage.getItem("nbSlideshowMinSpeed");
	}

	if (localStorage.getItem("pictureChangeSpeed") != null)
	{
		document.getElementById("nbPictureChangeSpeed").value = localStorage.getItem("pictureChangeSpeed");
	}

	if (localStorage.getItem("nbPictureChangeSpeedCum") != null)
	{
		document.getElementById("nbPictureChangeSpeedCum").value = localStorage.getItem("nbPictureChangeSpeedCum");
	}
	
	if (localStorage.getItem("nbSlideshowMaxSpeed") != null)
	{
		document.getElementById("nbSlideshowMaxSpeed").value = localStorage.getItem("nbSlideshowMaxSpeed");
	}
	
	if (localStorage.getItem("strFavUsername") != null)
	{
		document.getElementById("textfieldUsername").value = localStorage.getItem("strFavUsername");
	}
	
	if (localStorage.getItem("nbMaxPicNum") != null)
	{
		document.getElementById("nbMaxPicNum").value = localStorage.getItem("nbMaxPicNum");
	}
	
	if (localStorage.getItem("strSearchQuery") != null)
	{
		document.getElementById("textfieldSearchQuery").value = localStorage.getItem("strSearchQuery");
	}
	
	if (localStorage.getItem("strTagsBlacklist") != null)
	{
		document.getElementById("textfieldTagsBlacklist").value = localStorage.getItem("strTagsBlacklist");
	}
	
	if (localStorage.getItem("nbSearchScore") != null)
	{
		document.getElementById("nbSearchScore").value = localStorage.getItem("nbSearchScore");
	}

	if (localStorage.getItem("nbStepSpeedGo") != null)
	{
		document.getElementById("rangeStepSpeedGo").value = localStorage.getItem("nbStepSpeedGo");
	}

	if (localStorage.getItem("nbStepSpeedStop") != null)
	{
		document.getElementById("rangeStepSpeedStop").value = localStorage.getItem("nbStepSpeedStop");
	}

	if (localStorage.getItem("cbFastQuality") != null)
	{
		document.getElementById("cbFastQuality").checked = localStorage.getItem("cbFastQuality") == "true";
	}

	if (localStorage.getItem("backgroundColorGo") != null)
	{
		document.getElementById("backgroundColorGo").value = localStorage.getItem("backgroundColorGo");
	}

	if (localStorage.getItem("backgroundColorStop") != null)
	{
		document.getElementById("backgroundColorStop").value = localStorage.getItem("backgroundColorStop");
	}

	if (localStorage.getItem("cbFinishStepMaxVibe") != null)
	{
		document.getElementById("cbFinishStepMaxVibe").checked = localStorage.getItem("cbFinishStepMaxVibe") == "true";
	}

	if (localStorage.getItem("listsLedger"))
	{
		ListManager.lists = JSON.parse(localStorage.getItem("listsLedger"))
		let listName;
		let lists = Object.keys(ListManager.lists);

		for (let i = 0; i < lists.length; ++i)
		{
			listName = lists[i];
			
			// Updates the cache to be able to open e621 pages.
			ListManager.updateUrlToIdInfo(ListManager.lists[listName]);
			
			let tempElement = new Option;
			tempElement.value = listName;
			tempElement.textContent = listName;
			ListManager.appendNodes(tempElement);
		}
	}
}

function onKeyPressed(event)
{
	var key = event.key.toLowerCase();

	// Disable page navigation.
	if (key == "enter")
	{
		event.preventDefault();
		return;
	}
	
	if (State.passType !== "")
	{
		switch (key)
		{
			case "arrowright":
			case "d":
				document.getElementById("buttonSlideshowNext").click();
				break;
			case "arrowleft":
			case "a":
				document.getElementById("buttonSlideshowPrev").click();
				break;
			case "p":
				document.getElementById("buttonSlideshowPause").click();
				break;
			case "m":
				State.muted = !State.muted;
				break;
			case "b":
				document.getElementById("buttonImageAddToListGameText").click();
				break;
			case "x":
				document.getElementById("buttonBlacklistPicture").click();
				break;
			default:
				break;
		} 
	}
}

function onSwipe(event)
{
	if (State.passType === "")
	{
		// Not in game, do nothing.
		return;
	}

	switch (event.type)
	{
		case SwipeDetection.EVENT_SWIPE_LEFT:
			document.getElementById("buttonSlideshowNext").click();
			break;
		case SwipeDetection.EVENT_SWIPE_RIGHT:
			document.getElementById("buttonSlideshowPrev").click();
			break;
		case SwipeDetection.EVENT_SWIPE_UP:
			document.getElementById("buttonImageAddToListGameText").click();
			break;
		case SwipeDetection.EVENT_SWIPE_DOWN:
			document.getElementById("buttonBlacklistPicture").click();
			break;
		default:
			break;
	}
}


function onReady()
{
	document.getElementById("divVersion").textContent = `v${VERSION}`;

	// Set default blacklist as it is on e621.
	// Only for first time opening the game, it will get replaced if saved data is present.
	document.getElementById("textfieldTagsBlacklist").value = "gore feces urine scat watersports young loli shota";

	// Setup event handlers.
	document.getElementById("buttonShowShortcuts").addEventListener("click", () => {
		new Popup("右箭头键或D键：显示下一张图片。\r\n\
		左箭头键或A键：显示上一张图片。\r\n\
		B键：收藏或取消收藏图片。\r\n\
		X键：将图片列入黑名单。\r\n\
		P键：暂停或继续游戏。\r\n\
		M键：静音或取消静音滴答声。\r\n\
		\r\n\
		移动设备上的滑动操作：\r\n\
		向左滑：显示下一张图片。\r\n\
		向右滑：显示上一张图片。\r\n\
		向上滑：收藏或取消收藏图片。\r\n\
		向下滑：将图片列入黑名单。\r\n");
	});
	
	document.getElementById("buttonOwnPicHelp").addEventListener("click", () => {
		new Popup("游戏中将展示您在此处添加的文件夹中的图片。\r\n\
		若勾选'包含子文件夹'选项，添加文件夹时将扫描子文件夹。");
	});
	
	document.getElementById("buttonMaxPicNumHelp").addEventListener("click", () => {
		new Popup("这将获取指定用户最近收藏的图片，按收藏时间倒序排列。\r\n\
		加载大量图片可能需要一些时间。只要按钮显示'加载中...'，就表示还在继续加载更多图片。");
	});
	
	document.getElementById("buttonPicSizeHelp").addEventListener("click", () => {
		new Popup("这将加载较小版本的图片，提高下载速度。");
	});
	
	document.getElementById("buttonScoreThresholdHelp").addEventListener("click", () => {
		new Popup("分数低于输入值的图片将被忽略。");
	});
	
	document.getElementById("buttonSearchOrderHelp").addEventListener("click", () => {
		new Popup("选择首先加载哪些图片。\r\n\
		随机模式每次都会加载不同的图片。\r\n\
		热门模式会优先加载评分较高的图片。\r\n\
		近期模式会优先加载最新上传的图片。");
	});
	
	document.getElementById("buttonStrokeControlHelp").addEventListener("click", () => {
		new Popup("当您可以抚摸自己时，会显示一个闪烁的圆圈，指示您应当如何把握节奏。\r\n\
		勾选此项可为闪烁添加滴答声。");
	});
	
	document.getElementById("buttonCumHelp").addEventListener("click", () => {
		new Popup("这决定了您在会话结束时被允许释放的可能性。");
	});
	
	document.getElementById("buttonMoodHelp").addEventListener("click", () => {
		new Popup("在温柔模式下，您很快就会被允许释放，通常在一小时内。\r\n\
		在普通模式下，您可能需要坚持一到两个小时。\r\n\
		在魔鬼模式下，您可能需要长时间坚持才能获准释放，最坏情况下可能长达4小时。\r\n\
		\r\n\
		从温柔模式开始练习 " + strCharName + "随着技巧提升逐步挑战，看看您能否征服魔鬼模式。" + strCharName + "!");
	});
	
	document.getElementById("buttonDurationHelp").addEventListener("click", () => {
		new Popup("这设定了控射会话的平均持续时间。随机因素可能使其增加或减少20%。");
	});
	
	document.getElementById("buttonGameModeHelp").addEventListener("click", () => {
		new Popup("在控射模式下，您在抚摸和休息之间交替，直到会话结束时才知道是否被允许释放。\r\n\
		\r\n\
		在耐力模式下，您同样在抚摸和休息之间交替，但不知道需要坚持多久。会话可能持续很长时间，取决于所选模式。会话结束时您将被允许释放。\r\n\
		\r\n\
		在幻灯片模式下，选定的图片会随机连续显示，不会中断。");
	});
	
	document.getElementById("buttonCumPicHelp").addEventListener("click", () => {
		new Popup("您可以选择一张图片或动图，在被允许释放时显示。\r\n\
		输入图片的URL（也可使用'file://'访问本地图片），然后点击加载按钮。如果加载成功，您的图片应该会出现在下方。\r\n\
		如果您未选择释放图片，将随机显示上面选择的图片之一。");
	});

	document.getElementById("buttonStopStepsHelp").addEventListener("click", () => {
		new Popup("在控射和耐力模式下，步骤在抚摸和停止之间交替。禁用此选项可移除停止步骤。");
	});

	document.getElementById("buttonShowTimerMessagesHelp").addEventListener("click", () => {
		new Popup("在控射和耐力模式下，角色会偶尔告诉您已经玩了多长时间。");
	});

	document.getElementById("sexyNoFapHelp").addEventListener("click", () => {
		new Popup("在被告知停止抚摸的步骤中显示图片。");
	});

	document.getElementById("permaSlideshowHelp").addEventListener("click", () => {
		new Popup("当显示图片时，在控射和耐力模式下，图片会每隔一段时间更换。这对幻灯片模式无效。");
	});

	document.getElementById("buttonPictureChangeSpeedHelp").addEventListener("click", () => {
		new Popup("如果启用了'步骤内图片更换'选项，设置图片更换的间隔秒数。\r\n\
		使用在线图片时，最低速度限制为5秒。");
	});

	document.getElementById("buttonStepSpeedHelp").addEventListener("click", () => {
		new Popup("调节进度条快慢。大于1加速，小于1减速。");
	});

	document.getElementById("buttonButtplugConnectHelp").addEventListener("click", () => {
		new Popup("连接Intiface服务器，可操控已连接设备。\r\n\
		可选择连接同一机器上运行的Intiface（使用localhost地址），或使用IP:端口连接远程Intiface。");
	});

	document.getElementById("buttonButtplugVibratePowerHelp").addEventListener("click", () => {
		new Popup("游戏中校准设备动作。不同设备可执行不同动作。\r\n\
		使用'测试振动/旋转/摆动'按钮，测试游戏中各动作的最大功率。\r\n\
		使用'测试移动'按钮，根据您的设置，模拟游戏中设备在不同每秒节拍数（BPS）下的移动。");
	});

	document.getElementById("buttonHelpFinishStepMaxVibe").addEventListener("click", () => {
		new Popup("启用后，连接的设备将在高潮步骤中全功率振动、摆动和旋转（受上述功率校准选项限制）。\r\n\
		禁用后，连接的设备将如常规撸动步骤一样跟随撸动速度指示器。");
	});
	
	
	document.getElementById("rbGameModeNormal").addEventListener("change", onGameModeRadioClick);
	document.getElementById("rbGameModeEndurance").addEventListener("change", onGameModeRadioClick);
	document.getElementById("rbGameModeSlideshow").addEventListener("change", onGameModeRadioClick);
	
	document.getElementById("rbPicUseLocal").addEventListener("change", onUsePicturesRadioClick);
	document.getElementById("rbPicUseFavorites").addEventListener("change", onUsePicturesRadioClick);
	document.getElementById("rbPicUseSearch").addEventListener("change", onUsePicturesRadioClick);
	document.getElementById("rbPicUseList").addEventListener("change", onUsePicturesRadioClick);
	
	document.getElementById("inputFiles").addEventListener("click", onLocalPicturesFolderClick);
	
	let rangeEdgeDuration = new RangeControl(
		document.getElementById("rangeEdgeDuration"), 
		document.getElementById("buttonEdgeDurationMinus"), 
		document.getElementById("buttonEdgeDurationPlus")
	);
	rangeEdgeDuration.addEventListener("input", onEdgeDurationChange);

	let rangeCumPercent = new RangeControl(
		document.getElementById("cumPercent"), 
		document.getElementById("buttonCumPercentMinus"), 
		document.getElementById("buttonCumPercentPlus")
	);
	rangeCumPercent.addEventListener("input", onCumPercentChange);

	// Advanced options UI.

	// Steps speed.
	let rangeStepSpeedGo = new RangeControl(
		document.getElementById("rangeStepSpeedGo"), 
		document.getElementById("buttonStepSpeedGoMinus"), 
		document.getElementById("buttonStepSpeedGoPlus")
	);
	rangeStepSpeedGo.addEventListener("input", onStepSpeedGoChange);

	let rangeStepSpeedStop = new RangeControl(
		document.getElementById("rangeStepSpeedStop"), 
		document.getElementById("buttonStepSpeedStopMinus"), 
		document.getElementById("buttonStepSpeedStopPlus")
	);
	rangeStepSpeedStop.addEventListener("input", onStepSpeedStopChange);

	// Buttplug UI controls.
	document.getElementById("buttonButtplugConnect").addEventListener("click", onClickButtonButtplugConnect);
	document.getElementById("buttonButtplugDisconnect").addEventListener("click", onClickButtonButtplugDisconnect);
	document.getElementById("buttonButtplugVibrate").addEventListener("click", onClickButtonButtplugVibrate);
	document.getElementById("buttonButtplugOscillate").addEventListener("click", onClickButtonButtplugOscillate);
	document.getElementById("buttonButtplugRotate").addEventListener("click", onClickButtonButtplugRotate);
	document.getElementById("buttonButtplugConstrict").addEventListener("click", onClickButtonButtplugConstrict);
	document.getElementById("buttonButtplugMove").addEventListener("click", onClickButtonButtplugMove);

	let rangeVibratePower = new RangeControl(
		document.getElementById("rangeVibratePower"), 
		document.getElementById("buttonVibratePowerMinus"), 
		document.getElementById("buttonVibratePowerPlus")
	);
	rangeVibratePower.addEventListener("input", onVibratePowerChange);

	let rangeOscillatePower = new RangeControl(
		document.getElementById("rangeOscillatePower"), 
		document.getElementById("buttonOscillatePowerMinus"), 
		document.getElementById("buttonOscillatePowerPlus")
	);
	rangeOscillatePower.addEventListener("input", onOscillatePowerChange);

	let rangeRotatePower = new RangeControl(
		document.getElementById("rangeRotatePower"), 
		document.getElementById("buttonRotatePowerMinus"), 
		document.getElementById("buttonRotatePowerPlus")
	);
	rangeRotatePower.addEventListener("input", onRotatePowerChange);

	let rangeMoveSpeedMin = new RangeControl(
		document.getElementById("rangeMoveSpeedMin"), 
		document.getElementById("buttonMoveSpeedMinMinus"), 
		document.getElementById("buttonMoveSpeedMinPlus")
	);
	rangeMoveSpeedMin.addEventListener("input", onMoveSpeedMinChange);

	let rangeMoveSpeedMax = new RangeControl(
		document.getElementById("rangeMoveSpeedMax"), 
		document.getElementById("buttonMoveSpeedMaxMinus"), 
		document.getElementById("buttonMoveSpeedMaxPlus")
	);
	rangeMoveSpeedMax.addEventListener("input", onMoveSpeedMaxChange);

	let rangeMoveLength = new RangeControl(
		document.getElementById("rangeMoveLength"), 
		document.getElementById("buttonMoveLengthMinus"), 
		document.getElementById("buttonMoveLengthPlus")
	);
	rangeMoveLength.addEventListener("input", onMoveLengthChange);

	document.getElementById("cbButtplugConstrict").addEventListener("change", onConstrictChange);

	
	document.getElementById("buttonSlideshowBackToMenu").addEventListener("click", backToMenu);
	document.getElementById("buttonSlideshowPause").addEventListener("click", onClickPause);
	document.getElementById("buttonSlideshowNext").addEventListener("click", onClickNext);
	document.getElementById("buttonSlideshowPrev").addEventListener("click", onClickPrev);
	document.getElementById("buttonSlideshowView").addEventListener("click", onClickView);
	document.getElementById("buttonBlacklistPicture").addEventListener("click", onClickBlacklist);
	
	document.getElementById("buttonShowRules").addEventListener("click", onClickShowRules);
	document.getElementById("rulesText").style.setProperty("display", "none");
	
	document.getElementById("buttonShowCredits").addEventListener("click", onClickCredits);
	document.getElementById("creditsSection").style.setProperty("display", "none");

	document.getElementById("buttonShowAdvancedOptions").addEventListener("click", onClickAdvancedOptions);
	document.getElementById("buttonExitAdvancedOptions").addEventListener("click", onExitAdvancedOptions);
	document.getElementById("advancedOptionsWrapper").style.setProperty("display", "none");

	document.getElementById("buttonEditLists").addEventListener("click", onClickEditLists);
	document.getElementById("buttonExitListEditor").addEventListener("click", onExitListsEditor);
	document.getElementById("listsWrapper").style.setProperty("display", "none");

	document.getElementById("buttonEditBlacklist").addEventListener("click", ImageBrowser.editBlacklist);
	document.getElementById("buttonCreateNewList").addEventListener("click", ListManager.createNewList);
	document.getElementById("buttonDeleteSelectedList").addEventListener("click", ListManager.deleteList);
	document.getElementById("buttonEditSelectedList").addEventListener("click", ListManager.editList);
	document.getElementById("imageBrowser").style.setProperty("display", "none");
	document.getElementById("newListNameField").style.setProperty("display", "none");
	
	document.getElementById("buttonGridNextPage").addEventListener("click", ImageBrowser.nextPage)
	document.getElementById("buttonGridPrevPage").addEventListener("click", ImageBrowser.prevPage)
	document.getElementById("buttonExitGrid").addEventListener("click", ImageBrowser.hideImageGrid)
	document.getElementById("bigImageViewer").style.setProperty("display", "none");
	document.getElementById("browserListOfListsSelector").addEventListener("change", ListManager.checkAddedBrowserLists);

	document.getElementById("buttonBigImagePrev").addEventListener("click", ImageBrowser.displayPrev);
	document.getElementById("buttonBigImageNext").addEventListener("click", ImageBrowser.displayNext);
	document.getElementById("buttonBigImageRemoveList").addEventListener("click", ImageBrowser.removeList);
	document.getElementById("buttonBigImageBlacklist").addEventListener("click", ImageBrowser.blacklist);
	document.getElementById("buttonBigImageExit").addEventListener("click", ImageBrowser.bigImageExit);

	document.getElementById("buttonImageAddToListGameText").addEventListener("click", ListManager.bookmarkImage);
	document.getElementById("buttonExportSelectedList").addEventListener("click", ListManager.exportList);
	document.getElementById("fileSelectorListImport").addEventListener("change", (event) => {ListManager.getFileData(event.target.files[0]);});
	document.getElementById("buttonImportNewList").addEventListener("click", ListManager.importList);
	document.getElementById("buttonImportNewList").setAttribute("disabled", "disabled");
	document.getElementById("buttonImportNewList").classList.add("disabled");

	document.getElementById("browserButtonImageAddToListNew").addEventListener("click", onNewBrowserList);
	document.getElementById("buttonImageViewerViewE6").addEventListener("click", onImageViewerViewE6);
	document.getElementById("buttonImageAddToListBrowserText").addEventListener("click", onBrowserAddToList);
	document.getElementById("browserButtonExpandListSelectors").addEventListener("click", onExpandBrowserSelectors);
	document.getElementById("browserButtonExpandListSelectors").style.setProperty("display", "none");
	document.getElementById("browserExtensionWrapper").style.setProperty("display", "none");

	document.getElementById("buttonImageAddToListGameText").style.setProperty("margin-right", "0px");
	document.getElementById("buttonImageAddToListGameText").style.setProperty("margin-left", "0px");


	document.getElementById("backgroundColorGo").addEventListener("change", onBackgroundColorChange);
	document.getElementById("backgroundColorStop").addEventListener("change", onBackgroundColorChange);
	document.getElementById("buttonLoadList").addEventListener("click", onClickLoadList);
	document.getElementById("buttonEditTrainer").addEventListener("click", onClickEditTrainer);
	document.getElementById("exitTrainerOptions").addEventListener("click", onClickExitTrainer);

	
	document.getElementById("buttonLoadFavorites").addEventListener("click", onLoadFavoritesClick);
	document.getElementById("buttonLoadSearch").addEventListener("click", onLoadSearchClick);
	document.getElementById("buttonDisplayImages").addEventListener("click", onDisplayImagesClick);
	document.getElementById("buttonLoadCumPic").addEventListener("click", onLoadCumPicClick);
	document.getElementById("buttonCancelCumPic").addEventListener("click", onCancelCumPicClick);
	
	document.getElementById("buttonSetCharMale").addEventListener("click", onSetCharMaleClick);
	document.getElementById("buttonSetCharFemale").addEventListener("click", onSetCharFemaleClick);
	
	document.getElementById("imgCumPic").addEventListener("load", onCumPicLoaded);
	document.getElementById("imgCumPic").addEventListener("error", onCumPicLoadError);
	
	document.getElementById("imgCumPic").style.setProperty("display", "none");
	document.getElementById("buttonCancelCumPic").style.setProperty("display", "none");

	// Check if we are running on Electron (Desktop).
	if (typeof electronApi == "undefined")
	{
		// When using Electron, open links in the native browser instead of the app.
		function onElectronLinkClick(event)
		{
			var imgPageUrl = event.target.href;
			window.open(imgPageUrl, "_blank");
		
			// Prevent the page from changing.
			return false;
		}
	
		// Attach the handler to all hardcoded links.
		let elements = document.getElementsByTagName("a");
		for (var i = 0; i < elements.length; ++i)
		{
		  	elements[i].onclick = onElectronLinkClick;
		}
	}
	else
	{
		// Disable Local pictures if not using Electron.
		document.getElementById("labelRbPicUseLocal").style.color = "grey";
	
		document.getElementById("rbPicUseLocal").addEventListener("click", () => {
			NotifMessage.displayError("此平台不支持本地图片功能。");
			document.getElementById("rbPicUseLocal").checked = true;
		});
	}
	
	document.getElementById("buttonStartGame").addEventListener("click", () => {
		State.applySettings();
		
		// Check a gamemode was selected.
		if (!State.optionGameMode)
		{
			NotifMessage.displayError("请选择游戏模式以开始游戏。");
			return;
		}

		if (document.getElementById("rbPicUseLocal").checked)
		{
			ListManager.localList = true;

			let buttonImageAddToListGameText = document.getElementById("buttonImageAddToListGameText");
			buttonImageAddToListGameText.value = "本地图片已禁用";
			buttonImageAddToListGameText.setAttribute("enabled", "enabled");
			buttonImageAddToListGameText.classList.add("enabled");
		}
		else
		{
			ListManager.localList = false;
		}
		
		saveSettings();
		initializePictures();
	});
	
	// Capture key presses to allow keyboard control.
	document.body.addEventListener("keyup", onKeyPressed);

	loadSettings();
	
	// Update anything settings might have changed.
	onGameModeRadioClick();
	onUsePicturesRadioClick();
	onCumPercentChange();
	onEdgeDurationChange();
	onStepSpeedGoChange();
	onStepSpeedStopChange();
	onVibratePowerChange();
	onOscillatePowerChange();
	onRotatePowerChange();
	onMoveSpeedMinChange();
	onMoveLengthChange();
	onConstrictChange();
	onBackgroundColorChange();

	isPageLoaded = true;

	// Remove the loading screen and show the main screen.
	document.getElementById("divLoading").style.setProperty("display", "none");
	document.getElementById("mainwrapper").style.removeProperty("display");

	
	// Warning popup upon pressing "back" on mobile.
	document.addEventListener("backbutton", function ()
	{
		let popup = new Popup("确定要退出吗？");
		popup.addOption("是的", () => { navigator["app"].exitApp(); } );
		popup.addOption("不");
	} , false);

	// Patches up an issue with Notifications placement.
	window.addEventListener("resize", () => {document.getElementById("divNotificationContainer").style.setProperty("height", `${window.innerHeight}px`);})
	document.getElementById("divNotificationContainer").style.setProperty("height", `${window.innerHeight}px`);
	
	// Set swipe motion event handlers.
	SwipeDetection.addEventListener(SwipeDetection.EVENT_SWIPE_RIGHT, onSwipe);
	SwipeDetection.addEventListener(SwipeDetection.EVENT_SWIPE_LEFT, onSwipe);
	SwipeDetection.addEventListener(SwipeDetection.EVENT_SWIPE_UP, onSwipe);
	SwipeDetection.addEventListener(SwipeDetection.EVENT_SWIPE_DOWN, onSwipe);
}

// Start the initialization once the page is ready.
if (document.readyState === "loading")
{
	document.addEventListener("DOMContentLoaded", onReady);
}
else
{
	onReady();
}
