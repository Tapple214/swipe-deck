import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import { useSwipe } from "./components/SwipeDeck";

export default function App() {
  // Swiping functionality
  // returned functions = useSwipe({ params })

  const items = [
    { name: "john" },
    { name: "emma" },
    { name: "michael" },
    { name: "sophia" },
    { name: "william" },
    { name: "olivia" },
    { name: "james" },
    { name: "isabella" },
    { name: "benjamin" },
    { name: "mia" },
    { name: "alexander" },
  ];

  const {
    swipeContainerRef,
    allCardsRef,
    noMoreCards,
    removedCardIds,
    setAction,
    cardTransform,
    isLoaded,
    cardZIndex,
  } = useSwipe({
    items,
  });

  return (
    <div className="App">
      {/* Card */}
      <div
        className={`tinder ${isLoaded ? "loaded" : ""}`}
        ref={swipeContainerRef}
      >
        <div className="tinder--cards">
          {noMoreCards ? (
            <p>No more cards</p>
          ) : (
            <>
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`card ${
                    removedCardIds.has(index) ? "removed" : ""
                  }`}
                  style={{
                    transform:
                      cardTransform && removedCardIds.has(index)
                        ? cardTransform
                        : "",
                    zIndex: cardZIndex[index] || "auto",
                  }}
                  ref={(crd) => (allCardsRef.current[index] = crd)}
                  data-listing-id={index}
                >
                  <p>{item.name}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="tinder--buttons">
          <div>
            <button onClick={() => setAction("dislike")} id="dislike">
              <i className="bi bi-hand-thumbs-down-fill"></i>
            </button>

            <button onClick={() => setAction("want")} id="want">
              <i className="bi bi-bag-heart-fill"></i>
            </button>

            <button onClick={() => setAction("like")} id="like">
              <i className="bi bi-hand-thumbs-up-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
