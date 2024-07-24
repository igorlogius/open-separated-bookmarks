/* global browser */

async function gatherBookmarksBetweenClosestSeperator(trigger_bookmarkId) {
  //get Children from Partent of trigger_bookmarkId

  const triggerNode = (await browser.bookmarks.get(trigger_bookmarkId))[0];

  console.debug(triggerNode);

  if (triggerNode.type === "separator") {
    return;
  }

  const children = await browser.bookmarks.getChildren(triggerNode.parentId);

  let urls_to_open = [];

  /*
Each entry represents a child node. The list is in the same order as the bookmarks appear in the user interface. Separators are included in the results. The list includes subfolders but does not include any children contained in subfolders.
    */

  let stop_at_next_sep = false;

  for (const child of children) {
    if (child.type === "bookmark") {
      urls_to_open.push(child.url);
    } else if (child.type === "separator") {
      if (stop_at_next_sep) {
        break;
      } else {
        urls_to_open = []; // clear
        console.debug("cleared ");
      }
    }
    if (child.id === trigger_bookmarkId) {
      stop_at_next_sep = true;
    }
  }

  console.debug(JSON.stringify(urls_to_open, null, 4));
  return urls_to_open;
}

browser.menus.create({
  title: "Open in New Tab(s)",
  contexts: ["bookmark"],
  onclick: async (info) => {
    console.debug(info);
    if (info.bookmarkId) {
      const urls = await gatherBookmarksBetweenClosestSeperator(
        info.bookmarkId,
      );
      for (const url of urls) {
        browser.tabs.create({
          url,
        });
      }
    }
  },
});

browser.menus.create({
  title: "Open in New Window",
  contexts: ["bookmark"],
  onclick: async (info) => {
    if (info.bookmarkId) {
      const urls = await gatherBookmarksBetweenClosestSeperator(
        info.bookmarkId,
      );
      browser.windows.create({
        url: urls,
      });
    }
  },
});

browser.menus.create({
  title: "Open in New Private Window",
  contexts: ["bookmark"],
  onclick: async (info) => {
    if (info.bookmarkId) {
      const urls = await gatherBookmarksBetweenClosestSeperator(
        info.bookmarkId,
      );
      browser.windows.create({
        incognito: true,
        url: urls,
      });
    }
  },
});
