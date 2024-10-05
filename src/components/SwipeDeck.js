import { useState, useRef, useEffect, useCallback } from "react";

export function useSwipe({ items }) {
  const swipeContainerRef = useRef(null);
  const allCardsRef = useRef([]);

  const [cardsInitialized, setCardsInitialized] = useState(false);
  const [action, setAction] = useState(null);
  const [noMoreCards, setNoMoreCards] = useState(false);
  const [removedCardIds, setRemovedCardIds] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [triggerRerender, setTriggerRerender] = useState(false);

  const [cardTransform, setCardTransform] = useState("");
  const [cardZIndex, setCardZIndex] = useState({});

  const handleAction = async (card, index) => {
    const moveOutWidth = document.body.clientWidth * 1.5;
    const moveOutHeight = document.body.clientHeight * 1.5;
    let direction = 0;

    if (action === "like") {
      direction = moveOutWidth;
    } else if (action === "dislike") {
      direction = -moveOutWidth;
    } else if (action === "want") {
      direction = -moveOutHeight;
    }
    const rotation = action === "like" ? 30 : -30;

    setCardTransform(`translate(${direction}px, 0px) rotate(${rotation}deg)`);

    // Mark the card as "removed"
    setRemovedCardIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === allCardsRef.current.length) {
        setNoMoreCards(true);
      }
      return newSet;
    });

    console.log("Removed card IDs:", removedCardIds);
    setAction(null);
  };

  const handleSwipe = useCallback(async () => {
    if (!action || items.length === 0) return;

    const card = allCardsRef.current.find(
      (c) => c && !removedCardIds.has(c.dataset.index)
    );
    if (!card) return;

    const item = items[card.dataset.index];

    if (item) {
      await handleAction(card, card.dataset.index);
    }
  }, [action, items]);

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
      setTriggerRerender((prev) => !prev);
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
  }, [items, removedCardIds, triggerRerender]);

  useEffect(() => {
    if (!isLoaded && allCardsRef.current.length > 0) {
      setIsLoaded(true);
      setCardsInitialized(true);
    }
  }, [isLoaded, allCardsRef.current.length, items]);

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
  };
}
