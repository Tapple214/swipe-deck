// App.js
import "./App.css";
import { useSwipe } from "./components/SwipeDeck";

export default function App() {
  const items = [
    { id: 1, name: "john" },
    { id: 2, name: "emma" },
    { id: 3, name: "michael" },
    { id: 4, name: "sophia" },
    { id: 5, name: "william" },
    { id: 6, name: "olivia" },
    { id: 7, name: "james" },
    { id: 8, name: "isabella" },
    { id: 9, name: "benjamin" },
    { id: 10, name: "mia" },
    { id: 11, name: "alexander" },
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
  } = useSwipe({ items });

  return (
    <div className="App">
      <div
        className={`card-container ${isLoaded ? "loaded" : ""}`}
        ref={swipeContainerRef}
      >
        <div className="cards">
          {noMoreCards ? (
            <p>No more cards</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`card ${removedCardIds.has(index) ? "removed" : ""}`}
                style={{
                  transform: index === 0 ? cardTransform : "",
                  zIndex: cardZIndex[index] || "auto",
                }}
                ref={(crd) => (allCardsRef.current[index] = crd)}
                data-index={index}
              >
                <p>{item.name}</p>
              </div>
            ))
          )}
        </div>
        <div className="button-container">
          <button onClick={() => setAction("dislike")} id="dislike">
            Dislike
          </button>
          <button onClick={() => setAction("want")} id="want">
            Want
          </button>
          <button onClick={() => setAction("like")} id="like">
            Like
          </button>
        </div>
      </div>
    </div>
  );
}
