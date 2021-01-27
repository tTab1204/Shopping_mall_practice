import React from "react";
import "./UserCardBlock.css";
import { Button } from "antd";

function UserCardBlock(props) {
  const showCartItems = () =>
    props.products &&
    props.products.map((product, i) => (
      <tr key={i}>
        <td>
          <img
            style={{ width: "70px" }}
            alt="product"
            src={`http://localhost:5000/${product.images[0]}`}
          />
        </td>

        <td>{product.quantity} EA</td>
        <td>$ {product.price}</td>
        <td>
          <Button onClick={() => props.removeItem(product._id)} >Remove</Button>
        </td>
      </tr>
    ));

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Product Image</th>
            <th>Product Quantity</th>
            <th>Product Price</th>
            <th>Remove from Cart</th>
          </tr>
        </thead>

        <tbody>{showCartItems()}</tbody>
      </table>
    </div>
  );
}

export default UserCardBlock;
