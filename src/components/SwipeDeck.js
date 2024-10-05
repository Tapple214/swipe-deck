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
  const [activeTransform, setActiveTransform] = useState("");
  const [cardZIndex, setCardZIndex] = useState({});

  const handleAction = (index) => {
    const moveOutWidth = document.body.clientWidth * 1.5;
    let direction = 0;

    if (action === "like") {
      direction = moveOutWidth;
      setActiveTransform(`translate(${direction}px, 0) rotate(30deg)`);
    } else if (action === "dislike") {
      direction = -moveOutWidth;
      setActiveTransform(`translate(${direction}px, 0) rotate(-30deg)`);
    } else if (action === "want") {
      direction = 0;
      setActiveTransform(`translate(0, -${moveOutWidth}px)`);
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

    // Update the active card index
    setActiveCardIndex(index);
    setAction(null); // Clear action
  };

  const handleSwipe = useCallback(() => {
    if (!action || items.length === 0) return;

    const card = allCardsRef.current.find(
      (c) => c && !removedCardIds.has(c.dataset.index)
    );
    if (!card) return;

    const itemIndex = card.dataset.index;
    handleAction(itemIndex);
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

  useEffect(() => {
    if (!action) {
      // Clear transform after the action is processed
      setActiveTransform("");
    }
  }, [action]);

  return {
    swipeContainerRef,
    allCardsRef,
    cardsInitialized,
    noMoreCards,
    removedCardIds,
    setAction,
    activeTransform,
    isLoaded,
    cardZIndex,
    activeCardIndex,
  };
}
