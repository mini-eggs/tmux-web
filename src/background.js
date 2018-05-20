import Throttle from "lodash/throttle";

const nodeHistory = [];

class Node {
  constructor(window, parent) {
    this.window = window;
    this.parent = parent;
  }
}

const intAll = obj =>
  Object.keys(obj).reduce(
    (total, key) => Object.assign({}, total, { [key]: parseInt(obj[key]) }),
    {}
  );

const newWindow = (win, a, b, dir) => {
  const opts = { url: "https://google.com" };
  Promise.all([
    browser.windows.update(win.id, intAll(a)),
    browser.windows.create(Object.assign({}, intAll(b), opts))
  ]).then(data => {
    nodeHistory.push(new Node(data.pop(), win));
  });
};

const ensureWindowNotMaximized = win => {
  return new Promise(resolve => {
    if (win.state === "maximized") {
      browser.windows
        .update(win.id, { top: 0, left: 0 })
        .then(() => browser.windows.getCurrent())
        .then(next => resolve(next));
    } else {
      resolve(win);
    }
  });
};

const horizontalSplit = () => {
  browser.windows
    .getCurrent()
    .then(win => ensureWindowNotMaximized(win))
    .then(win => {
      const changeOpts = {
        width: win.width / 2
      };

      const newOpts = {
        width: win.width / 2,
        height: win.height,
        top: win.top,
        left: win.left + changeOpts.width
      };

      newWindow(win, changeOpts, newOpts, "horizontal");
    });
};

const verticalSplit = () => {
  browser.windows
    .getCurrent()
    .then(win => ensureWindowNotMaximized(win))
    .then(win => {
      const changeOpts = {
        height: win.height / 2
      };

      const newOpts = {
        height: win.height / 2,
        width: win.width,
        left: win.left,
        top: win.top + changeOpts.height
      };

      newWindow(win, changeOpts, newOpts, "vertical");
    });
};

const closePane = ({ remove = true }) => {
  browser.windows.getCurrent().then(win => {
    const last = nodeHistory.pop();

    const opts = {
      width: last.parent.width,
      height: last.parent.height
    };

    const removePromise = remove
      ? browser.windows.remove(win.id)
      : Promise.resolve();

    return Promise.all([
      removePromise,
      browser.windows.update(last.parent.id, intAll(opts))
    ]);
  });
};

browser.runtime.onMessage.addListener(
  Throttle(event => {
    switch (event) {
      case "SPLIT_HORIZONTAL": {
        return horizontalSplit();
      }
      case "SPLIT_VERTICAL": {
        return verticalSplit();
      }
      case "MOVE_LEFT": {
        return console.log("TODO");
      }
      case "MOVE_RIGHT": {
        return console.log("TODO");
      }
      case "MOVE_UP": {
        return console.log("TODO");
      }
      case "MOVE_DOWN": {
        return console.log("TODO");
      }
      case "CLOSE_PANE": {
        return closePane();
      }
      default: {
        return;
      }
    }
  }, 250)
);

browser.windows.onRemoved.addListener(() => {
  return closePane({ remove: false });
});
