import React, { useState, useEffect } from "react";
import Axios from "axios";
import ProductImage from "./Section/ProductImage";
import ProductInfo from "./Section/ProductInfo";
import { Row, Col } from "antd";

function DetailProductPage(props) {
  const [DetailProduct, setDetailProduct] = useState({});

  const productId = props.match.params.productId;

  useEffect(() => {
    // 하나만 가져오니까 type=single이라고 쓸 수 있는거다.
    Axios.get(`/api/product/products_by_id?id=${productId}&type=single`)
      .then((response) => {
        console.log(response.data[0]);
        setDetailProduct(response.data[0]);
      })
      .catch((err) => alert(err));
  }, []);

  return (
    <div style={{ width: "100%", padding: "3rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>{DetailProduct.title}</h1>
      </div>
      <br />
      <Row gutter={[16, 16]}>
        <Col lg={12} sm={24}>
          {/* Product Image */}
          <ProductImage detail={DetailProduct} />
        </Col>
        <Col lg={12} sm={24}>
          {/* Product Info */}
          <ProductInfo detail={DetailProduct} />
        </Col>
      </Row>
    </div>
  );
}

export default DetailProductPage;
