import React, { useState } from "react";
import { Collapse, Checkbox } from "antd";

const { Panel } = Collapse;
function CheckBox(props) {
  const [Checked, setChecked] = useState([]);

  const handleToggle = (continent) => {
    //1. 누른 것의 index를 구하고
    const currentIndex = Checked.indexOf(continent);
    //indexOf() : 배열 안의 번지수를 알려주는 함수
    // 배열 안에 없는 값을 넣었을 시에 -1이 나온다.

    // 2. 사용자가 체크한 모든 Checkbox의 State에서
    const newChecked = [...Checked];

    // 3. 사용자가 이미 체크한 state에 없는 새로운 값이라면
    // 새로 배열에 넣어준다.
    if (currentIndex === -1) {
      // 5. newChcked에 넣어준다.
      newChecked.push(continent);
    }
    // 4. 근데 배열에 이미 있는 값이다? 그럼 이미 체크했다는거잖아.
    // 그럼 체크 해제한거니까 배열에서 없애준다는 의미잖아.
    else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    props.handleFilters(newChecked);
  };

  const renderCheckboxLists = () =>
    props.continents &&
    props.continents.map((continent, index) => (
      <React.Fragment key={index}>
        <Checkbox
          onChange={() => handleToggle(continent._id)}
          checked={Checked.indexOf(continent._id) === -1 ? false : true}
        >
          <span>{continent.name}</span>
        </Checkbox>
      </React.Fragment>
    ));

  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Continents" key="1">
          {renderCheckboxLists()}
        </Panel>
      </Collapse>
    </div>
  );
}

export default CheckBox;
