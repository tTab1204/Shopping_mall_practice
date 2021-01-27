const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    writer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      maxlength: 50,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      default: [],
    },
    continents: {
      type: Number,
      default: 1,
    },
    sold: {
      type: Number,
      maxlength: 100,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 나는 키워드 검색 시 title과 description이 검색이 되게 하겠다.
productSchema.index(
  {
    title: "text",
    //description: "text",
  },
  {
    // weights: 검색의 중요도를 나타낸다
    // 여기서는 title을 description에 5배 더 우선권을 두고 검색한다.
    weights: {
      title: 5,
      //description: 1,
    },
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
