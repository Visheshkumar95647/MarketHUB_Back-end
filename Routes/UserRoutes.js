const express = require("express");
const UserSchema = require("../Models/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const VeryifyToken = require("../middleware");
const ProductSchema = require("../Models/Product");
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const VerifyToken = require("../middleware");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ProfileImage/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

const ProductStroage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ProductImage/product");
  },
  filename: function (req, file, cb) {
    const suffix = Date.now();
    cb(null, suffix + file.originalname);
  },
});

const ProductUpload = multer({ storage: ProductStroage });

router.post("/register", upload.single("image"), async (req, res) => {
  try {
    let user = await UserSchema.findOne({
      username: req.body.username,
      number: req.body.number,
    });
    if (user) {
      return res
        .status(400)
        .json({ error: "User with these credentials already exists" });
    }

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    const imagename = req.file.filename;
    // Create new user
    user = await UserSchema.create({
      image: imagename,
      name: req.body.name,
      username: req.body.username,
      password: secPass,
      number: req.body.number,
      address: req.body.address,
      city: req.body.city,
      pin: req.body.pin,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.KEY,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({ token: token });
  } catch (error) {
    console.error("Error caught:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const getuser = await UserSchema.findOne({ username });
    if (!getuser) {
      return res.status(401).json({ error: "Wrong details" });
    }
    const secpassword = await bcrypt.compare(password, getuser.password);

    if (!secpassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const data = {
      user: {
        id: getuser._id,
      },
    };
    const authToken = jwt.sign(data, process.env.KEY);
    return res.status(200).json({ token: authToken });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/userdetails", VeryifyToken, async (req, res) => {
  try {
    const userid = req.user.id;
    const getuser = await UserSchema.findById(userid);
    if (getuser) {
      console.log("Profile got");
      res.status(201).json({ user: getuser });
    } else {
      console.log("Profile can't got");
      res.status(400).json({ error: "User Not Found" });
    }
  } catch {
    console.log("Kuch toh error hai");
    return res.status(500).json({ error: "Internal server error" });
  }
});

//get all users for Home Page

router.get("/allprofile", async (req, res) => {
  try {
    const allProfile = await UserSchema.find();
    res.status(201).json({ alluser: allProfile });
  } catch {
    console.log("Kuch toh error hai");
    return res.status(500).json({ error: "Internal server error" });
  }
});
//Product

router.post(
  "/product",
  VerifyToken,
  ProductUpload.array("Productimages", 10),
  async (req, res) => {
    try {
      const filenames = req.files.map((file) => file.filename);
      await ProductSchema.create({
        id: req.body.id,
        Productimages: filenames,
      });
      return res.status(200).json({ Upload: "Successfully" });
    } catch (error) {
      console.log("Kuch toh error hai", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//get all product
router.get("/getallproduct", async (req, res) => {
  try {
    const uploadData = await ProductSchema.find();
    res.status(200).json({ uploadData });
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get all product for given id

router.get("/getProductbyId/:id", async (req, res) => {
  try {
    const productId = req.params.id; 
    const products = await ProductSchema.find({ id: productId });
    res.status(200).json(products);
  } catch (error) { 
    console.error("Error fetching product data:", error);  
    res.status(500).json({ error: "Internal server error" }); 
  }
});


//searching functionality
router.get("/search/user", VerifyToken, async (req, res) => {
  try {
    const userid = req.user.id;
    const keyword = req.query.search
      ? {
          $or: [{ username: { $regex: req.query.search, $options: "i" } },
            {name : {$regex : req.query.search,$options : "i"}}
          ],
        }
      : {};
      //if req.query.search exists than it matched with username whether any username exist or not.if not than it send empty keyword
      
      // If there's no search query, this will return an empty filter
    //find keyword that is get from the search and we got the id from the verifytoken and that is not equal to the profile id
    const users = await UserSchema.find(keyword).find({ _id: { $ne: userid } });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//getting profile by username

router.get("/inspect/:id", VerifyToken, async (req, res) => {
  try {
    const id = req.params.id; 
    console.log(id); // Log the id to check if it's correct

    const user = await UserSchema.findById(id); // Use 'id' to query the database

    console.log(user);

    if (user) {
      res.status(200).json(user); // If user found, return user data
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
