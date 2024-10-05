import React from "react";
import { useSwipe } from "./components/SwipeDeck";
import "./App.css";

const SwipeableCards = ({ items }) => {
  const {
    swipeContainerRef,
    allCardsRef,
    noMoreCards,
    setAction,
    activeTransform,
    cardZIndex,
    activeCardIndex,
  } = useSwipe({ items });

  const handleLike = () => setAction("like");
  const handleDislike = () => setAction("dislike");
  const handleWant = () => setAction("want");

  console.log("activeCardIndex:", activeCardIndex);
  console.log(activeTransform);
  return (
    <div ref={swipeContainerRef} className="card-container">
      <div className="cards">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => (allCardsRef.current[index] = el)}
            data-index={index}
            className={`card ${activeCardIndex === index ? "active" : ""}`}
            style={{
              zIndex: cardZIndex[index] || 1,
              transform: activeCardIndex === index ? activeTransform : "none",
            }}
          >
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
      <div className="button-container">
        <button onClick={handleDislike}>Dislike</button>
        <button onClick={handleLike}>Like</button>
        <button onClick={handleWant}>Want</button>
      </div>
      {noMoreCards && <p>No more cards!</p>}
    </div>
  );
};

export default SwipeableCards;
