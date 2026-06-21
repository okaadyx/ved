import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Colors, Spacing } from "@/constants/theme";
import {
  useDocumentsQuery,
  useDeleteDocumentMutation,
  useUploadDocumentMutation,
} from "@/hooks/queries";

// Icon components built with native Views
const ChevronLeftIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.chevron, { borderColor: color }]} />
  </View>
);

const TrashIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.trashLid, { backgroundColor: color }]} />
    <View style={[styles.trashBody, { borderColor: color }]} />
  </View>
);

const DocumentPdfIcon = () => (
  <View style={styles.pdfIconContainer}>
    <View style={styles.pdfPageSheet}>
      <View style={styles.pdfPageFold} />
      <Text style={styles.pdfLabelText}>PDF</Text>
    </View>
  </View>
);

const CloudUploadIcon = ({ color }: { color: string }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.cloudBody, { borderColor: color }]} />
    <View style={[styles.uploadArrowLine, { backgroundColor: color }]} />
    <View style={[styles.uploadArrowHead, { borderColor: color }]} />
  </View>
);

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const navigation = useNavigation();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading, refetch, isFetching } = useDocumentsQuery();
  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: "application/pdf",
      } as any);

      await uploadMutation.mutateAsync(formData);
      Alert.alert("Success", `"${selectedFile.name}" has been successfully added to your knowledge base.`);
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Error uploading document:", err);
      const msg = err.response?.data?.error || err.message || "Failed to upload document.";
      Alert.alert("Upload Failed", msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (filename: string) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to remove "${filename}" from your knowledge base? This will delete all its vector embeddings and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(filename);
            } catch (err: any) {
              console.error("Error deleting document:", err);
              Alert.alert("Error", "Failed to delete document.");
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const topPadding = Math.max(insets.top, 12);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: topPadding }]}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.backgroundSelected }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.replace("/drawer")}
              style={[styles.headerButton, { backgroundColor: theme.backgroundElement }]}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Knowledge Base</Text>
          <View style={{ width: 38 }} />
        </View>

        <FlatList
          data={documents || []}
          keyExtractor={(item) => item.filename}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor="#7C5CFF"
              colors={["#7C5CFF"]}
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Upload Reference PDF</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Add custom documentation to train VED. Once uploaded, the agent will query it to answer your questions.
              </Text>

              {/* Upload Box */}
              <View
                style={[
                  styles.uploadBox,
                  {
                    borderColor: "rgba(124, 92, 255, 0.3)",
                    backgroundColor: theme.backgroundElement,
                  },
                ]}
              >
                {!selectedFile ? (
                  <TouchableOpacity
                    style={styles.pickerTrigger}
                    onPress={handlePickDocument}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerIconWrapper}>
                      <CloudUploadIcon color="#7C5CFF" />
                    </View>
                    <Text style={[styles.pickerTitle, { color: theme.text }]}>Select PDF file</Text>
                    <Text style={[styles.pickerSubtitle, { color: theme.textSecondary }]}>
                      Supported format: .pdf
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.selectedFileContainer}>
                    <View style={styles.selectedFileMeta}>
                      <DocumentPdfIcon />
                      <View style={styles.selectedFileDetails}>
                        <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                          {selectedFile.name}
                        </Text>
                        {selectedFile.size && (
                          <Text style={[styles.fileSize, { color: theme.textSecondary }]}>
                            {formatBytes(selectedFile.size)}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.cancelBtn, { borderColor: theme.backgroundSelected }]}
                        onPress={() => setSelectedFile(null)}
                        disabled={isUploading}
                      >
                        <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.uploadBtn, { backgroundColor: "#7C5CFF" }]}
                        onPress={handleUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.uploadBtnText}>Upload & Process</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 28, marginBottom: 12 }]}>
                Document Library
              </Text>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#7C5CFF" />
              </View>
            ) : (
              <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement }]}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No documents uploaded</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Upload reference materials to enhance AI search context.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.docCard,
                {
                  borderColor: "rgba(124, 92, 255, 0.12)",
                  backgroundColor: theme.backgroundElement,
                },
              ]}
            >
              <View style={styles.docInfo}>
                <DocumentPdfIcon />
                <View style={styles.docMeta}>
                  <Text style={[styles.docName, { color: theme.text }]} numberOfLines={1}>
                    {item.filename}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.docChunks, { color: theme.textSecondary }]}>
                      {item.chunksCount} vectors
                    </Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}
                onPress={() => handleDeleteDocument(item.filename)}
                disabled={deleteMutation.isPending}
              >
                <TrashIcon color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  uploadBox: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "stretch",
    justifyContent: "center",
    borderStyle: "dashed",
  },
  pickerTrigger: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  pickerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(124, 92, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  pickerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  selectedFileContainer: {
    width: "100%",
  },
  selectedFileMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedFileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  uploadBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  loaderContainer: {
    paddingVertical: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  docInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  docMeta: {
    marginLeft: 12,
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "700",
  },
  docChunks: {
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#10B981",
  },
  statusText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    marginLeft: 4,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Icon drawing styles
  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chevron: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginLeft: 3,
  },
  trashLid: {
    width: 10,
    height: 1.5,
    borderRadius: 0.5,
    marginBottom: 1.5,
  },
  trashBody: {
    width: 11,
    height: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5,
  },
  pdfIconContainer: {
    width: 38,
    height: 38,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  pdfPageSheet: {
    width: 16,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 2,
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 2,
  },
  pdfPageFold: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 5,
    height: 5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  pdfLabelText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#EF4444",
  },
  cloudBody: {
    width: 14,
    height: 9,
    borderWidth: 1.5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5,
    position: "absolute",
    bottom: 2,
  },
  uploadArrowLine: {
    width: 2,
    height: 9,
    position: "absolute",
    bottom: 5,
  },
  uploadArrowHead: {
    width: 6,
    height: 6,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    bottom: 8,
  },
});
