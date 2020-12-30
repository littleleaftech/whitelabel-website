exports.contentBuilder = (heading, content, section) => {
  const sectionArea = section.split("-")[1];
  let headingArea = `heading-${sectionArea}`;
  let contentArea = `content-${sectionArea}`;

  const contentObj = {};
  contentObj[headingArea] = heading;
  contentObj[contentArea] = content;
  contentObj["createAt"] = new Date().toISOString();

  return contentObj;
};
