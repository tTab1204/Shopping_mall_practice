const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { Payment } = require("../models/Payment");
const { auth } = require("../middleware/auth");
const async = require("async");

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

router.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

router.post("/addToCart", auth, (req, res) => {
  // 1. User Collection에 해당 유저의 정보를 가져오기
  // 어떻게 req.user._id가 가능하냐면(프론트에서 보내주지도 않았는데)
  // auth.js 컴포넌트에 req.user에 유저의 모든 정보가 담겨있기 때문에

  let duplicate = false;

  // 2. 가져온 정보에서 카트에 넣으려 하는 상품이 이미 들어있는지 확인
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    userInfo.cart.forEach((item) => {
      if (item.id === req.body.productId) {
        duplicate = true;
      }
    });

    // 3. 상품이 중복일 때
    if (duplicate) {
      User.findOneAndUpdate(
        // 2개의 조건을 건다.
        { _id: req.user._id, "cart.id": req.body.productId },
        { $inc: { "cart.$.quantity": 1 } },
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).json({ success: true, cart: userInfo.cart });
        }
      );

      // 4. 상품이 없을 때
    } else {
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          // 데이터를 넣는 메소드
          $push: {
            cart: {
              id: req.body.productId,
              quantity: 1,
              date: Date.now(),
            },
          },
        },
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).json({ success: true, cart: userInfo.cart });
        }
      );
    }
  });
});

router.get("/removeFromCart", auth, (req, res) => {
  // 먼저 cart 안에 내가 지우려고 한 상품을 지워주기
  User.findOneAndUpdate(
    { _id: req.user._id },
    //mongoose 삭제 메소드
    {
      $pull: { cart: { id: req.query.id } },
    },
    { new: true },
    (err, userInfo) => {
      // 선택한 상품이 지워진 장바구니 = cart
      let cart = userInfo.cart;
      let array = cart.map((item) => {
        return item.id;
      });

      // 여기서 array: 카트 별 ID를 모아놓은 배열
      // 이 array의 각 item(요소)들은 productId와 동일하다.
      Product.find({ _id: { $in: array } })
        .populate("writer")
        .exec((err, productInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).json({ success: true, productInfo, cart });
        });
    }
  );

  // product collection(cartDetail)에서 현재 남아있는 상품들의 정보를 가져오기
});

router.post("/successBuy", auth, (req, res) => {
  // 1. User 컬렉션의 History 필드 안에 간단한 결제 데이터 넣어주기
  let history = [];
  let transactionData = {};

  req.body.cartDetail.forEach((item) => {
    history.push({
      dateOfPurChase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      paymentId: req.body.paymentData.paymentId,
    });
  });

  // 2. Payment 컬렉션 안에 자세한 결제 정보 넣어주기
  transactionData.user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    // req.user => 전부 미들웨어 통해서 온다.
  };

  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  // 1) history 정보 저장하는 부분
  User.findOneAndUpdate(
    { _id: req.user._id },
    // 결제가 성공하면 User 컬렉션 안에
    // (1) history정보를 $push로 넣어줌과 동시에
    // (2) 카트를 비워야 하기 때문에 $set: {cart: []}라고 한다.
    { $push: { history: history }, $set: { cart: [] } },
    { new: true },
    // 모든게 완료되면 업데이트 된 User 컬렉션의 정보가
    // user안으로 들어가 있을 것이다.
    (err, user) => {
      if (err) return res.json({ success: false, err });

      // 2. Payment에다 자세한 결제 정보 저장하는 부분
      const payment = new Payment(transactionData);

      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        // 3. Product 컬렉션 안에 있는 sold 필드 정보 업데이트 시켜주기

        // 1) 상품 당 몇개의 quantity를 샀는지?

        let products = [];
        doc.product.forEach((item) => {
          products.push({ id: item.id, quantity: item.quantity });
        });

        // 여러 product를 넣으려면 for문을 돌려야 하는데,
        // 또 product마다 id가 달라서 이걸 구현하려면
        // 코드가 굉장히 복잡해진다.
        // 그래서 async를 통해 이를 해결!

        // eachSeries랑 mapSeries랑 거의 비슷하다.
        // 단지 콜백함수에 results객체가 전달되지 않을 뿐이다.
        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              {
                $inc: {
                  sold: item.quantity,
                },
              },
              { new: false },
              callback
            );
          },
          (err) => {
            if (err) return res.status(400).json({ success: false, err });
            res.status(200).json({
              success: true,
              cart: user.cart,
              cartDetail: [],
            });
          }
        );
      });
    }
  );
});

module.exports = router;
