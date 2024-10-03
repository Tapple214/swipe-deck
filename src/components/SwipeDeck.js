import { useState, useRef, useEffect, useCallback } from "react";

export function useSwipe({ items }) {
  // NOTE: Cards are not necessarily removed from the original items array
  // A new set of listing ids of removed cards is just created so they don't
  // show up again until after the page is refresheds

  // REFERENCES --------------------------------------------------------------

  // Store a reference to the div DOM element that contains the cards
  const swipeContainerRef = useRef(null);
  // Store a reference to the card DOM element
  const allCardsRef = useRef([]);

  // STATE -------------------------------------------------------------------

  const [cardsInitialized, setCardsInitialized] = useState(false);
  // Action = like, dislike, or want
  const [action, setAction] = useState(null);
  // Check if there are no more items/cards to display
  const [noMoreCards, setNoMoreCards] = useState(false);
  const [removedCardIds, setRemovedCardIds] = useState(new Set());
  // Track if the container is loaded
  const [isLoaded, setIsLoaded] = useState(false);
  // State to trigger a rerender if needed
  const [triggerRerender, setTriggerRerender] = useState(false);

  // STYLING -----------------------------------------------------------------

  // CSS styling states
  const [cardTransform, setCardTransform] = useState("");
  const [cardZIndex, setCardZIndex] = useState({});

  // ACTION HANDLING ---------------------------------------------------------

  const handleAction = async (item, index) => {
    const moveOutWidth = document.body.clientWidth * 1.5;
    const moveOutHeight = document.body.clientHeight * 1.5;
    const direction = 0;

    if (action === "like") {
      direction = moveOutWidth;
    } else if (action === "dislike") {
      direction = -moveOutWidth;
    } else if (action === "want") {
      direction = -moveOutHeight;
    }
    const rotation = action === "like" ? 30 : -30;

    // Mark the card as "removed"
    setRemovedCardIds((prev) => new Set(prev).add(index));
    setCardTransform(`translate(${direction}px, 0px) rotate(${rotation}deg)`);

    try {
      await fetch(`/api/listing-feedback/${index}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: action }),
      });
    } catch (error) {
      console.error("Failed to send feedback");
    }

    // Add the card to the removed set and check if there are no more cards
    // Compare the set and ref to set "No more cards" if they match
    setRemovedCardIds((prev) => {
      const newSet = new Set(prev).add(index);
      if (newSet.size === allCardsRef.current.length) {
        setNoMoreCards(true);
      }
      return newSet;
    });

    // Reset action to prevent continuous updates
    setAction(null);
  };

  // Use useCallback to ensure handleSwipe is stable
  // To prevent unnecessary re-renders
  const handleSwipe = useCallback(async () => {
    // Check if there are no items
    if (!action || items.length === 0) return;

    // Find the first card that has not been removed
    const card = allCardsRef.current.find(
      (c) => c && !removedCardIds.has(c.dataset.index)
    );
    if (!card) return;

    const listing = items.find((items) => listing.id === card.dataset.index);

    if (listing) {
      await handleAction(card, listing);
    }
  }, [action, items]);

  // UseEffect 1: Handles swiping when cards are initialized and an action is set.
  useEffect(() => {
    if (cardsInitialized && action) {
      handleSwipe();
    }
  }, [cardsInitialized, action, handleSwipe]);

  // UseEffect 2: Reinitializes cards when items change or component re-renders.
  useEffect(() => {
    if (cardsInitialized) return;

    // Check if there are no items
    if (items?.length === 0) {
      setNoMoreCards(true);
      return;
    }

    // Check if allCardsRef.current is empty, trigger rerender
    if (!allCardsRef.current || allCardsRef.current.length === 0) {
      // Re-render because allCardsRef is empty
      setTriggerRerender((prev) => !prev);
      return;
    }

    // Filter out cards that have been removed
    const newCards = allCardsRef.current.filter(
      (card) => card && !removedCardIds.has(card.dataset.index)
    );

    // If no cards are left, mark noMoreCards as true
    if (newCards.length === 0) {
      setNoMoreCards(true);
      return;
    }

    // Set Z-index for each card to stack them correctly
    newCards.forEach((card, index) => {
      if (card) {
        setCardZIndex((prevZIndex) => ({
          ...prevZIndex,
          [card.dataset.index]: newCards.length - index,
        }));
      }
    });

    // Mark that the cards have been successfully loaded
    setIsLoaded(true);
    setCardsInitialized(true);
  }, [items, removedCardIds, triggerRerender]);

  // UseEffect 3: Ensures that allCardsRef.current.length is not empty
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
