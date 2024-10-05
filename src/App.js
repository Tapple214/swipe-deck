import React from "react";
import SwipeableCards from "./main";

const App = () => {
  const items = [
    { id: 1, title: "Item 1", description: "Description for Item 1" },
    { id: 2, title: "Item 2", description: "Description for Item 2" },
    { id: 3, title: "Item 3", description: "Description for Item 3" },
    // Add more items as needed
  ];

  return (
    <div className="App">
      <SwipeableCards items={items} />
    </div>
  );
};

export default App;
