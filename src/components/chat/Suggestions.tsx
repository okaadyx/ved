import { Spacing } from "@/constants/theme";
import { Suggestion } from "@/types/chat";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SuggestionsProps {
  theme: any;
  pulseAnim: Animated.Value;
  onSelectSuggestion: (prompt: string) => void;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    title: "💡 Brainstorm ideas",
    subtitle: "Productivity app concepts",
    prompt: "Brainstorm 3 unique app ideas for a personal productivity tool.",
  },
  {
    title: "💻 Explain code",
    subtitle: "JavaScript closures",
    prompt: "Explain JavaScript closures with a clear code example.",
  },
  {
    title: "✉️ Draft email",
    subtitle: "Request project feedback",
    prompt: "Draft a polite email to a client requesting feedback on a project.",
  },
  {
    title: "🎨 UI Palettes",
    subtitle: "Sleek dark mode apps",
    prompt: "Suggest 3 premium color palettes for a sleek dark mode app.",
  },
];

export const Suggestions = ({ theme, pulseAnim, onSelectSuggestion }: SuggestionsProps) => {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        style={[
          styles.emptyAvatarGlow,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.emptyAvatar}>
          <Text style={{ fontSize: 44 }}>✨</Text>
        </View>
      </Animated.View>

      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Chat with Aether
      </Text>

      <Text
        style={[styles.emptySubtitleText, { color: theme.textSecondary }]}
      >
        Ask questions, debug code, draft essays, or design beautiful
        layouts in real-time.
      </Text>

      <View style={styles.suggestionsContainer}>
        {SUGGESTIONS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionCard,
              { backgroundColor: theme.backgroundElement },
            ]}
            activeOpacity={0.8}
            onPress={() => onSelectSuggestion(item.prompt)}
          >
            <Text
              style={[styles.suggestionTitle, { color: theme.text, fontWeight: "700" }]}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.suggestionSub, { color: theme.textSecondary }]}
            >
              {item.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
  emptyAvatarGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
    ...Platform.select({
      web: {
        boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)",
      },
    }),
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.two,
    fontSize: 28,
    fontWeight: "700",
  },
  emptySubtitleText: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "center",
    width: "100%",
  },
  suggestionCard: {
    width: Platform.OS === "web" ? "47%" : "46%",
    minWidth: 140,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.08)",
    ...Platform.select({
      web: {
        transition: "transform 0.2s ease, background-color 0.2s ease",
        cursor: "pointer",
        ":hover": {
          transform: "translateY(-2px)",
        },
      },
    }),
  },
  suggestionTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  suggestionSub: {
    fontSize: 11,
  },
});
