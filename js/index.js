const mods = [
  { name: "life（添加生命值系统）", path: "./InfoCo-Dino/mod/life.js" },
  { name: "gp（添加防御与反击功能）", path: "./InfoCo-Dino/mod/gp.js" },
  { name: "gauge（显示MP、HP条和buff时间）", path: "./InfoCo-Dino/mod/gauge.js" },
  { name: "chart（游戏结束显示统计数据）", path: "./InfoCo-Dino/mod/chart.js" },
  { name: "casting（显示技能蓄力条和CD）", path: "./InfoCo-Dino/mod/casting.js" },
  { name: "texteffect（短暂显示文本效果）", path: "./InfoCo-Dino/mod/texteffect.js" },
  { name: "score（自定义分数奖励）", path: "./InfoCo-Dino/mod/score.js" },
  { name: "infinity_jump（空中多段跳跃）", path: "./InfoCo-Dino/mod/infinity_jump.js" },
];

/*
let devtoolsEndpoint;
function fetchDevtoolsEndpoint() {
  fetch("/proxy/json", {
    method: "GET",
  })
    .then((response) =>
      response.ok
        ? response
        : Promise.reject(
            "ERROR: Cannot connect to Chrome Devtools Protocol port 9222. You need to start Chrome with arg: --remote-debugging-port=9222"
          )
    )
    .then((response) => response.json())
    .then((result) => {
      const dinoPageUrl = result.find((page) => page.title === document.title).length !== 0
        ? result.find((page) => page.title === document.title)
            .webSocketDebuggerUrl.substring(19)
        : Promise.reject(
            "Cannot attach to dino page in Chrome Devtools Protocol. Please try again."
          );
      // document.getElementsByClassName(
      //   "devtools"
      // )[0].childNodes[0].src = `./lib/devtools/devtools_app.html?ws=localhost:9222${dinoPageUrl}`;
      window.open(`./lib/devtools/devtools_app.html?ws=localhost:9222${dinoPageUrl}`, "Devtools", "popup, width=800, height=600");
    })
    .catch((error) => {
      document.getElementsByClassName("taskbar")[0].innerHTML = `
      <div
        style="
          width: 100%;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d32f2f;
        "
      >
        <h>${error}</h>
      </div>
      `;
    });
}
*/

