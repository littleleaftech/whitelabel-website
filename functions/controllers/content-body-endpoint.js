const { db } = require("../config/admin-config");
const {
  authErrorHandler,
} = require("../utils/errorHandlers/auth-error-handler");
const { contentBuilder } = require("../utils/helpers/content-builder");
const { contentValidation } = require("../utils/helpers/content-validation");

exports.addContent = async (req, res) => {
  const { heading, content } = req.body;
  const { page, section } = req.query;

  // build content
  const newContent = contentBuilder(heading, content, section);

  // validation section
  const isValid = contentValidation(page, section, req, res);
  if (!isValid) return;

  // add content
  try {
    const contentRef = await db.collection(`${page}`).doc(`${section}`);
    const doc = await contentRef.get();

    if (!doc.exists) {
      await db.collection(`${page}`).doc(`${section}`).set(newContent);

      res
        .status(201)
        .json({ message: `New content added to ${page} ${section}` });
    } else {
      res.status(400).json({
        message: `This content already exists for ${page} ${section}`,
      });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = authErrorHandler(error.code);
    const { status, message } = errorMessage;

    res.status(status).json({ error: message });
  }
};

exports.getContent = async (req, res) => {
  const { page } = req.query;
  let pageContent = [];

  if (!page) {
    return res
      .status(400)
      .json({ message: "Something went wrong while trying to get content" });
  }

  try {
    const contentRef = await db.collection(`${page}`);
    const allContent = await contentRef.get();

    if (allContent.size === 0) {
      return res.status(400).json({ message: "This page does not exist" });
    } else {
      allContent.forEach((doc) => {
        pageContent.push({ id: doc.id, ...doc.data() });
      });

      return res.status(200).json(pageContent);
    }
  } catch (error) {
    res.send({ error });
  }
};

exports.updateContent = async (req, res) => {
  const { heading, content } = req.body;
  const { page, section } = req.query;

  // build content
  const newContent = contentBuilder(heading, content, section);

  // validation
  contentValidation(page, section, req, res);

  try {
    const contentRef = await db.collection(`${page}`).doc(`${section}`);
    const doc = await contentRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: `The document does not exist` });
    } else {
      await db.collection(`${page}`).doc(`${section}`).set(newContent);
      res.status(201).json({
        message: `Content has been updated for ${section} on ${page} page`,
      });
    }
  } catch (error) {
    res.send({ error });
  }
};

exports.deleteContent = async (req, res) => {
  const { page, section } = req.query;

  try {
    const contentRef = await db.collection(`${page}`).doc(`${section}`);
    const doc = await contentRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: "This content does not exist" });
    } else {
      await db.collection(`${page}`).doc(`${section}`).delete();

      return res
        .status(200)
        .json({ message: "This content has now been deleted", section });
    }
  } catch (error) {
    res.send({ error });
  }
};
