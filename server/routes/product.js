const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { Product } = require("../models/Product");
const multer = require("multer");

//=================================
//             Product
//=================================

let storage = multer.diskStorage({
  // destination: 어디에 파일을 저장할 지
  destination: (req, file, cb) => {
    // destination: uploads폴더가 된다. uploads 폴더에 사진 저장.
    cb(null, "uploads/");
  },
  // 파일 이름
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  // 파일 형식은 png 또는 jpg 등, 즉 사진만 가능
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" || ext !== ".jpg") {
      return cb(res.status(400).end("only png, jpg is allowed"), false);
    }
    cb(null, true);
  },
});

const upload = multer({ storage: storage }).single("file");

router.post("/uploadImage", auth, (req, res) => {
  // 노드서버에 파일을 저장하기 위한 dependency를 설치한다.(multer)
  // npm install multer --save

  //upload 변수를 불러온다.
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }

    return res.json({
      success: true,
      // 클라이언트(프론트)에 image, fileName 정보를 보내준다.
      image: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.post("/uploadProduct", auth, (req, res) => {
  const product = new Product(req.body);

  product.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({ success: true, doc });
  });
});

router.post("/showProducts", auth, (req, res) => {
  let limit = parseInt(req.body.limit);
  let skip = req.body.limit ? parseInt(req.body.skip) : 0;
  let term = req.body.searchTerm;

  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  if (term) {
    Product.find(findArgs)
      .find({ title: { $regex: term, $options: "i" } })
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({
          success: true,
          products,
          productsArrayLength: products.length,
        });
      });
  } else {
    Product.find(findArgs)
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({
          success: true,
          products,
          productsArrayLength: products.length,
        });
      });
  }
});

router.get("/products_by_id", auth, (req, res) => {
  //type이 single이 아니라 array일수도 있으니 필요함.
  let type = req.query.type;
  let productIds = req.query.id;

  if (type === "array") {
    let ids = req.query.id.split(",");
    productIds = ids.map((item) => {
      return item;
    });
  }

  // $in(mongoose)를 써서 여러개의 product._id의 조건에 맞는걸 모두 찾아온다.
  Product.find({ _id: { $in: productIds } })
    .populate("writer")
    .exec((err, productDetail) => {
      if (err) return res.status(400).json({ success: false, err });
      res.status(200).send(productDetail);
    });
});

module.exports = router;