const WindowManager = new (class {
  windowList;
  Monaco;
  monacoList;

  constructor() {
    this.windowList = [];
    this.monacoList = {};
  }

  initalizeMonaco() {
    require.config({ paths: { vs: "/lib/vs" } });
    require(["vs/editor/editor.main"], () => {
      this.Monaco = monaco;
    });
  }

  bringToFront(windowId) {
    document.getElementById(windowId).style.display = "block";
    document
      .getElementById(`${windowId}~app`)
      .setAttribute("data-active", "true");
    this.windowList = this.windowList.filter((window) => window !== windowId);
    this.windowList.unshift(windowId);
    this.windowList.forEach((window, index) => {
      document.getElementById(window).style.zIndex =
        this.windowList.length - index;
    });
  }

  registerWindow(windowId) {
    document.getElementById(windowId).addEventListener("mousedown", () => {
      this.bringToFront(windowId);
    });
    this.windowList.push(windowId);
    this.createTaskbarApp(windowId);
  }

  unregisterWindow(windowId) {
    this.windowList = this.windowList.filter((window) => window !== windowId);
    document.getElementById(windowId).remove();
    document.getElementById(`${windowId}~app`).remove();
    if (this.monacoList[windowId]) {
      this.monacoList[windowId].monaco.dispose();
      delete this.monacoList[windowId];
    }
  }

  includes(windowId) {
    return this.windowList.includes(windowId);
  }

  createMonacoWindow(options, override) {
    if (options?.MWwindowId && this.includes(options?.MWwindowId)) {
      this.bringToFront(options.MWwindowId);
      return;
    }
    const MonacoWindow = new Windows();
    MonacoWindow.title = options.MWtitle ?? "Monaco";
    const MWwindowId = options.MWwindowId ?? `monaco-${generateShortUUID()}`;
    MonacoWindow.windowId = MWwindowId;
    if (options.MWautoOpen) MonacoWindow.defaultHide = false;
    MonacoWindow.closeable = true;
    MonacoWindow.windowClass = "monaco";
    const monacoMenu = createMonacoMenu(
      MWwindowId,
      options.MWmode ?? "newfile"
    );
    MonacoWindow.menuContent = monacoMenu[0];
    MonacoWindow.eventListeners.push(monacoMenu[1]);
    MonacoWindow.initailize();
    const monaco = this.Monaco.editor.create(
      document.getElementsByClassName(MWwindowId)[0],
      options,
      override
    );
    this.monacoList[MWwindowId] = {};
    this.monacoList[MWwindowId]["monaco"] = monaco;
    if (options.FMfileName)
      this.monacoList[MWwindowId]["fileName"] = options.FMfileName;
    if (options.MWautoOpen) this.bringToFront(MWwindowId);
  }

  createTaskbarApp(id) {
    const appDiv = document.createElement("div");
    appDiv.className = "app";
    appDiv.id = `${id}~app`;
    appDiv.setAttribute("data-window", id);
    const appIconDiv = document.createElement("div");
    appIconDiv.className = "app-icon";
    const imgElement = document.createElement("img");
    const monacoRegex = /\bmonaco\b/i;
    imgElement.src = monacoRegex.test(id)
      ? this.iconManager("monaco")
      : this.iconManager(id);
    imgElement.alt = "icon";
    appIconDiv.appendChild(imgElement);
    const appIndicatorDiv = document.createElement("div");
    appIndicatorDiv.className = "app-indicator";
    appDiv.appendChild(appIconDiv);
    appDiv.appendChild(appIndicatorDiv);
    document.getElementById(id).style.display === "none"
      ? appDiv.setAttribute("data-active", "false")
      : appDiv.setAttribute("data-active", "true");
    document.getElementById("taskbar-apps").appendChild(appDiv);
    appDiv.addEventListener("click", () => {
      const isActive = appDiv.getAttribute("data-active");
      if (isActive === "true") {
        appDiv.setAttribute("data-active", "false");
        document.getElementById(id).style.display = "none";
      } else {
        appDiv.setAttribute("data-active", "true");
        document.getElementById(id).style.display = "block";
      }
    });
  }

  iconManager(id) {
    switch (id) {
      case "dino":
        return "./res/stadia_controller_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
      case "mod":
        return "./res/extension_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
      case "devtools":
        return "./res/terminal_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
      case "modinfo-window":
        return "./res/help_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
      case "monaco":
        return "./res/ink_pen_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
      default:
        return "./res/web_asset_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
    }
  }
})();

class Windows {
  title;
  content;
  menuContent;
  windowId;
  windowClass;
  defaultHide;
  closeable;
  #moveLock;
  #offset;
  #headerDiv;
  eventListeners;

  constructor() {
    this.title = "Window";
    this.content = "";
    this.defaultHide = true;
    this.closeable = false;

    this.#moveLock = null;
    this.#offset = [0, 0];
    this.eventListeners = [];
    this.handleMoveMouse = this.handleMoveMouse.bind(this);
    this.handleDoneMouse = this.handleDoneMouse.bind(this);
  }

  handleMoveMouse = (element) => {
    if (this.#moveLock == "touch") return;
    this.#moveLock = "mouse";
    [...document.getElementById(this.windowId).childNodes].forEach(
      (item, index) => {
        if (index === 0) return;
        item.style.pointerEvents = "none";
      }
    );
    element.preventDefault();
    document.getSelection().removeAllRanges();
    let container = document.getElementById(this.windowId);
    let mousePosition = {
      x: element.clientX,
      y: element.clientY,
    };
    container.style.left = mousePosition.x + this.#offset[0] + "px";
    container.style.top = mousePosition.y + this.#offset[1] + "px";
  };

  handleDoneMouse = () => {
    document.removeEventListener("mousemove", this.handleMoveMouse);
    document.removeEventListener("mouseup", this.handleDoneMouse);
    this.#moveLock = null;
    [...document.getElementById(this.windowId).childNodes].forEach(
      (item, index) => {
        if (index === 0) return;
        item.style.pointerEvents = "auto";
      }
    );
  };

  #handleMinimize() {
    document.getElementById(this.windowId).style.display = "none";
  }

