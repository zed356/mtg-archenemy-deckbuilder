import { defaultColors } from "@/constants/Colors";
import { View, Text, StyleSheet } from "react-native";
import { globalStyles } from "@/constants/styles";
import { Link } from "expo-router";
import CustomButton from "../button/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedDeck, useSavedDeckStore } from "@/store/store";
import { useEffect, useState } from "react";
import {
  loadDecksFromStorage,
  removeDeckFromStorage,
  updateDeckInStorage,
} from "@/helpers/savedDeckManager";
import { FontAwesome6 } from "@expo/vector-icons";
import AnimatedIcon from "../button/AnimatedIcon";
import { SAVED_DECKS_PER_PAGE } from "@/constants/values";
import DeckListModal from "@/modals/DeckListModal";
import ConfirmationModal from "@/modals/ConfirmationModal";
import Spacer from "../style-elements/Spacer";

const SavedDecks: React.FC = () => {
  const {
    savedDecksInState,
    loadDecksFromStorageIntoState,
    removeDeckFromState,
    updateDeckInState,
    clearDecks,
  } = useSavedDeckStore();
  const [deckListModalIsVisible, setDeckListModalIsVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<SavedDeck | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const maxPages = Math.ceil(savedDecksInState.length / SAVED_DECKS_PER_PAGE);

  // load decks from local storage if any exist
  useEffect(() => {
    const fetchCards = async () => {
      const decks = await loadDecksFromStorage();
      if (decks != null) {
        loadDecksFromStorageIntoState(decks);
      }
    };
    fetchCards();
  }, []);

  const handleClearDecks = () => {
    AsyncStorage.removeItem("saved-decks");
    clearDecks();
  };

  const handleNextPage = () => {
    if (currentPage < maxPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleDeckListModal = (deck: SavedDeck) => {
    setSelectedDeck(deck);
    setDeckListModalIsVisible((prev) => !prev);
  };

  const handleDeleteDeck = (deck: SavedDeck) => {
    removeDeckFromState(deck);
    removeDeckFromStorage(deck);
    setConfirmationModalVisible(false);
  };

  const handleUpdateDeck = (deck: SavedDeck, newDeckName?: string) => {
    updateDeckInState(deck, newDeckName);
    updateDeckInStorage(deck, newDeckName);
  };

  const deckContent =
    savedDecksInState.length > 0 ? (
      savedDecksInState.map((deck, index) => {
        if (
          index < currentPage * SAVED_DECKS_PER_PAGE &&
          index >= (currentPage - 1) * SAVED_DECKS_PER_PAGE
        ) {
          return (
            <View key={Math.random()} style={styles.deckContainer}>
              <DeckListModal
                modalVisible={deckListModalIsVisible}
                setVisible={() => setDeckListModalIsVisible(false)}
                deck={selectedDeck}
                updateDeck={handleUpdateDeck}
              />
              <CustomButton
                type="neutral"
                text={`${deck.deckName} : ${deck.cards.length}`}
                onPress={() => {
                  handleDeckListModal(deck);
                }}
              />
              <CustomButton
                type="negative"
                text="Delete"
                onPress={() => {
                  setConfirmationModalVisible(true);
                }}
              />
              <ConfirmationModal
                isVisible={confirmationModalVisible}
                onConfirm={() => handleDeleteDeck(deck)}
                onCancel={() => setConfirmationModalVisible(false)}
              />
            </View>
          );
        }
        return null;
      })
    ) : (
      <Link href="/(tabs)/deckbuilder">
        <Text style={[globalStyles.text, styles.emptyDeckText]}>Create a new deck</Text>
      </Link>
    );

  const paginationContent = (
    <View style={styles.paginationContainer}>
      <AnimatedIcon onPress={handlePreviousPage} visible={currentPage > 1}>
        <FontAwesome6 name="chevron-left" size={24} color={defaultColors.gold} />
      </AnimatedIcon>
      <Text style={[globalStyles.text, styles.emptyDeckText]}>
        {currentPage} / {maxPages}
      </Text>
      <AnimatedIcon onPress={handleNextPage} visible={currentPage < maxPages}>
        <FontAwesome6 name="chevron-right" size={24} color={defaultColors.gold} />
      </AnimatedIcon>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.allDecksContainer}>{deckContent}</View>
      {savedDecksInState.length > SAVED_DECKS_PER_PAGE && <View>{paginationContent}</View>}
      <Spacer height={50} />
      {savedDecksInState.length > 0 && (
        <CustomButton text="Clear decks" type="negative" onPress={handleClearDecks} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 70,
  },
  allDecksContainer: {
    width: "90%",
    borderColor: defaultColors.gold,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  deckContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginTop: 10,
  },
  emptyDeckText: {
    color: defaultColors.gold,
    fontSize: 25,
  },
});

export default SavedDecks;
