import { Colors } from "@/constants/theme";
import {
  useChatsQuery,
  useDeleteChatMutation,
  useUserQuery,
} from "@/hooks/queries";
import { removeToken } from "@/utils/auth";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PlusIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.plusHorizontal, { backgroundColor: color }]} />
    <View style={[styles.plusVertical, { backgroundColor: color }]} />
  </View>
);

const ChatIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.chatBody, { borderColor: color }]}>
      <View style={[styles.chatNotch, { borderColor: color }]} />
    </View>
  </View>
);

const TrashIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.trashLid, { backgroundColor: color }]} />
    <View style={[styles.trashBody, { borderColor: color }]} />
  </View>
);

const LogoutIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.doorFrame, { borderColor: color }]} />
    <View style={styles.arrowRow}>
      <View style={[styles.arrowShaft, { backgroundColor: color }]} />
      <View style={[styles.arrowHead, { borderColor: color }]} />
    </View>
  </View>
);

const DatabaseIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.dbDisk, { borderColor: color }]} />
    <View style={[styles.dbDisk, { borderColor: color, marginTop: 2 }]} />
    <View style={[styles.dbDisk, { borderColor: color, marginTop: 2 }]} />
  </View>
);

export default function CustomDrawerContent(props: any) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const params = useGlobalSearchParams<{ chatId?: string }>();
  const activeChatId = params.chatId || null;

  const {
    data: chats,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useChatsQuery();

  const { data: user, isLoading: userLoading } = useUserQuery();
  const deleteChatMutation = useDeleteChatMutation();

  const handleNewChat = () => {
    router.replace({ pathname: "/drawer" as any, params: { chatId: "" } });
    props.navigation.closeDrawer();
  };

  const handleSelectChat = (chatId: string) => {
    router.replace({ pathname: "/drawer" as any, params: { chatId } });
    props.navigation.closeDrawer();
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChatMutation.mutate(chatId);
  };

  const handleLogout = async () => {
    await removeToken();
    router.replace("/auth/welcome" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.logoText, { color: theme.text }]}>
            VED
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.newChatButton,
            {
              borderColor: theme.backgroundSelected,
              backgroundColor: theme.backgroundElement,
            },
          ]}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <PlusIcon color={theme.text} />
          <Text style={[styles.newChatText, { color: theme.text }]}>
            New Chat
          </Text>
        </TouchableOpacity>

        {user && (
          <TouchableOpacity
            style={[
              styles.kbButton,
              pathname.includes("documents")
                ? {
                    backgroundColor: "rgba(124, 92, 255, 0.12)",
                    borderColor: "rgba(124, 92, 255, 0.35)",
                    borderWidth: 1,
                  }
                : {
                    borderColor: theme.backgroundSelected,
                    backgroundColor: theme.backgroundElement,
                  },
            ]}
            onPress={() => {
              router.replace("/drawer/documents" as any);
              props.navigation.closeDrawer();
            }}
            activeOpacity={0.8}
          >
            <DatabaseIcon color={pathname.includes("documents") ? "#7C5CFF" : theme.text} />
            <Text
              style={[
                styles.kbText,
                { color: pathname.includes("documents") ? theme.text : theme.textSecondary },
              ]}
            >
              Knowledge Base
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          Chat History
        </Text>
        {chatsLoading ? (
          <ActivityIndicator
            size="small"
            color="#7C5CFF"
            style={styles.loader}
          />
        ) : chats && chats.length > 0 ? (
          chats.map((chat) => {
            const isActive = activeChatId === chat.id;
            return (
              <View
                key={chat.id}
                style={[
                  styles.chatItemWrapper,
                  isActive && {
                    backgroundColor: "rgba(124, 92, 255, 0.12)",
                    borderColor: "rgba(124, 92, 255, 0.35)",
                    borderWidth: 1,
                  },
                  !isActive && {
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderColor: "transparent",
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.chatTitleButton}
                  onPress={() => handleSelectChat(chat.id)}
                  activeOpacity={0.7}
                >
                  <ChatIcon
                    color={isActive ? "#7C5CFF" : theme.textSecondary}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.chatTitle,
                      { color: isActive ? theme.text : theme.textSecondary },
                    ]}
                  >
                    {chat.title || "Untitled Chat"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteChat(chat.id)}
                  disabled={deleteChatMutation.isPending}
                  activeOpacity={0.6}
                >
                  <TrashIcon color="rgba(239, 68, 68, 0.7)" />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No past conversations
          </Text>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}
      >
        {userLoading ? (
          <ActivityIndicator size="small" color="#7C5CFF" />
        ) : user ? (
          <View style={styles.userSection}>
            <View style={styles.userMeta}>
              <View style={[styles.avatar, { backgroundColor: "#7C5CFF" }]}>
                <Text style={styles.avatarText}>
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text
                  style={[styles.userName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {user.name || "VED User"}
                </Text>
                <Text
                  style={[styles.userEmail, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {user.email}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.avatar,
                  {
                    borderRadius: 50,
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                  },
                ]}
                onPress={handleLogout}
              >
                <LogoutIcon color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.guestSection}>
            <Text style={[styles.guestText, { color: theme.textSecondary }]}>
              Not logged in
            </Text>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: "#7C5CFF" }]}
              onPress={() => router.replace("/auth/login" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  newChatText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 10,
    paddingLeft: 4,
  },
  chatItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    marginVertical: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chatTitleButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 24,
  },
  userSection: {
    flexDirection: "column",
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  guestSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guestText: {
    fontSize: 14,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  plusHorizontal: {
    width: 12,
    height: 2,
    borderRadius: 1,
    position: "absolute",
  },
  plusVertical: {
    width: 2,
    height: 12,
    borderRadius: 1,
    position: "absolute",
  },
  chatBody: {
    width: 14,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chatNotch: {
    position: "absolute",
    bottom: -3,
    left: 2,
    width: 3,
    height: 3,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    transform: [{ rotate: "45deg" }],
  },
  trashLid: {
    width: 10,
    height: 1.5,
    borderRadius: 0.5,
    marginBottom: 1,
  },
  trashBody: {
    width: 11,
    height: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5,
  },
  doorFrame: {
    width: 11,
    height: 13,
    borderWidth: 1.5,
    borderRightWidth: 0,
    position: "absolute",
    left: 2,
    borderTopLeftRadius: 1.5,
    borderBottomLeftRadius: 1.5,
  },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 2,
  },
  arrowShaft: {
    width: 7,
    height: 1.5,
  },
  arrowHead: {
    width: 4,
    height: 4,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    transform: [{ rotate: "45deg" }],
    marginLeft: -2.5,
  },
  kbButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  kbText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  dbDisk: {
    width: 13,
    height: 4,
    borderRadius: 1.5,
    borderWidth: 1.2,
  },
});
