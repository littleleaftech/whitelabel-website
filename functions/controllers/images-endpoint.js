const { v4: uuidv4 } = require("uuid");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { firebaseConfig } = require("../config/firebase-config");
const { admin, db } = require("../config/admin-config");
const { firebase, storage } = require("../config/firebase-config");
const { getAll, deleteItem } = require("./shared-crud-calls");

exports.addImages = (req, res) => {
  const { page, type } = req.params;

  const busboy = new Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();

  // This object will accumulate all the uploaded files, keyed by their name.
  const uploads = {};
  const fileWrites = [];

  // This code will process each file uploaded.
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    let filesArray = [];
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    console.log(`Processed file ${filename}`);

    const filepath = path.join(tmpdir, filename);
    uploads[filename] = filepath;
    uploads["type"] = mimetype;

    filesArray.push(uploads[filename]);

    // creating a writable stream tio that file path
    const writeStream = fs.createWriteStream(filepath);

    // pipes the data that we are getting from the post request
    file.pipe(writeStream);

    fileWrites.push(filesArray);
  });

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on("finish", () => {
    fileWrites.forEach(async ([file]) => {
      let filename = file.split("\\").pop();
      // flag we use to ensure that the db add was succesful before we continue
      let docAdded = false;
      let url = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${filename}?alt=media`;
      let imageType = type;

      const newImage = {
        id: uuidv4(),
        [imageType]: url,
        createAt: new Date().toISOString(),
        section: page,
      };

      if (page === "aboutus" && imageType === "banner") {
        res
          .status(400)
          .json({ message: "No banners can be added to this page" });
      }

      try {
        // we need to call the collections and check the amount of data / images within each area
        // we will need to run a check to ensure we not uploading too many images
        const imageCollection = await db.collection("images");
        const collectionSnapshot = await imageCollection.get();

        // check if the actual file exists
        const imageRef = await db.collection("images").doc(`${filename}`);
        const doc = await imageRef.get();
        // create an array to push all the available docs... then reduce to create a tally
        // we will then check against tally for validation
        let documentArray = [];

        // set the image limit for each area
        const homeImageLimit = 3;
        const aboutusImageLimit = 2;
        const contactusImageLimit = 2;
        const homeBannerLimit = 1;
        const contactusBannerLimit = 1;

        // get the amount of files that have been uploaded
        let fileAmount = fileWrites.length;

        if (imageType === "image" && fileAmount > 3) {
          return res
            .status(400)
            .json({ message: "Too many images selected, 3 is the maximum" });
        }

        if (imageType === "banner" && fileAmount > 1) {
          return res
            .status(400)
            .json({ message: "Too many banners selected, 3 is the maximum" });
        }
        // if it exists -- validation process
        collectionSnapshot.forEach((doc) => {
          documentArray.push(doc.data());
        });

        // count all the sections that already exist -- set defaults of those section
        const collectionTallies = documentArray.reduce((tally, collection) => {
          let type = Object.keys(collection).find((key) => {
            return key === "image" || key === "banner";
          });

          let collectionSection = collection["section"];
          // check if the section exists
          if (tally[collectionSection]) {
            if (tally[collectionSection][type]) {
              tally[collectionSection][type] += 1;
            } else {
              tally[collectionSection][type] = 1;
            }
          } else {
            tally[collectionSection] = {};
            tally[collectionSection][type] = 1;
          }
          return tally;
        }, {});

        // validation object key helper
        const validatiePageKeys = (page) => {
          return Object.keys(collectionTallies).includes(page);
        };

        // validate the image
        const validateImageAmount = (
          page,
          fileAmount,
          homeImageLimit,
          aboutusImageLimit,
          contactusImageLimit,
          collectionTallies
        ) => {
          if (Object.keys(collectionTallies).length === 0) {
            return true;
          }

          const homeImageCount = validatiePageKeys("home");
          const aboutusImageCount = validatiePageKeys("aboutus");
          const contactusImageCount = validatiePageKeys("contactus");
          switch (page) {
            case "home":
              if (
                homeImageCount &&
                fileAmount + collectionTallies.home.image > homeImageLimit
              ) {
                return false;
              } else {
                return true;
              }
            case "contactus":
              if (
                contactusImageCount &&
                fileAmount + collectionTallies.contactus.image >
                  contactusImageLimit
              ) {
                return false;
              } else {
                return true;
              }
            case "aboutus":
              if (
                aboutusImageCount &&
                fileAmount + collectionTallies.aboutus.image > aboutusImageLimit
              ) {
                return false;
              } else {
                return true;
              }
            default:
              break;
          }
        };

        const validateBannerAmount = (
          page,
          fileAmount,
          homeBannerLimit,
          contactusBannerLimit,
          collectionTallies
        ) => {
          if (Object.keys(collectionTallies).length === 0) {
            return true;
          }

          const homeImageCount = validatiePageKeys("home");
          const contactusImageCount = validatiePageKeys("contactus");
          switch (page) {
            case "home":
              if (
                homeImageCount &&
                fileAmount + collectionTallies.home.banner > homeBannerLimit
              ) {
                return false;
              } else {
                return true;
              }
            case "contactus":
              if (
                fileAmount + collectionTallies.contactus.banner >
                contactusBannerLimit
              ) {
                return false;
              } else {
                return true;
              }

            default:
              break;
          }
        };

        const validateGallery = (page, type) => {
          if (Object.keys(collectionTallies).length === 0) {
            return true;
          }
          if (page === "aboutus" && type === "gallery") {
            return true;
          } else {
            return false;
          }
        };

        if (fileAmount > 3) {
          return res
            .status(400)
            .json({ message: "Too many files added, 3 is the maximum" });
        }

        if (!doc.exists) {
          let isValid;
          if (imageType === "image") {
            isValid = validateImageAmount(
              page,
              fileAmount,
              homeImageLimit,
              aboutusImageLimit,
              contactusImageLimit,
              collectionTallies
            );
          } else if (imageType === "banner") {
            isValid = validateBannerAmount(
              page,
              fileAmount,
              homeBannerLimit,
              contactusBannerLimit,
              collectionTallies
            );
          } else {
            isValid = validateGallery(page, imageType);
          }

          if (isValid) {
            await db.collection("images").doc(`${filename}`).set(newImage);
            docAdded = true;
          } else {
            return res.status(400).json({
              message:
                "Too many images uploaded for this section or the area does not exist on the page",
            });
          }
        } else {
          return res.status(400).json({ message: "This image already exists" });
        }
      } catch (error) {
        res.send(error);
      }

      if (docAdded) {
        try {
          await admin
            .storage()
            .bucket()
            .upload(file, {
              resumable: false,
              metadata: {
                metadata: {
                  contentType: filename.split(".").pop(),
                  // need the below line to ensure we create anm access token
                  firebaseStorageDownloadTokens: newImage.id,
                },
              },
            });
          return res
            .status(201)
            .json({ message: `New content added successfully` });
        } catch (error) {
          return res.status(400).json({
            message: "Something went wrong during the upload to storage",
          });
        }
      }
    });
  });

  busboy.end(req.rawBody);
};

exports.getAllImages = (req, res) => {
  getAll(req, res);
};

exports.deleteImage = async (req, res) => {
  const { name } = req.params;
  await deleteItem(req, res);

  try {
    const file = await admin.storage().bucket().file(name);
    file.delete();

    return res.status(200).json({ message: "This content has been deleted" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "failed to delete image from bucket" });
  }
};
