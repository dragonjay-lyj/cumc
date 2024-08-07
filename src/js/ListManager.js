var ListManager = {
	selectorArray: ["listOfListsSelector", "importListOfListsSelector", "exportListOfListsSelector", "picUseListSelector", "browserListOfListsSelector"],
	lists: {},
	bookmarkedImages: {},
	deleteCount: 0,

	createNewList: function()
	{
		if (!document.getElementById("newListNameField").classList.contains("new"))
		{
			document.getElementById("newListNameField").style.removeProperty("display");
			document.getElementById("newListNameField").classList.add("new");
			document.getElementById("buttonCreateNewList").value = "Submit";
			document.getElementById("newListNameField").focus();
		}
		else if (document.getElementById("newListNameField").value.trim() !== "")
		{
			ListManager.initializeNewList(document.getElementById("newListNameField").value.trim());
			document.getElementById("newListNameField").style.setProperty("display", "none");
			document.getElementById("newListNameField").classList.remove("new");
			document.getElementById("newListNameField").value = "";
			document.getElementById("buttonCreateNewList").value = "Create New List";
		}
		else
		{
			document.getElementById("newListNameField").style.setProperty("display", "none");
			document.getElementById("newListNameField").classList.remove("new");
			document.getElementById("buttonCreateNewList").value = "Create New List";
		}
	},

	initializeNewList: function(listName)
	{
		if (ListManager.lists[listName.toString()])
		{
			NotifMessage.displayWarning("该名称的列表已经存在。请选择其他名称。");
			return;
		}

		if (listName.toString().toLowerCase() == "new list")
		{
			NotifMessage.displayError("'新名单 '是保留的名单名称。请选择其他名称。");
			return;
		}

		ListManager.lists[listName.toString()] = {};

		let tempElement = new Option;
		tempElement.value = listName;
		tempElement.textContent = listName;
		ListManager.appendNodes(tempElement);

		localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));
	},

	editList: function()
	{
		if (ListManager.deleteCount != 0)
		{
			document.getElementById("buttonEditSelectedList").value = "编辑选定列表";
			document.getElementById("buttonDeleteSelectedList").value = "删除所选列表";
			ListManager.deleteCount = 0;
		}
		else
		{
			ImageBrowser.editList(document.getElementById("listOfListsSelector").value);
		}
	},

	deleteList: function()
	{
		if (ListManager.deleteCount == 0)
		{
			document.getElementById("buttonDeleteSelectedList").value = "Confirm";
			document.getElementById("buttonEditSelectedList").value = "Cancel";
			++ListManager.deleteCount;
		}
		else
		{
			delete ListManager.lists[document.getElementById("listOfListsSelector").value];
			ListManager.updateDefaultLists(document.getElementById("listOfListsSelector").value);
			document.getElementById("listOfListsSelector").remove(document.getElementById("listOfListsSelector").selectedIndex);
			document.getElementById("buttonEditSelectedList").value="编辑选定列表";
			document.getElementById("buttonDeleteSelectedList").value="删除所选列表";
			ListManager.deleteCount = 0;
			localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));
		}
	},

	updateDefaultLists: function(value)
	{
		for (let i = 0; i < document.getElementById("exportListOfListsSelector").children.length; ++i)
		{
			if (value == document.getElementById("exportListOfListsSelector").children[i].value)
			{
				document.getElementById("exportListOfListsSelector").children[i].remove();
			}
		}

		for (let i = 0; i < document.getElementById("importListOfListsSelector").children.length; ++i)
		{
			if (value == document.getElementById("importListOfListsSelector").children[i].value)
			{
				document.getElementById("importListOfListsSelector").children[i].remove();
			}
		}

		for (let i = 0; i < document.getElementById("browserListOfListsSelector").children.length; ++i)
		{
			if (value == document.getElementById("browserListOfListsSelector").children[i].value)
			{
				document.getElementById("browserListOfListsSelector").children[i].remove();
			}
		}

		for (let i = 0; i < document.getElementById("picUseListSelector").children.length; ++i)
		{
			if (value == document.getElementById("picUseListSelector").children[i].value)
			{
				document.getElementById("picUseListSelector").children[i].remove();
			}
		}
	},

	bookmarkImage: function()
	{
		let srcElement;

		if (window.getComputedStyle(ImageManager.imageContainer).display == "none")
		{
			srcElement = ImageManager.imageContainerPreload;
		}
		else
		{
			srcElement = ImageManager.imageContainer;
		}
		
		if (typeof ListManager.bookmarkedImages[srcElement.src] == "object")
		{
			delete ListManager.bookmarkedImages[srcElement.src]
			document.getElementById("buttonImageAddToListGameText").style.backgroundImage = "";
		}
		else
		{
			ListManager.bookmarkedImages[srcElement.src] = { id: arrImgIdByUrl[srcElement.src], url: srcElement.src };
			document.getElementById("buttonImageAddToListGameText").style.backgroundImage = "linear-gradient(rgb(4, 2, 4) 0px, rgb(61, 21, 100) 100%)";
		}
	},

	addToList: function()
	{
		if (!State.expanded)
		{
			if (!ProgressBarManager.isPaused)
			{
				onClickPause();
				State.notPuasedWhenOpened = true;
			}

			State.expanded = !State.expanded;

			if (document.getElementById("gameListOfListsSelector").classList.contains("containsCurrentImage"))
			{
				document.getElementById("buttonImageAddToListGameText").value = "Already in";
				document.getElementById("buttonImageAddToListGameText").setAttribute("disabled", "disabled");
				document.getElementById("buttonImageAddToListGameText").classList.add("disabled");
			}
			else
			{
				document.getElementById("buttonImageAddToListGameText").value = "Add to list";
				document.getElementById("buttonImageAddToListGameText").removeAttribute("disabled");
				document.getElementById("buttonImageAddToListGameText").classList.remove("disabled");
			}

			document.getElementById("buttonExpandListSelectors").style.removeProperty("display");
			document.getElementById("gameExtensionWrapper").style.setProperty("display", "flex");
			return;
		}

		if (!State.newGameList)
		{
			let srcElement;

			if (window.getComputedStyle(ImageManager.imageContainer).display == "none")
			{
				srcElement=ImageManager.imageContainerPreload;
			}
			else
			{
				srcElement=ImageManager.imageContainer;
			}

			ListManager.lists[document.getElementById("gameListOfListsSelector").value][srcElement.src] = { id: arrImgIdByUrl[srcElement.src], url: srcElement.src };
			document.getElementById("gameExtensionWrapper").style.setProperty("display", "none");
			document.getElementById("buttonExpandListSelectors").style.setProperty("display", "none");

			if (ProgressBarManager.isPaused && State.notPuasedWhenOpened)
			{
				onClickPause();
			}

			State.notPuasedWhenOpened = false;
			State.expanded = !State.expanded;

			localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));

			if (gameListPictures.lists[document.getElementById("gameListOfListsSelector").value])
			{
				if (!gameListPictures[srcElement.src] >= 1)
				{
					gameListPictures[srcElement.src] = 1;
					document.getElementById("labelInputList").textContent = "Total Unique Pics: " + (Object.keys(gameListPictures).length - 1);
				}
				else
				{
					gameListPictures[srcElement.src] += 1;
				}
			}

			ListManager.checkAddedLists();
		}
	},

	checkAddedBrowserLists: function()
	{
		let nodeListContainsCurrentImage = document.querySelectorAll("#browserListOfListsSelector.containsCurrentImage");
		for (let i = 0; i < nodeListContainsCurrentImage.length; ++i)
		{
			nodeListContainsCurrentImage[i].style.removeProperty("background-color");
			nodeListContainsCurrentImage[i].style.removeProperty("color");
		}

		nodeListContainsCurrentImage = document.querySelectorAll("option.containsCurrentImage");
		for (let i = 0; i < nodeListContainsCurrentImage.length; ++i)
		{
			nodeListContainsCurrentImage[i].style.removeProperty("background-color");
			nodeListContainsCurrentImage[i].style.removeProperty("color");
		}

		let keys = document.getElementById("browserListOfListsSelector").children;
		let srcElement = document.getElementById("bigImageSrcHolder");
		let src = srcElement.src;
		
		for (let i = 0; i < keys.length; ++i)
		{
			if (ListManager.lists[keys[i].value][src] != null && ListManager.lists[keys[i].value][src] != undefined)
			{
				document.getElementById("browserListOfListsSelector").children[i].classList.add("containsCurrentImage");
			}
			else
			{
				document.getElementById("browserListOfListsSelector").children[i].classList.remove("containsCurrentImage");
			}
		}

		try
		{
			if (ListManager.lists[document.getElementById("browserListOfListsSelector").value][src] != null && ListManager.lists[document.getElementById("browserListOfListsSelector").value][src] != undefined)
			{
				document.getElementById("browserListOfListsSelector").classList.add("containsCurrentImage")
			}
			else
			{
				document.getElementById("browserListOfListsSelector").classList.remove("containsCurrentImage")
			}
		}
		catch (error)
		{
			console.error(error);
		}

		nodeListContainsCurrentImage = document.querySelectorAll("#browserListOfListsSelector.containsCurrentImage");
		for (let i = 0; i < nodeListContainsCurrentImage.length; ++i)
		{
			nodeListContainsCurrentImage[i].style.setProperty("background-color", Visuals.hexNumToString(Visuals.progressColor.go));
			
			// Fix for invisible list name when managing bookmarked pics after slideshow mode.
			// Caused by code setting colour to invisible for bar text in slideshow mode.
			nodeListContainsCurrentImage[i].style.setProperty("color", Visuals.hexNumToString(Visuals.invertTextColor(Visuals.progressColor.go)));
		}

		let buttonImageAddToListBrowserText = document.getElementById("buttonImageAddToListBrowserText");

		if (document.getElementById("browserListOfListsSelector").classList.contains("containsCurrentImage")&&State.expandedBrowser)
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

		nodeListContainsCurrentImage = document.querySelectorAll("option.containsCurrentImage");
		for (let i = 0; i < nodeListContainsCurrentImage.length; ++i)
		{
			nodeListContainsCurrentImage[i].style.setProperty("background-color", Visuals.hexNumToString(Visuals.progressColor.go));
			nodeListContainsCurrentImage[i].style.setProperty("color", Visuals.hexNumToString(Visuals.textColor.go));
		}
	},

	exportList: function()
	{
		let selectedList = document.getElementById("exportListOfListsSelector").value;
		let list = ListManager.lists[selectedList];
		let keys = Object.keys(list);
		let data = [];

		for (let i = 0; i < keys.length; ++i)
		{
			// Local pictures are filtered out. Only e621 image names are inserted.
			if (keys[i].substring(0, E621_IMAGES_URL.length) == E621_IMAGES_URL)
			{
				// Try getting the picture's id, if not found default to 0.
				let id = arrImgIdByUrl[keys[i]] || 0;

				let imageData = {
					fileName: keys[i].substring(keys[i].lastIndexOf("/") + 1),
					id: id
				};

				data.push(imageData);
			}
		}

		// APK specific file download code.
		if (window.cordova && cordova.platformId !== "browser")
		{
			// Let's create a blob for the plugin and title it.
			let blob = new Blob([JSON.stringify(data)]);
			let fileName = selectedList + ".list";
			
			// Save plugin, and after show user message that states it was saved
			cordova.plugins.saveDialog.saveFile(blob, fileName);

			return;
		}

		// Regular file download.
		State.fileSet = true;
		ListManager.file = new File([JSON.stringify(data)], selectedList + ".list", { type: "text/plain" });
		ListManager.download();
	},

	importList: function()
	{
		if (ListManager.listToImport == null)
		{
			document.getElementById("buttonImportNewList").setAttribute("disabled", "disabled");
			document.getElementById("buttonImportNewList").classList.add("disabled");
			return;
		}
		
		let selectedList = document.getElementById("importListOfListsSelector").value;
		if (selectedList == "New List")
		{
			let strFileSelectorListImport = document.getElementById("fileSelectorListImport").value;
			let indexStartFilename = strFileSelectorListImport.lastIndexOf("\\") + 1;
			selectedList = strFileSelectorListImport.substring(indexStartFilename,(strFileSelectorListImport.length - 5));
			
			if (selectedList.toLowerCase() == "new list")
			{
				NotifMessage.displayError("'新列表 '是保留的列表名称。请重新命名您要导入的文件，或导入到现有列表中。");
				return;
			}
			else if(!ListManager.lists[selectedList])
			{
				ListManager.initializeNewList(selectedList);
			}
			else
			{
				NotifMessage.displayError("文件名与现有列表匹配。放弃导入。请使用 '创建新列表 '按钮创建新列表并导入到该列表。");
				return;
			}
		}

		let list = ListManager.lists[selectedList];
		let check;
		let countImported = 0;
		let countBlacklisted = 0;

		// Data is in format
		// [{fileName: "name.ext", id: 1}, {...}]
		let data = JSON.parse(ListManager.listToImport);
		
		for (let i = 0; i < data.length; ++i)
		{
			check = false;

			// Check data is valid.
			if (typeof data[i] !== "object")
			{
				if (typeof data[i] == "string")
				{
					check = true;
				}
				else
				{
					debugConsole.warn("导入列表中的格式错误，跳过条目: " + data[i]);
					continue;
				}
			}

			let strFullFileName = check ? data[i] : data[i].fileName;
			let id = check ? null : data[i].id;

			if (typeof strFullFileName !== "string" || (typeof id !== "number" && typeof id !== Object && id !== null))
			{
				debugConsole.warn("导入列表中的格式错误，跳过条目: " + data[i]);
				continue;
			}

			let arrFileNameSegments = strFullFileName.split(".");
			if (arrFileNameSegments.length !== 2)
			{
				debugConsole.warn("导入列表中的格式错误，跳过条目: " + data[i]);
				continue;
			}

			let strFileExt = arrFileNameSegments[1].toUpperCase();
			if (strFileExt !== "JPG"
				&& strFileExt !== "JPEG"
				&& strFileExt !== "PNG"
				&& strFileExt !== "GIF"
				&& strFileExt !== "BMP"
				&& strFileExt !== "WEBP")
			{
				debugConsole.warn("导入列表中的格式错误，跳过条目: " + data[i]);
				continue;
			}

			// Data is valid, add entry to the list if not present in the blacklist.
			let url= ListManager.constructURL(strFullFileName);

			// Only add if it is not in the blacklist.
			if (typeof blacklistedPictures[url] === 'undefined')
			{
				++countImported;
				list[url] = {url: url, id: id};
			}
			else
			{
				// Count the blacklisted entry.
				++countBlacklisted;
			}
		}

		let strMessage = `Imported ${countImported}  pictures to list ${selectedList}`;

		if (countBlacklisted)
		{
			strMessage += ` (${countBlacklisted} 使用黑名单过滤掉)`;
		}

		NotifMessage.display(strMessage);

		localStorage.setItem("listsLedger", JSON.stringify(ListManager.lists));
	},

	download: function()
	{
		if (ListManager.file == null && State.fileSet != true)
		{
			return;
		}

		let link = document.createElement("a");
		let url = URL.createObjectURL(ListManager.file);
		
		link.href = url;
		link.download = ListManager.file.name;
		document.body.appendChild(link);
		link.click();
		
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);

		ListManager.file = null;
		State.fileSet = false;
	},

	constructURL: function(data)
	{
		return `${E621_IMAGES_URL}data/${data.substring(0,2)}/${data.substring(2,4)}/${data}`;
	},

	getFileData: function(file)
	{
		try
		{
			let importListreader = new FileReader();

			importListreader.addEventListener("load", (event) => {
				ListManager.listToImport = event.target.result;
				document.getElementById("buttonImportNewList").removeAttribute("disabled");
				document.getElementById("buttonImportNewList").classList.remove("disabled");
			});

			if (file.type && !file.type.startsWith("text/"))
			{
				debugConsole.log("文件不是图像。", file.type, file);
				return;
			}

			importListreader.readAsText(file);
		}
		catch (error)
		{
			document.getElementById("buttonImportNewList").setAttribute("disabled", "disabled");
			document.getElementById("buttonImportNewList").classList.add("disabled");
			ListManager.listToImport = null;
			debugConsole.log(error);
		}
	},

	updateUrlToIdInfo: function(list)
	{
		let listKeys = Object.keys(list);

		// Fill the e621 URL to ID info.
		listKeys.forEach(url => {
			if (url.substring(0, E621_IMAGES_URL.length) === E621_IMAGES_URL)
			{
				let value = list[url];

				// Expected format of value:
				// {url: "x", id: 1}
				if (typeof value === "object" && value.id)
				{
					arrImgIdByUrl[url] = value.id;
				}
			}
		});
	},

	appendNodes: function (node)
	{
		//This is a function to add the selector nodes to the DOM.
		for (let i = 0; i < ListManager.selectorArray.length; ++i)
		{
			node = document.getElementById(ListManager.selectorArray[i]).appendChild(node).cloneNode(true);
		}
	}
};
