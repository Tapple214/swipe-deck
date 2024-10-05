import { useState, useRef, useEffect, useCallback } from "react";

export function useSwipe({ items }) {
  const swipeContainerRef = useRef(null);
  const allCardsRef = useRef([]);

  const [cardsInitialized, setCardsInitialized] = useState(false);
  const [action, setAction] = useState(null);
  const [noMoreCards, setNoMoreCards] = useState(false);
  const [removedCardIds, setRemovedCardIds] = useState(new Set());
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cardTransform, setCardTransform] = useState("");
  const [cardZIndex, setCardZIndex] = useState({});

  const handleAction = async (card, index) => {
    const moveOutWidth = document.body.clientWidth * 1.5;
    let direction = 0;

    if (action === "like") {
      direction = moveOutWidth;
      setCardTransform(`translate(${direction}px, 0) rotate(30deg)`);
    } else if (action === "dislike") {
      direction = -moveOutWidth;
      setCardTransform(`translate(${direction}px, 0) rotate(-30deg)`);
    } else if (action === "want") {
      direction = 0;
      setCardTransform(`translate(0, -${moveOutWidth}px)`);
    }

    // Mark the card as "removed"
    setRemovedCardIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === allCardsRef.current.length) {
        setNoMoreCards(true);
      }
      return newSet;
    });

    // Update active card index to the next card
    setActiveCardIndex((prevIndex) => {
      if (prevIndex + 1 < items.length) {
        return prevIndex + 1;
      }
      return prevIndex;
    });

    setAction(null);
  };

  const handleSwipe = useCallback(() => {
    if (!action || items.length === 0) return;

    const card = allCardsRef.current.find(
      (c) => c && !removedCardIds.has(c.dataset.index)
    );
    if (!card) return;

    const item = items[card.dataset.index];

    if (item) {
      handleAction(card, card.dataset.index);
    }
  }, [action, items, removedCardIds]);

  useEffect(() => {
    if (cardsInitialized && action) {
      handleSwipe();
    }
  }, [cardsInitialized, action, handleSwipe]);

  useEffect(() => {
    if (cardsInitialized) return;

    if (items.length === 0) {
      setNoMoreCards(true);
      return;
    }

    if (!allCardsRef.current || allCardsRef.current.length === 0) {
      return;
    }

    const newCards = allCardsRef.current.filter(
      (card) => card && !removedCardIds.has(card.dataset.index)
    );

    if (newCards.length === 0) {
      setNoMoreCards(true);
      return;
    }

    newCards.forEach((card, index) => {
      if (card) {
        setCardZIndex((prevZIndex) => ({
          ...prevZIndex,
          [card.dataset.index]: newCards.length - index,
        }));
      }
    });

    setIsLoaded(true);
    setCardsInitialized(true);
  }, [items, removedCardIds]);

  return {
    swipeContainerRef,
    allCardsRef,
    cardsInitialized,
    noMoreCards,
    removedCardIds,
    setAction,
    cardTransform,
    isLoaded,
    cardZIndex,
    activeCardIndex,
  };
}
