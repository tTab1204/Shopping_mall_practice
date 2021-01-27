import React, { useEffect, useState } from "react";
import { FaCode } from "react-icons/fa";
import { continents, price } from "./Section/Datas";
import Axios from "axios";
import {
  Card,
  Avatar,
  Col,
  Typography,
  Row,
  message,
  Icon,
  Button,
} from "antd";
import ImageSlider from "../../utils/ImageSlider";
import CheckBox from "./Section/CheckBox";
import RadioBox from "./Section/RadioBox";
import SearchFeature from "./Section/SearchFeature";
const { Meta } = Card;

function LandingPage() {
  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  const [Limit, setLimit] = useState(8);
  const [ProductsArrayLength, setProductsArrayLength] = useState(8);
  const [Filters, setFilters] = useState({
    continents: [],
    price: [],
  });
  const [SearchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let body = {
      skip: Skip,
      limit: Limit,
    };
    showProducts(body);
  }, []);

  const showProducts = (body) => {
    Axios.post("/api/product/showProducts", body).then((response) => {
      if (response.data.success) {
        if (body.loadMore) {
          setProducts([...Products, ...response.data.products]);
        } else {
          setProducts(response.data.products);
        }

        // 한 화면에 나오는 데이터의 갯수를 저장한다!!
        setProductsArrayLength(response.data.productsArrayLength);
      } else {
        alert("상품 가져오기를 실패하였습니다.");
      }
    });
  };

  const renderCards = Products.map((product, index) => (
    <Col lg={6} md={8} xs={24} key={index}>
      <Card
        style={{ height: "270px" }}
        hoverable={true}
        cover={
          <a href={`http://localhost:3000/product/${product._id}`}>
            <ImageSlider images={product.images} />
          </a>
        }
      >
        <Meta title={product.title} description={`${product.price}`} />
      </Card>
    </Col>
  ));

  const onLoadMore = () => {
    let skip = Skip + Limit;

    let body = {
      skip: skip,
      limit: Limit,
      loadMore: true,
    };
    showProducts(body);
    setSkip(skip);
  };

  const showFilterResults = (filters) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: filters,
    };

    showProducts(body);
    setSkip(0);
  };

  const handlePrice = (value) => {
    const data = price;
    let array = [];

    for (let i in data) {
      if (data[i]._id === parseInt(value)) {
        array = data[i].array;
      }
    }
    return array;
  };

  const handleFilters = (filters, category) => {
    // 지금까지 사용자가 체크한 항목들을 Filters state에 있던걸
    // newFilters변수에 집어넣는다.
    const newFilters = { ...Filters };

    // 카테고리 선택
    // filters = CheckBox.js의 newChecked와 같다.
    newFilters[category] = filters;

    if (category === "price") {
      let priceValues = handlePrice(filters);
      newFilters[category] = priceValues;
    }

    showFilterResults(newFilters);
    setFilters(newFilters);
  };

  const updateSearchTerm = (newSearchTerm) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: Filters,
      searchTerm: newSearchTerm,
    };

    setSkip(0);
    setSearchTerm(newSearchTerm);
    showProducts(body);
  };

  return (
    <div style={{ width: "75%", margin: "3rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2>
          {" "}
          여행을 떠나요! <Icon type="rocket" />
        </h2>
      </div>

      {/* Filter */}
      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          {/* CheckBox */}
          <CheckBox
            continents={continents}
            handleFilters={(filters) => handleFilters(filters, "continents")}
          />
        </Col>
        <Col lg={12} xs={24}>
          {/* RadioBox */}
          <RadioBox
            price={price}
            handleFilters={(filters) => handleFilters(filters, "price")}
          />
        </Col>
      </Row>

      {/* Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1rem auto",
        }}
      >
        <SearchFeature refreshFunction={updateSearchTerm} />
      </div>

      {/* Loading...(대기화면) */}
      {Products.length === 0 ? (
        <div
          style={{
            display: "flex",
            height: "300px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>Loading...</h2>
        </div>
      ) : (
        //    Cards

        <Row gutter={[16, 16]}>{renderCards}</Row>
      )}
      <br />
      {ProductsArrayLength >= Limit && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={onLoadMore}>더 보기</Button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
