import { useState, useRef, useEffect, useCallback } from 'react'

export function useSwipe({
  listings,
  sgId,
  router,
  toast,
  handleClose,
  handleShow,
  reset,
}) {
  // Store a reference to the div DOM element that contains the cards
  const swipeContainerRef = useRef(null)
  // Store a reference to the card DOM element
  const allCardsRef = useRef([])

  const [cardsInitialized, setCardsInitialized] = useState(false)

  // Action = like, dislike, or want
  const [action, setAction] = useState(null)

  // Check if there are no more listings/cards to display
  const [noMoreCards, setNoMoreCards] = useState(false)

  // CSS styling states
  const [cardTransform, setCardTransform] = useState('')
  const [cardZIndex, setCardZIndex] = useState({})

  // NOTE: Cards are not necessarily removed from the original listing array
  // A new set of listing ids of removed cards is just created so they don't
  // show up again until after the page is refreshed
  // Track if a card is removed
  const [isRemoved, setIsRemoved] = useState(new Set()) // For like/dislike
  const [removedCardIds, setRemovedCardIds] = useState(new Set()) // For want

  // Track if the container is loaded
  const [isLoaded, setIsLoaded] = useState(false)

  // State to trigger a rerender if needed
  const [triggerRerender, setTriggerRerender] = useState(false)

  // Handle the action when a card is swiped
  const handleCardAction = async (card, listing) => {
    const listingId = listing.id
    const listingSgid = listing.user.sgId

    if (action === 'want') {
      await handleWantAction(card, listingId, listingSgid)
    } else {
      handleLikeDislikeAction(card, listingId)
    }

    // Reset action to prevent continuous updates
    setAction(null)
  }

  // Handle the "want" action
  const handleWantAction = async (card, listingId, listingSgid) => {
    // Check if the listing belongs to the current user
    if (sgId === listingSgid) {
      setCardTransform('')
      toast.setErrorMessage('Oops! This is your own listing')
      handleClose()
      setRemovedCardIds((prev) => new Set(prev).add(listingId)) // To enable styling for cards that are "removed"
      reset()
      return
    } else {
      try {
        const response = await fetch(`/api/chat/listing/${listingId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const chatInfo = await response.json()
          router.push(`/?chatId=${chatInfo.id}`)
        } else if (response.status === 404) {
          handleShow()
        }
      } catch (error) {
        console.error('Failed to fetch chat info')
      }
    }
  }

  // Handle the "like" or "dislike" action
  const handleLikeDislikeAction = async (card, listingId) => {
    const moveOutWidth = document.body.clientWidth * 1.5
    const direction = action === 'like' ? moveOutWidth : -moveOutWidth
    const rotation = action === 'like' ? 30 : -30

    // Mark the card as "removed"
    setIsRemoved((prev) => new Set(prev).add(listingId))
    setCardTransform(`translate(${direction}px, 0px) rotate(${rotation}deg)`)

    try {
      await fetch(`/api/listing-feedback/${listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: action }),
      })
    } catch (error) {
      console.error('Failed to send feedback')
    }

    // Add the card to the removed set and check if there are no more cards
    // Compare the set and ref to set "No more cards" if they match
    setRemovedCardIds((prev) => {
      const newSet = new Set(prev).add(listingId)
      if (newSet.size === allCardsRef.current.length) {
        setNoMoreCards(true)
      }
      return newSet
    })
  }

  // Use useCallback to ensure handleSwipe is stable
  // To prevent unnecessary re-renders
  const handleSwipe = useCallback(async () => {
    // Check if there are no listings
    if (!action || listings.length === 0) return

    // Find the first card that has not been removed
    const card = allCardsRef.current.find(
      (c) => c && !removedCardIds.has(c.dataset.listingId)
    )
    if (!card) return

    const listing = listings.find(
      (listing) => listing.id === card.dataset.listingId
    )

    if (listing) {
      await handleCardAction(card, listing)
    }
  }, [action, listings, sgId])

  // UseEffect 1: Handles swiping when cards are initialized and an action is set.
  useEffect(() => {
    if (cardsInitialized && action) {
      handleSwipe()
    }
  }, [cardsInitialized, action, handleSwipe])

  // UseEffect 2: Reinitializes cards when listings change or component re-renders.
  useEffect(() => {
    if (cardsInitialized) return

    // Check if there are no listings
    if (listings?.length === 0) {
      setNoMoreCards(true)
      return
    }

    // Check if allCardsRef.current is empty, trigger rerender
    if (!allCardsRef.current || allCardsRef.current.length === 0) {
      // Re-render because allCardsRef is empty
      setTriggerRerender((prev) => !prev)
      return
    }

    // Filter out cards that have been removed
    const newCards = allCardsRef.current.filter(
      (card) => card && !isRemoved.has(card.dataset.listingId)
    )

    // If no cards are left, mark noMoreCards as true
    if (newCards.length === 0) {
      setNoMoreCards(true)
      return
    }

    // Set Z-index for each card to stack them correctly
    newCards.forEach((card, index) => {
      if (card) {
        setCardZIndex((prevZIndex) => ({
          ...prevZIndex,
          [card.dataset.listingId]: newCards.length - index,
        }))
      }
    })

    // Mark that the cards have been successfully loaded
    setIsLoaded(true)
    setCardsInitialized(true)
  }, [listings, isRemoved, triggerRerender])

  // UseEffect 3: Ensures that allCardsRef.current.length is not empty
  useEffect(() => {
    if (!isLoaded && allCardsRef.current.length > 0) {
      setIsLoaded(true)
      setCardsInitialized(true)
    }
  }, [isLoaded, allCardsRef.current.length, listings])

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
  }
}
