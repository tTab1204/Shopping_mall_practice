import React, { useEffect, useState } from "react";
import { Typography, Button, Form, message, Input, Icon } from "antd";
import FileUpload from "../../utils/FileUpload";
import Axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;

const Continents = [
  { key: 1, value: "Africa" },
  { key: 2, value: "Europe" },
  { key: 3, value: "Asia" },
  { key: 4, value: "North America" },
  { key: 5, value: "South America" },
  { key: 6, value: "Australia" },
  { key: 7, value: "Antarctica" },
];

function UploadproductPage(props) {
  const [TitleValue, setTitleValue] = useState("");
  const [DescriptionValue, setDescriptionValue] = useState("");
  const [PriceValue, setPriceValue] = useState(0);
  const [ContinentValue, setContinentValue] = useState(1);

  // 전체 이미지의 정보를 백엔드로 보내기 위해 부모 컴포넌트인
  // UploadProudctPage.js에도 useState사용
  const [Images, setImages] = useState([]);

  const onTitleChange = (e) => {
    setTitleValue(e.currentTarget.value);
  };
  const onDescriptionChange = (e) => {
    setDescriptionValue(e.currentTarget.value);
  };

  const onPriceChange = (e) => {
    setPriceValue(e.currentTarget.value);
  };

  const onContinentSelectChange = (e) => {
    setContinentValue(e.currentTarget.value);
  };

  const refreshImages = (updatedImages) => {
    setImages(updatedImages);
  };

  const onSubmit = () => {
    if (
      !TitleValue ||
      !DescriptionValue ||
      !PriceValue ||
      !ContinentValue ||
      !Images
    ) {
      return alert("빠진 항목이 있나 체크해주세요.");
    }

    const variables = {
      writer: localStorage.getItem("userId"),
      title: TitleValue,
      description: DescriptionValue,
      price: PriceValue,
      images: Images,
      continents: ContinentValue,
    };

    Axios.post("/api/product/uploadProduct", variables).then((response) => {
      if (response.data.success) {
        console.log(response.data);
        const key = "updatable";
        message.loading({ content: "Loading...", key });
        // setTimeout: 시간을 주고 처리를 할 수 있게 한다.
        setTimeout(() => {
          message.success({
            content: "성공적으로 업로드를 했습니다.",
            key,
            duration: 2,
          });
          props.history.push("/");
        }, 2000);
      } else {
        alert("상품을 업로드하지 못했습니다.");
      }
    });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Title level={2}>Upload Travel Product</Title>
      </div>

      <Form onSubmit={onSubmit}>
        {/* Dropzone */}

        <FileUpload refreshFunction={refreshImages} />

        <br />
        <br />
        <label>Title</label>
        <Input onChange={onTitleChange} value={TitleValue} />
        <br />
        <br />
        <label>Description</label>
        <TextArea onChange={onDescriptionChange} value={DescriptionValue} />

        <br />
        <br />

        <label>Price($)</label>
        <Input onChange={onPriceChange} value={PriceValue} type="number" />

        <br />
        <br />

        <select onChange={onContinentSelectChange}>
          {Continents.map((continents) => (
            <option key={continents.key} value={continents.key}>
              {continents.value}
            </option>
          ))}
        </select>

        <br />
        <br />

        <Button onClick={onSubmit}>Submit</Button>
      </Form>
    </div>
  );
}

export default UploadproductPage;
