import { Sortable, Swap } from "sortablejs";
Sortable.mount(new Swap());
import optionsStorage from "./options-storage.js";

async function getBoard () {
	const savedBoard = JSON.parse(localStorage.getItem('nyt-connections-beta'))?.savedBoard
	await console.log({savedBoard});
	return savedBoard;
}
async function saveBoard (newBoard) {
	const stringBoard = JSON.stringify(newBoard);
	return localStorage.setItem('nyt-connections-beta', stringBoard);
}

console.log("💈 Content script loaded for", chrome.runtime.getManifest().name);
async function init() {
	const options = await optionsStorage.getAll();
	const color =
		"rgb(" +
		options.colorRed +
		", " +
		options.colorGreen +
		"," +
		options.colorBlue +
		")";
	// const text = options.text;
	// const notice = document.createElement("div");
	// notice.innerHTML = text;
	// document.body.prepend(notice);
	// notice.id = "text-notice";
	// notice.style.border = "2px solid " + color;
	// notice.style.color = color;

	const targetNode = document.getElementById("board");

	const config = {
		attributes: true,
		childList: true,
		characterData: true,
	};

	const callback = (mutations) => {
		mutations.forEach(async (mutation) => {
			console.log({mutation, length: mutation.target.childNodes.length})
			if (mutation.type === "childList" && mutation.target.childNodes.length === 4) {
				console.log('dom changed', {saveBoard: await getBoard()});
				targetNode.querySelectorAll("[id^=row-]").forEach((row) => {
                    row.querySelectorAll('.item').forEach((rowItem) => {
						if (!rowItem.querySelector('.enyt-handle')) {
							const n = document.createElement("a");
							n.classList.add("enyt-handle");
							n.setAttribute("href", `#`);
							n.addEventListener('mousedown', (e) => {
								console.log('mousedown on handle')
								e.preventDefault(); 
								// e.stopImmediatePropagation();
								// e.stopPropagation();
							});
							n.addEventListener('click', (e) => {
								console.log('click on handle')
								e.preventDefault(); 
								e.stopImmediatePropagation();
								e.stopPropagation();
							});
							rowItem.appendChild(n);

							console.log('binding');
							rowItem.addEventListener('mousedown', (e) => {
								debugger;
								console.log('mousedown!', e)
								e.preventDefault();
								e.stopImmediatePropagation();
							})
						}
					});
				});
				Sortable.create(targetNode, {
					swap: true,
					delay: 0, // time in milliseconds to define when the sorting should start
					group: "shared",
					handle: ".enyt-handle",  // Drag handle selector within list items
					animation: 150,
					ghostClass: "dragging",
					draggable: ".item",

					forceFallback: true,  // ignore the HTML5 DnD behaviour and force the fallback to kick in
					// fallbackClass: "sortable-fallback",  // Class name for the cloned DOM Element when using forceFallback
					fallbackOnBody: true,  // Appends the cloned DOM Element into the Document's Body
					fallbackTolerance: 0, // Specify in pixels how far the mouse should move before it's considered as a drag.

					onStart: function (evt) {
						debugger;
						console.log("dragstart", evt.oldIndex);
						evt.stopImmediatePropagation();
					},
				});
			} else {
				console.log({type: mutation.type});
			}
		});
	};

	const observer = new MutationObserver(callback);

	observer.observe(targetNode, config);
}
window.init = init;
init();
