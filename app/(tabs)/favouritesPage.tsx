import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { PostData } from "@/utils/postData";
import { SESSION_USER, SessionUser } from "@/utils/userData";
import { getBookmarkedPosts } from "@/api/postApi";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";

export default function FavoritesScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // Reload every time the tab gains focus, so a bookmark you just added
  // (or removed) on the detail screen shows up here straight away.
  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        const stored = await AsyncStorage.getItem(SESSION_USER);
        const name = stored ? (JSON.parse(stored) as SessionUser).name : "";
        setUserName(name);
        try {
          setPosts(await getBookmarkedPosts(name));
        } catch (error) {
          console.error("Failed to load favorites:", error);
        } finally {
          setLoading(false);
        }
      }
      load();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userName.trim()) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Sign in to see your favorites.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => <Spacer height={12} />}
        ListFooterComponent={() => <Spacer height={24} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No favorites yet.</Text>
            <Text style={styles.emptyHint}>
              Bookmark a post to see it here.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  list: { paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptyHint: { marginTop: 8, fontSize: 14, color: "gray" },
});
