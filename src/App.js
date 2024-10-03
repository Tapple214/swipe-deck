import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import { useSwipe } from "./components/SwipeDeck";

export default function App() {
  // Swiping functionality
  // returned functions = useSwipe({ params })
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
    listings,
    sgId,
    router,
    toast,
    handleClose,
    handleShow,
    reset,
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
            <NoListings />
          ) : (
            
            <ListingCards
              listings={listings}
              removedCardIds={removedCardIds}
              allCardsRef={allCardsRef}
              cardTransform={cardTransform}
              cardZIndex={cardZIndex}
              sgId={sgId}
              width={dimensions.width}
              height={dimensions.height}
            />
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
