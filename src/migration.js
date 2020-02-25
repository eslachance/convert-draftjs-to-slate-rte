const blockMapping = {
  "header-one": "h1",
  "header-two": "h2",
  "header-three": "h3",
  "header-four": "h4",
  "header-five": "h5",
  "header-six": "h6",
  unstyled: "p",
  "unordered-list-item": "ul",
  "ordered-list-item": "ol"
};

const styleMapping = {
  BOLD: "strong",
  ITALIC: "em",
  UNDERLINE: "u",
  STRIKETHROUGH: "strike"
};

const parseChild = (text, styles, entityRanges, entityMap) => {
  const splitString = text.split("").map(letter => ({
    text: letter
  }));
  if (styles && styles.length > 0) {
    styles.forEach(style => {
      const key =
        style.style.split("-")[0] === "color"
          ? "color"
          : styleMapping[style.style];
      const value =
        style.style.split("-")[0] === "color"
          ? style.style.split("-")[1]
          : true;
      for (let i = style.offset; i < style.offset + style.length; i++) {
        splitString[i][key] = value;
      }
    });
  }
  if (entityRanges && entityRanges.length > 0) {
    entityRanges.forEach(range => {
      const rangeData = entityMap[range.key];
      if (rangeData.type === "LINK") {
        for (let i = range.offset; i < range.offset + range.length; i++) {
          splitString[i]["link"] = rangeData.data.url;
        }
      }
    });
  }
  return splitString
    .reduce((acc, curr) => {
      const prev = acc[acc.length - 1] || {};
      if (Object.keys(curr).length === Object.keys(prev).length) {
        acc[acc.length - 1].text += curr.text;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
    .reduce((acc, curr) => {
      const prev = acc[acc.length - 1] || {};
      if (curr.link) {
        if (!prev.children || curr.link !== prev.url) {
          const url = curr.link;
          delete curr.link;
          acc.push({
            type: "link",
            url,
            children: [curr]
          });
        } else {
          delete curr.link;
          acc[acc.length - 1].children.push(curr);
        }
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
};

const partitionBlocks = (acc, curr, i) => {
  if (["unordered-list-item", "ordered-list-item"].includes(curr.type)) {
    if (curr.children === undefined && acc[i - 1].type !== curr.type) {
      acc.push({
        children: [curr],
        type: "unordered-list-item",
        inlineStyleRanges: {},
        entityRanges: {}
      });
    } else {
      acc[i - 1].children.push(curr);
    }
  } else {
    acc.push(curr);
  }
  return acc;
};

const parseListItem = sub => {
  const returnBlock = {
    type: "li"
  };
  returnBlock.children =
    sub.inlineStyleRanges.length > 0
      ? parseChild(sub.text, sub.inlineStyleRanges)
      : [{ text: sub.text }];
  return returnBlock;
};

const migrateOldData = data => {
  return data.blocks.reduce(partitionBlocks, []).map(block => {
    const returnBlock = {
      type:
        block.data && block.data["text-align"]
          ? `align-${block.data["text-align"]}`
          : blockMapping[block.type] || "p"
    };
    if (block.text) {
      returnBlock.children = parseChild(
        block.text,
        block.inlineStyleRanges,
        block.entityRanges,
        data.entityMap
      );
    }

    if (returnBlock.type === "li" || returnBlock.type === "ul") {
      returnBlock.children = block.children.map(parseListItem);
    }
    return returnBlock;
  });
};

export default migrateOldData;