  #createWindow() {
    const windowDiv = document.createElement("div");
    windowDiv.className =
      "window" + (this.windowClass ? ` ${this.windowClass}` : "");
    windowDiv.id = this.windowId;
    this.defaultHide && (windowDiv.style.display = "none");
    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    const headerInputMenu = document.createElement("div");
    headerInputMenu.className = "header__input-menu";
    const closeButton = document.createElement("div");
    this.closeable
      ? (closeButton.className = "header__input-close")
      : (closeButton.className = "header__input-disabled");
    if (this.closeable) {
      closeButton.addEventListener("click", this.destory.bind(this));
      this.eventListeners.push({
        trigger: "click",
        listener: this.destory.bind(this),
      });
    }
    const minimizeButton = document.createElement("div");
    minimizeButton.className = "header__input-minimize";
    const fullscreenButton = document.createElement("div");
    fullscreenButton.className = "header__input-disabled";
    const minimize = function () {
      this.#handleMinimize();
      [...document.getElementsByClassName("app")]
        .find((app) => app.getAttribute("data-window") === this.windowId)
        .setAttribute("data-active", "false");
    };
    minimizeButton.addEventListener("click", minimize.bind(this));
    this.eventListeners.push({
      trigger: "click",
      listener: minimize.bind(this),
    });
    headerInputMenu.appendChild(closeButton);
    headerInputMenu.appendChild(minimizeButton);
    headerInputMenu.appendChild(fullscreenButton);
    const headerText = document.createElement("div");
    headerText.className = "header__text";
    const headerParagraph = document.createElement("p");
    headerParagraph.textContent = this.title;
    headerText.appendChild(headerParagraph);
    headerDiv.appendChild(headerInputMenu);
    headerDiv.appendChild(headerText);
    const menuDiv = document.createElement("div");
    menuDiv.className = "window-menu";
    if (this.menuContent)
      typeof this.menuContent === "string"
        ? (menuDiv.innerHTML = this.menuContent)
        : menuDiv.appendChild(this.menuContent);
    const windowContent = document.createElement("div");
    windowContent.className = `window__content ${this.windowId ?? ""}`;
    typeof this.content === "string"
      ? (windowContent.innerHTML = this.content)
      : windowContent.appendChild(this.content);
    windowDiv.appendChild(headerDiv);
    if (this.menuContent) windowDiv.append(menuDiv);
    windowDiv.appendChild(windowContent);
    document.getElementsByClassName("container")[0].appendChild(windowDiv);
    this.#headerDiv = headerDiv;
    WindowManager.registerWindow(this.windowId);
  }

  initailize() {
    this.#createWindow();
    const headerElement = this.#headerDiv;
    const handleMouseAct = (e) => {
      this.#offset = [
        document.getElementById(this.windowId).offsetLeft - e.clientX,
        document.getElementById(this.windowId).offsetTop - e.clientY,
      ];
      document.addEventListener("mousemove", this.handleMoveMouse);
      document.addEventListener("mouseup", this.handleDoneMouse);
    };
    headerElement.addEventListener("mousedown", handleMouseAct);
    this.eventListeners.push({
      trigger: "mousedown",
      listener: handleMouseAct,
    });
  }

  destory() {
    WindowManager.unregisterWindow(this.windowId);
    this.eventListeners.forEach((item) =>
      document.removeEventListener(item.trigger, item.listener)
    );
  }
}

