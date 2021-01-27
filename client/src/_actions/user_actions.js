import axios from "axios";
import {
  LOGIN_USER,
  REGISTER_USER,
  AUTH_USER,
  LOGOUT_USER,
  ADD_TO_CART,
  SHOW_CART_ITEMS,
  REMOVE_CART_ITEM,
  ON_SUCCESS_BUY,
} from "./types";
import { USER_SERVER } from "../components/Config.js";

export function registerUser(dataToSubmit) {
  const request = axios
    .post(`${USER_SERVER}/register`, dataToSubmit)
    .then((response) => response.data);

  return {
    type: REGISTER_USER,
    payload: request,
  };
}

export function loginUser(dataToSubmit) {
  const request = axios
    .post(`${USER_SERVER}/login`, dataToSubmit)
    .then((response) => response.data);

  return {
    type: LOGIN_USER,
    payload: request,
  };
}

export function auth() {
  const request = axios
    .get(`${USER_SERVER}/auth`)
    .then((response) => response.data);

  return {
    type: AUTH_USER,
    payload: request,
  };
}

export function logoutUser() {
  const request = axios
    .get(`${USER_SERVER}/logout`)
    .then((response) => response.data);

  return {
    type: LOGOUT_USER,
    payload: request,
  };
}

export function addToCart(id) {
  let body = {
    productId: id,
  };

  const request = axios
    .post(`${USER_SERVER}/addToCart`, body)
    .then((response) => response.data);

  return {
    type: ADD_TO_CART,
    payload: request,
  };
}

// 결론: 두 파라미터 모두 cartPage의  props.user.userData.cart
// 에서 가져왔기 때문에 둘이 같은거다. 근데 같은걸 어떻게 비교하냐?
// 그래서 get메소드를 이용해 쿼리로 데이터를 백엔드로 보냈다.
// 그래서 거기서 Product.find해서 찾은 결괏값의 id가
// =(response.data.productDetail.id)
// 원래 CartPage에서 가져온 props.user.userData.cart.id 와 같다면
// User Collection에서 가져온 cartItem.quantity랑
// response.data(productDetail)의 i번째 상품의 quantity랑
// 같다고 해주는거지. 그러면 원래 Product Collection에는
// quantity라는 컬럼이 없었잖아?
// 근데 cartItem.quantity가 있잖아. 그래서 그걸 같다고 해버리니까
// response.data[i].quantity도 같이 생겨버리는게 아닐까?
export function showCartItems(cartItems, userCart) {
  // 쿼리를 이용해 product Collection에 접근
  // 그렇지만 여러개는 어떻게 갖고오지? --> 답은 product.js에 적혀있음.
  const request = axios
    .get(`/api/product/products_by_id?id=${cartItems}&type=array`)
    .then((response) => {
      // 여기서 response는 Product 컬렉션(테이블)에서 가지고 온다.
      // response에는 ProductDetail 정보가 담겨있다.

      // 1. CartItem들에 해당되는 정보들을
      // 2. Product Collection에서 가져온 후에
      // 3. Quantity 정보를 넣어준다.
      userCart.forEach((cartItem) => {
        response.data.forEach((ProductDetail, i) => {
          if (cartItem.id === ProductDetail._id)
            response.data[i].quantity = cartItem.quantity;
        });
      });
      return response.data;
    });

  return {
    type: SHOW_CART_ITEMS,
    payload: request,
  };
}

export function removeCartItem(productId) {
  const request = axios
    .get(`/api/users/removeFromCart?id=${productId}&type=array`)
    .then((response) => {
      // productInfo, cart 정보를 조합해서 CartDetail을 만든다.
      response.data.cart.forEach((item) => {
        response.data.productInfo.forEach((product, i) => {
          if (item.id === product.id) {
            response.data.productInfo[i].quantity = item.quantity;
          }
        });
      });

      return response.data;
    });
  return {
    type: REMOVE_CART_ITEM,
    payload: request,
  };
}

export function onSuccessBuy(data) {
  const request = axios
    .post(`${USER_SERVER}/successBuy`, data)
    .then((response) => response.data);

  return {
    type: ON_SUCCESS_BUY,
    payload: request,
  };
}
