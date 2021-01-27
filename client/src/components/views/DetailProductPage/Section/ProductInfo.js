import React from "react";
import { Descriptions, Button, Modal, Space } from "antd";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../../_actions/user_actions";
import { message } from "antd";

function ProductInfo(props) {
  const dispatch = useDispatch();

  const clickHandler = () => {
    //필요한 정보를 Cart 필드에다가 넣어 준다.
    dispatch(addToCart(props.detail._id)).then((response) => {
      console.log(response);
      const key = "updatable";
      message.loading({ content: "Loading...", key });
      // setTimeout: 시간을 주고 처리를 할 수 있게 한다.
      setTimeout(() => {
        message.success({
          content: "성공적으로 장바구니에 상품이 담겼습니다.",
          key,
          duration: 2,
        });
      }, 1000);
    });
  };

  return (
    <div>
      <Descriptions title="Product Info">
        <Descriptions.Item label="Price">
          {props.detail.price}
        </Descriptions.Item>
        <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
        <Descriptions.Item label="View">{props.detail.views}</Descriptions.Item>
        <Descriptions.Item label="Description">
          {props.detail.description}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <br />
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button size="large" shape="round" type="danger" onClick={clickHandler}>
          장바구니에 담기
        </Button>
      </div>
    </div>
  );
}

export default ProductInfo;
