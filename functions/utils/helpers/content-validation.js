exports.contentValidation = (page, section, req, res) => {
  const { heading, content } = req.body;

  const pages = ["home", "about", "contactus", "footer"];
  const sections = ["one", "two", "three"];

  if (!page || !section) {
    res
      .status(400)
      .send({ message: "Something went wrong while trying to add content" });
    return false;
  } else {
    if (heading && content) {
      const sectionArea = section.split("-")[1];
      const validPage = pages.filter((arrayPage) => arrayPage === page);
      const validSection = sections.filter(
        (arraySection) => arraySection === sectionArea
      );

      if (validPage.length === 0 || validSection.length === 0) {
        res.status(400).json({
          message:
            "Something went wrong while trying to add the heading or content",
        });
        return false;
      }

      if (
        (page === "about" && sectionArea === "three") ||
        (page === "contactus" && sectionArea === "three")
      ) {
        res.status(400).json({
          message: "Content is not valid for this section of the page",
        });
        return false;
      }
    }
  }
  return true;
};