const FileManager = new (class {
  #fileList;
  #FPeventListeners;

  constructor() {
    this.#fileList = JSON.parse(localStorage.getItem("InfoCoDinoFM")) ?? [];
    this.#FPeventListeners = [];
  }

  addFile(name, content) {
    console.log(name,content)
    if (
      mods.some((item) => item.name === name) ||
      this.#fileList.some((item) => item.name === name)
    ) {
      alert(
        `⚠️ ERROR\nFile name '${name}' already exists.\nPlease consider a new name.`
      );
      return;
    }
    this.#fileList.push({ name, content });
    localStorage.setItem("InfoCoDinoFM", JSON.stringify(this.#fileList));
    generateModList();
  }

  removeFile(name) {
    if (mods.includes(name)) {
      alert(
        `⚠️ ERROR\nFile '${name}' is an internal mod which cannot be deleted.`
      );
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete '${name}'?\nThis action cannot be undone!`
      )
    ) {
      this.#fileList = this.#fileList.filter((item) => item.name !== name);
      localStorage.setItem("InfoCoDinoFM", JSON.stringify(this.#fileList));
      generateModList();
    }
  }

  getFileList() {
    return this.#fileList.map((item) => item.name);
  }

  getFile(name) {
    return this.#fileList.find((item) => item.name === name).content;
  }

  async getInternalFile(name) {
    return fetch(mods.find((mod) => mod.name === name).path)
      .then((response) => response.text())
      .then((data) => data);
  }

  updateFile(name, content) {
    this.#fileList = this.#fileList.map((item) =>
      item.name === name ? { name, content } : item
    );
    localStorage.setItem("InfoCoDinoFM", JSON.stringify(this.#fileList));
  }
  showFilePicker(oldMonaco) {
    let currentLocation = 0;
    const fileList = [mods.map((mod) => mod.name), this.getFileList()];
    const filePicker = document.createElement("div");
    filePicker.className = "window";
    filePicker.id = "file-picker";
    const windowContent = document.createElement("div");
    windowContent.className = "window__content file-picker";
    const filePickerLocations = document.createElement("div");
    filePickerLocations.className = "file-picker-locations";
    const headerInputMenu = document.createElement("div");
    headerInputMenu.className = "header__input-menu";
    for (let i = 0; i < 3; i++) {
      const headerInputDisabled = document.createElement("div");
      headerInputDisabled.className = "header__input-disabled";
      headerInputMenu.appendChild(headerInputDisabled);
    }
    const locationsCaption = document.createElement("div");
    locationsCaption.className = "file-picker-locations-caption";
    const captionSpan = document.createElement("span");
    captionSpan.textContent = "LOCATIONS";
    locationsCaption.appendChild(captionSpan);
    const locationsList = document.createElement("div");
    locationsList.className = "file-picker-locations-list";
    const createLocationItem = (name, callback) => {
      const item = document.createElement("div");
      item.className = "file-picker-locations-item";
      const itemIcon = document.createElement("div");
      itemIcon.className = "file-picker-locations-item-icon";
      const iconImg = document.createElement("img");
      iconImg.src = "./res/folder_24dp_5F6368_FILL0_wght300_GRAD0_opsz24.svg";
      iconImg.alt = "icon";
      itemIcon.appendChild(iconImg);
      const itemName = document.createElement("div");
      itemName.className = "file-picker-locations-item-name";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = name;
      itemName.appendChild(nameSpan);
      item.appendChild(itemIcon);
      item.appendChild(itemName);
      item.addEventListener("click", callback);
      return item;
    };
    const callbacks = [
      () => {
        this.generateFileList(fileList[0]);
        document.getElementsByClassName(
          "file-picker-menu-button"
        )[0].style.display = "none";
        document.getElementsByClassName(
          "file-picker-title"
        )[0].childNodes[0].textContent = "InfoCo scripts";
        currentLocation = 0;
      },
      () => {
        this.generateFileList(fileList[1]);
        document.getElementsByClassName(
          "file-picker-menu-button"
        )[0].style.display = "flex";
        document.getElementsByClassName(
          "file-picker-title"
        )[0].childNodes[0].textContent = "User scripts";
        currentLocation = 1;
      },
      () => {
        const fileName = this.getFilePickerSelected();
        this.removeFile(fileName);
        fileList[currentLocation] = fileList[currentLocation].filter(
          (item) => item !== fileName
        );
        this.generateFileList(fileList[currentLocation]);
      },
      () => {
        this.destoryFilePicker();
      },
      async () => {
        const fileName = this.getFilePickerSelected();
        if (!fileName) {
          alert("Please select a file to open.");
          return;
        }
        const isInfoCo = mods.some((item) => (item.name === fileName));
        if (oldMonaco) WindowManager.unregisterWindow(oldMonaco);
        WindowManager.createMonacoWindow({
          automaticLayout: true,
          language: "javascript",
          theme: "vs-light",
          value: isInfoCo
            ? await this.getInternalFile(fileName)
            : this.getFile(fileName),
          MWmode: isInfoCo ? "readonly" : "",
          MWtitle: `${fileName} - Monaco`,
          MWautoOpen: true,
          FMfileName: fileName,
        });
        this.destoryFilePicker();
      },
    ];
    const infoCo = createLocationItem("InfoCo scripts", callbacks[0]);
    const user = createLocationItem("User scripts", callbacks[1]);
    locationsList.appendChild(infoCo);
    locationsList.appendChild(user);
    this.#FPeventListeners.push({
      trigger: "click",
      listener: callbacks[0],
    });
    this.#FPeventListeners.push({
      trigger: "click",
      listener: callbacks[1],
    });
    filePickerLocations.appendChild(headerInputMenu);
    filePickerLocations.appendChild(locationsCaption);
    filePickerLocations.appendChild(locationsList);
    windowContent.appendChild(filePickerLocations);
    const filePickerMain = document.createElement("div");
    filePickerMain.className = "file-picker-main";
    const filePickerMenu = document.createElement("div");
    filePickerMenu.className = "file-picker-menu";
    const filePickerTitle = document.createElement("div");
    filePickerTitle.className = "file-picker-title";
    const titleSpan = document.createElement("span");
    titleSpan.textContent = "InfoCo scripts";
    filePickerTitle.appendChild(titleSpan);
    const menuOptions = document.createElement("div");
    menuOptions.className = "file-picker-menu-options";
    const menuButton = document.createElement("div");
    menuButton.className = "file-picker-menu-button";
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./res/delete_24dp_5F6368_FILL0_wght300_GRAD0_opsz24.svg";
    deleteIcon.alt = "icon";
    menuButton.appendChild(deleteIcon);
    menuButton.addEventListener("click", callbacks[2]);
    this.#FPeventListeners.push({
      trigger: "click",
      listener: callbacks[2],
    });
    menuOptions.appendChild(menuButton);
    filePickerMenu.appendChild(filePickerTitle);
    filePickerMenu.appendChild(menuOptions);
    const filePickerList = document.createElement("div");
    filePickerList.className = "file-picker-list";
    const filePickerActions = document.createElement("div");
    filePickerActions.className = "file-picker-actions";
    const cancelButton = document.createElement("button");
    cancelButton.className = "file-picker-actions-button";
    const cancelSpan = document.createElement("span");
    cancelSpan.textContent = "Cancel";
    cancelButton.appendChild(cancelSpan);
    const openButton = document.createElement("button");
    openButton.className = "file-picker-actions-button primary";
    const openSpan = document.createElement("span");
    openSpan.textContent = "Open";
    openButton.appendChild(openSpan);
    cancelButton.addEventListener("click", callbacks[3]);
    openButton.addEventListener("click", callbacks[4]);
    this.#FPeventListeners.push({
      trigger: "click",
      listener: callbacks[3],
    });
    this.#FPeventListeners.push({
      trigger: "click",
      listener: callbacks[4],
    });
    filePickerActions.appendChild(cancelButton);
    filePickerActions.appendChild(openButton);
    filePickerMain.appendChild(filePickerMenu);
    filePickerMain.appendChild(filePickerList);
    filePickerMain.appendChild(filePickerActions);
    filePicker.appendChild(windowContent);
    filePicker.appendChild(filePickerMain);
    const popoverDiv = document.createElement("div");
    popoverDiv.className = "popover";
    popoverDiv.style.animation = "fadeIn 0.15s ease-out forwards";
    filePicker.style.animation = "slideIn 0.15s ease-out forwards";
    popoverDiv.appendChild(filePicker);
    document.body.prepend(popoverDiv);
    this.generateFileList(fileList[0]);
  }

  generateFileList(list) {
    document.getElementsByClassName("file-picker-list")[0].replaceChildren();
    const filePickerList =
      document.getElementsByClassName("file-picker-list")[0];
    list.forEach((item, index) => {
      const filePickerItem = document.createElement("div");
      filePickerItem.className = "file-picker-item";
      filePickerItem.setAttribute(
        "data-selected",
        index === 0 ? "true" : "false"
      );
      filePickerItem.onmousedown = filePickerItemHandler;
      const itemIcon = document.createElement("div");
      itemIcon.className = "file-picker-item-icon";
      const lightImg = document.createElement("img");
      lightImg.src = "./res/draft_24dp_000000_FILL0_wght300_GRAD0_opsz24.svg";
      lightImg.alt = "icon";
      lightImg.setAttribute("data-theme", "light");
      itemIcon.appendChild(lightImg);
      const darkImg = document.createElement("img");
      darkImg.src = "./res/draft_24dp_FFFFFF_FILL0_wght300_GRAD0_opsz24.svg";
      darkImg.alt = "icon";
      darkImg.setAttribute("data-theme", "dark");
      itemIcon.appendChild(darkImg);
      const itemName = document.createElement("div");
      itemName.className = "file-picker-item-name";
      const scriptSpan = document.createElement("span");
      scriptSpan.innerText = item;
      itemName.appendChild(scriptSpan);
      filePickerItem.appendChild(itemIcon);
      filePickerItem.appendChild(itemName);
      filePickerList.appendChild(filePickerItem);
    });
  }

  getFilePickerSelected() {
    if (
      [...document.getElementsByClassName("file-picker-item")].some(
        (item) => item.getAttribute("data-selected") === "true"
      )
    )
      return [...document.getElementsByClassName("file-picker-item")].find(
        (item) => item.getAttribute("data-selected") === "true"
      ).childNodes[1].childNodes[0].innerText;
    else {
      return null;
    }
  }

  destoryFilePicker() {
    document.getElementById("file-picker").style.animation =
      "slideOut 0.3s ease-out forwards";
    document.getElementsByClassName("popover")[0].style.animation =
      "fadeOut 0.3s ease-out forwards";
    const destoryTimeout = setTimeout(() => {
      document.getElementById("file-picker").remove();
      document.getElementsByClassName("popover")[0].remove();
      this.#FPeventListeners.forEach((item) =>
        document.removeEventListener(item.trigger, item.listener)
      );
      clearTimeout(destoryTimeout);
    }, 300);
  }
})();

function init() {
  WindowManager.initalizeMonaco();
  const DinoWindow = new Windows();
  DinoWindow.title = "chrome://dino";
  DinoWindow.content = '<iframe src="./lib/dino/index.html"></iframe>';
  DinoWindow.windowId = "dino";
  DinoWindow.defaultHide = false;
  DinoWindow.initailize();
  const ModWindow = new Windows();
  ModWindow.title = "Mod";
  ModWindow.content = createModMenu();
  ModWindow.windowId = "mod";
  ModWindow.initailize();
  document.getElementsByClassName("dino")[0].childNodes[0].focus();
  // const DevtoolsWindow = new Windows();
  // DevtoolsWindow.title = "Devtools";
  // DevtoolsWindow.content = `<iframe src="./res/loading.html"></iframe>`;
  // DevtoolsWindow.windowId = "devtools";
  // DevtoolsWindow.initailize();
  // const iFrameTimeout = setInterval(() => {
  //   fetchDevtoolsEndpoint();
  //   clearTimeout(iFrameTimeout);
  // }, 1000)
  generateModList();
  const SortList = new Sortable.create(
    document.getElementsByClassName("mod-list")[0],
    {
      sort: true,
      draggable: ".mod-list-item",
      ghostClass: "mod-list-item-ghost",
      chosenClass: "mod-list-item-chosen",
      dragClass: "mod-list-item-drag",
      handle: ".mod-list-item-handle",
    }
  );
  document.getElementById("mod-info").addEventListener("click", () => {
    fetch("./res/mod_info.md")
      .then((response) => response.text())
      .then((value) => {
        WindowManager.createMonacoWindow({
          automaticLayout: true,
          language: "markdown",
          theme: "vs-light",
          wordWrap: "on",
          value,
          readOnly: true,
          minimap: { enabled: false },
          MWtitle: "Mod Infomation - Mod相关说明",
          MWwindowId: "modinfo-window",
          MWmode: "help",
          MWautoOpen: true,
        });
      });
  });
  document.getElementById("mod-add").addEventListener("click", () => {
    if (WindowManager.includes("init-monaco")) {
      WindowManager.bringToFront("init-monaco");
      return;
    }
    WindowManager.createMonacoWindow({
      automaticLayout: true,
      language: "javascript",
      theme: "vs-light",
      MWmode: "newfile",
      MWtitle: "Untitled - Monaco",
      MWautoOpen: true,
    });
  });
  document.getElementById("mod-apply").addEventListener("click", () => {
    const SortListArray = SortList.toArray().filter((item) =>
      mods.find((mod) => mod.name === item)
    );
    const iFrameCtx =
      document.getElementsByClassName("dino")[0].childNodes[0].contentWindow;
    iFrameCtx.location.reload();
    SortListArray.forEach((modName) => {
      if (mods.some(mod => mod.name === modName))
        fetch(mods.find((mod) => mod.name === modName).path)
          .then((response) => response.text())
          .then((data) => {
            if (iFrameCtx.document.readyState === "loading") {
              iFrameCtx.document.addEventListener("DOMContentLoaded", () => {
                iFrameCtx.eval(data);
              });
            } else {
              iFrameCtx.eval(data);
            }
          });
      else if (iFrameCtx.document.readyState === "loading") {
        iFrameCtx.document.addEventListener("DOMContentLoaded", () => {
          iFrameCtx.eval(FileManager.getFile(modName));
        });
      } else {
        iFrameCtx.eval(FileManager.getFile(modName));
      }
    });
  });
  const initMonacoTimeout = setTimeout(() => {
    WindowManager.createMonacoWindow({
      automaticLayout: true,
      language: "javascript",
      theme: "vs-light",
      MWmode: "newfile",
      MWtitle: "Untitled - Monaco",
      MWautoOpen: false,
      MWwindowId: "init-monaco",
    });
    clearTimeout(initMonacoTimeout);
  }, 500);
}

function createModMenu() {
  const modMenuContainer = document.createElement("div");
  modMenuContainer.style.width = "100%";
  const modMenu = document.createElement("div");
  modMenu.className = "mod-menu";
  const modMenuHeader = document.createElement("div");
  modMenuHeader.style.display = "flex";
  modMenuHeader.style.alignItems = "center";
  const modMenuTitle = document.createElement("span");
  modMenuTitle.style.userSelect = "none";
  modMenuTitle.style.fontSize = "0.75rem";
  modMenuTitle.textContent = "Select, arrange and apply mods";
  modMenuHeader.appendChild(modMenuTitle);
  const modMenuButtons = document.createElement("div");
  modMenuButtons.style.display = "flex";
  const modInfoButton = document.createElement("div");
  modInfoButton.className = "mod-menu-button";
  modInfoButton.id = "mod-info";
  const modInfoIcon = document.createElement("img");
  modInfoIcon.src = "./res/help_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
  modInfoIcon.alt = "icon";
  modInfoButton.appendChild(modInfoIcon);
  const modAddButton = document.createElement("div");
  modAddButton.className = "mod-menu-button";
  modAddButton.id = "mod-add";
  const modAddIcon = document.createElement("img");
  modAddIcon.src = "./res/note_add_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
  modAddIcon.alt = "icon";
  modAddButton.appendChild(modAddIcon);
  const modApplyButton = document.createElement("div");
  modApplyButton.className = "mod-menu-button";
  modApplyButton.id = "mod-apply";
  const modApplyIcon = document.createElement("img");
  modApplyIcon.src = "./res/check_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
  modApplyIcon.alt = "icon";
  modApplyButton.appendChild(modApplyIcon);
  modMenuButtons.appendChild(modInfoButton);
  modMenuButtons.appendChild(modAddButton);
  modMenuButtons.appendChild(modApplyButton);
  modMenu.appendChild(modMenuHeader);
  modMenu.appendChild(modMenuButtons);
  const modList = document.createElement("div");
  modList.className = "mod-list";
  modMenuContainer.appendChild(modMenu);
  modMenuContainer.appendChild(modList);
  return modMenuContainer;
}

function generateModList() {
  const modList = document.getElementsByClassName("mod-list")[0];
  modList.replaceChildren();
  mods
    .map((mod) => mod.name)
    .concat(FileManager.getFileList())
    .forEach((mod) => {
      const modListItem = document.createElement("div");
      modListItem.className = "mod-list-item";
      const modListItemContent = document.createElement("div");
      modListItemContent.style.display = "flex";
      modListItemContent.style.alignItems = "center";
      const modListItemHandle = document.createElement("div");
      modListItemHandle.className = "mod-list-item-handle";
      const modListItemHandleIcon = document.createElement("img");
      modListItemHandleIcon.src =
        "./res/drag_handle_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
      modListItemHandleIcon.alt = "icon";
      modListItemHandle.appendChild(modListItemHandleIcon);
      const modListItemName = document.createElement("div");
      modListItemName.className = "mod-list-item-name";
      modListItemName.textContent = mod;
      modListItemContent.appendChild(modListItemHandle);
      modListItemContent.appendChild(modListItemName);
      const macToggle = document.createElement("label");
      macToggle.className = "mac-toggle mac-toggle-small";
      const macToggleInput = document.createElement("input");
      macToggleInput.type = "checkbox";
      const macToggleSlider = document.createElement("span");
      macToggleSlider.className = "slider";
      macToggle.addEventListener("click", () => {
        if (macToggleInput.checked) modListItem.setAttribute("data-id", mod);
        else modListItem.removeAttribute("data-id");
      });
      macToggle.appendChild(macToggleInput);
      macToggle.appendChild(macToggleSlider);
      modListItem.appendChild(modListItemContent);
      modListItem.appendChild(macToggle);
      modList.appendChild(modListItem);
    });
}

function generateShortUUID() {
  return "xxxx-xxxx".replace(/[x]/g, () => {
    return ((Math.random() * 36) | 0).toString(36);
  });
}

function createMonacoMenu(id, mode) {
  const monacoMenu = document.createElement("div");
  monacoMenu.className = "monaco-menu";
  const flexContainer1 = document.createElement("div");
  flexContainer1.style.display = "flex";
  let listenerReference = [];
  const listenerList = [
    () =>
      WindowManager.createMonacoWindow({
        automaticLayout: true,
        language: "javascript",
        theme: "vs-light",
        MWmode: "newfile",
        MWtitle: "Untitled - Monaco",
        MWautoOpen: true,
      }),
    () => {
      FileManager.showFilePicker(
        WindowManager.monacoList[id].monaco.getValue().length === 0
          ? id
          : undefined
      );
    },
    () => {
      if (WindowManager.monacoList[id].fileName)
        FileManager.updateFile(
          WindowManager.monacoList[id].fileName,
          WindowManager.monacoList[id].monaco.getValue()
        );
      else {
        const fileName = prompt("Please enter the file name:");
        if (fileName) {
          FileManager.addFile(
            fileName,
            WindowManager.monacoList[id].monaco.getValue()
          );
          if (mode === "newfile")
            WindowManager.monacoList[
              id
            ].monaco.getContainerDomNode().parentNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0].style.display =
              "block";
          WindowManager.monacoList[id].fileName = fileName;
        } else alert("⚠️ ERROR\nFile name cannot be empty.");
      }
    },
    () => {
      const fileName = prompt("Please enter the file name:");
      if (fileName) {
        FileManager.addFile(
          fileName,
          WindowManager.monacoList[id].monaco.getValue()
        );
        WindowManager.monacoList[id].fileName = fileName;
        document.getElementById(
          id
        ).childNodes[0].childNodes[1].innerText = `${fileName} - Monaco`;
      } else alert("⚠️ ERROR\nFile name cannot be empty.");
    },
    () => {
      if (
        confirm(
          "Are you sure to erase the content?\nThis action cannot be undone!\nNOTE: This action will not automatically save the current document."
        )
      )
        WindowManager.monacoList[id].monaco.setValue("");
    },
    () => {
      document
        .getElementsByClassName("dino")[0]
        .childNodes[0].contentWindow.location.reload();
    },
    () => {
      document
        .getElementsByClassName("dino")[0]
        .childNodes[0].contentWindow.eval(
          WindowManager.monacoList[id].monaco.getValue()
        );
    },
  ];
  const imgSrcs1 = [
    "./res/new_window_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
    "./res/file_open_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
    "./res/save_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
    "./res/save_as_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
  ];
  imgSrcs1.forEach((src, index) => {
    if (mode === "readonly" && index === 2) return;
    if (mode === "help" && (index === 2 || index === 3)) return;
    const menuItem = document.createElement("div");
    menuItem.className = "monaco-menu-item";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "icon";
    if (mode === "newfile" && index === 3) menuItem.style.display = "none";
    menuItem.appendChild(img);
    menuItem.addEventListener("click", listenerList[index]);
    listenerReference.push({
      trigger: "click",
      listener: listenerList[index],
    });
    flexContainer1.appendChild(menuItem);
  });
  const flexContainer2 = document.createElement("div");
  flexContainer2.style.display = "flex";
  const imgSrcs2 = [
    "./res/delete_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
    "./res/reset_wrench_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
    "./res/play_circle_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg",
  ];
  imgSrcs2.forEach((src, index) => {
    if (mode === "help") return;
    if (mode === "readonly" && index === 0) return;
    const menuItem = document.createElement("div");
    menuItem.className = "monaco-menu-item";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "icon";
    menuItem.appendChild(img);
    menuItem.addEventListener("click", listenerList[index + 4]);
    listenerReference.push({
      trigger: "click",
      listener: listenerList[index],
    });
    flexContainer2.appendChild(menuItem);
  });
  monacoMenu.appendChild(flexContainer1);
  monacoMenu.appendChild(flexContainer2);
  return [monacoMenu, listenerReference];
}

function filePickerItemHandler(event) {
  [...document.getElementsByClassName("file-picker-item")].forEach((item) => {
    item.setAttribute("data-selected", "false");
  });
  event.currentTarget.setAttribute("data-selected", "true");
}

document.addEventListener("DOMContentLoaded", init);
