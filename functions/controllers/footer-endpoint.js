const { db } = require("../config/admin-config");
const {
  authErrorHandler,
} = require("../utils/errorHandlers/auth-error-handler");
const { getAll, deleteItem } = require("./shared-crud-calls");

exports.addFooterContent = async (req, res) => {
  const { area } = req.params;
  const { content } = req.body;
  const collection = req.url.split("/")[1];
  const areas = ["company", "social"];

  if (!content || !area) {
    return res.status(400).json({ message: "There is no content to be added" });
  } else {
    const validArea = areas.filter((footerArea) => {
      return footerArea === area;
    });

    const newFooterContent = {
      ...content,
    };

    if (validArea.length > 0) {
      try {
        const contentRef = await db.collection(collection).doc(area);
        const doc = await contentRef.get();

        if (!doc.exists) {
          await db.collection(collection).doc(area).set(newFooterContent);
          return res
            .status(201)
            .json({ message: `New content added for ${area}` });
        } else {
          return res
            .status(400)
            .json({ message: "This content already exists" });
        }
      } catch (error) {
        const errorMessage = authErrorHandler(error.code);
        const { status, message } = errorMessage;

        res.status(status).json({ error: message });
      }
    } else {
      return res
        .status(400)
        .json({ message: "The content is not valid for this collection" });
    }
  }
};

exports.updateFooterContent = async (req, res) => {
  const { area } = req.params;
  const { content } = req.body;
  const collection = req.url.split("/")[1];
  const areas = ["company", "social"];

  if (!content || !area) {
    return res.status(400).json({ message: "There is no content to be added" });
  } else {
    const validArea = areas.filter((footerArea) => {
      return footerArea === area;
    });

    const newFooterContent = {
      ...content,
    };

    if (validArea.length > 0) {
      try {
        const contentRef = await db.collection(collection).doc(area);
        const doc = await contentRef.get();

        if (!doc.exists) {
          return res
            .status(400)
            .json({ message: "This content already exists" });
        } else {
          await db.collection(collection).doc(area).set(newFooterContent);
          return res
            .status(201)
            .json({ message: `New content updated for ${area}` });
        }
      } catch (error) {
        const errorMessage = authErrorHandler(error.code);
        const { status, message } = errorMessage;

        res.status(status).json({ error: message });
      }
    } else {
      return res
        .status(400)
        .json({ message: "The content is not valid for this collection" });
    }
  }
};

exports.getFooterContent = async (req, res) => {
  getAll(req, res);
};

exports.deleteFooterContent = async (req, res) => {
  deleteItem(req, res);
};
