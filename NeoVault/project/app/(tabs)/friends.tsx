import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/config/firebase";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { User, FriendRequest, Friend } from "@/types";
import { UserPlus, Users, Clock, Check, X } from "lucide-react-native";
import Button from "@/components/Button";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/services/firebase";

export default function FriendsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<
    Array<{ user: User; friendId: string }>
  >([]);
  const [pendingRequests, setPendingRequests] = useState<
    Array<{ request: FriendRequest; user: User }>
  >([]);
  const [sentRequests, setSentRequests] = useState<
    Array<{ request: FriendRequest; email: string }>
  >([]);

  useEffect(() => {
    if (user) {
      loadFriendsAndRequests();
    }
  }, [user]);

  const loadFriendsAndRequests = async () => {
    try {
      setLoading(true);

      const friendsRef = ref(database, "friends");
      const friendsQuery = query(
        friendsRef,
        orderByChild("userId"),
        equalTo(user!.uid)
      );
      const friendsSnapshot = await get(friendsQuery);
      const friendsData = friendsSnapshot.val() || {};

      const friendsList = await Promise.all(
        Object.entries(friendsData).map(async ([id, friend]: [string, any]) => {
          const friendUserRef = ref(database, `users/${friend.friendId}`);
          const friendUserSnapshot = await get(friendUserRef);
          return {
            user: friendUserSnapshot.val(),
            friendId: friend.friendId,
          };
        })
      );
      setFriends(friendsList);

      const receivedRequestsRef = ref(database, "friendRequests");
      const receivedRequestsQuery = query(
        receivedRequestsRef,
        orderByChild("receiverEmail"),
        equalTo(user!.email)
      );
      const receivedRequestsSnapshot = await get(receivedRequestsQuery);
      const receivedRequestsData = receivedRequestsSnapshot.val() || {};

      const pendingRequestsList = await Promise.all(
        Object.entries(receivedRequestsData)
          .filter(([_, request]: [string, any]) => request.status === "pending")
          .map(async ([id, request]: [string, any]) => {
            const senderRef = ref(database, `users/${request.senderId}`);
            const senderSnapshot = await get(senderRef);
            return {
              request: { ...request, id },
              user: senderSnapshot.val(),
            };
          })
      );
      setPendingRequests(pendingRequestsList);

      const sentRequestsRef = ref(database, "friendRequests");
      const sentRequestsQuery = query(
        sentRequestsRef,
        orderByChild("senderId"),
        equalTo(user!.uid)
      );
      const sentRequestsSnapshot = await get(sentRequestsQuery);
      const sentRequestsData = sentRequestsSnapshot.val() || {};

      const sentRequestsList = Object.entries(sentRequestsData)
        .filter(([_, request]: [string, any]) => request.status === "pending")
        .map(([id, request]: [string, any]) => ({
          request: { ...request, id },
          email: request.receiverEmail,
        }));
      setSentRequests(sentRequestsList);
    } catch (error) {
      console.error("Error loading friends and requests:", error);
      Alert.alert("Error", "Failed to load friends and requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      Alert.alert("Error", "You cannot send a friend request to yourself");
      return;
    }

    try {
      setLoading(true);
      await sendFriendRequest(user!.uid, email.trim().toLowerCase());
      setEmail("");
      Alert.alert("Success", "Friend request sent successfully");
      loadFriendsAndRequests();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await acceptFriendRequest(requestId);
      loadFriendsAndRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await rejectFriendRequest(requestId);
      loadFriendsAndRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert("Error", "Failed to reject friend request");
    } finally {
      setLoading(false);
    }
  };

  const renderFriendItem = ({
    item,
  }: {
    item: { user: User; friendId: string };
  }) => (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <View
        style={[styles.avatarContainer, isDark && styles.darkAvatarContainer]}
      >
        <Users
          size={24}
          color={isDark ? Colors.primary[400] : Colors.primary[600]}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.name, isDark && styles.darkText]}>
          {item.user.displayName || item.user.email}
        </Text>
        <Text style={[styles.email, isDark && styles.darkSubtext]}>
          {item.user.email}
        </Text>
      </View>
    </View>
  );

  const renderPendingRequestItem = ({
    item,
  }: {
    item: { request: FriendRequest; user: User };
  }) => (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <View
        style={[styles.avatarContainer, isDark && styles.darkAvatarContainer]}
      >
        <Clock
          size={24}
          color={isDark ? Colors.warning[400] : Colors.warning[600]}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.name, isDark && styles.darkText]}>
          {item.user.displayName || item.user.email}
        </Text>
        <Text style={[styles.email, isDark && styles.darkSubtext]}>
          {item.user.email}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.request.id)}
        >
          <Check size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item.request.id)}
        >
          <X size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequestItem = ({
    item,
  }: {
    item: { request: FriendRequest; email: string };
  }) => (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <View
        style={[styles.avatarContainer, isDark && styles.darkAvatarContainer]}
      >
        <Clock
          size={24}
          color={isDark ? Colors.warning[400] : Colors.warning[600]}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.name, isDark && styles.darkText]}>
          Pending Request
        </Text>
        <Text style={[styles.email, isDark && styles.darkSubtext]}>
          {item.email}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBackground]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Friends</Text>
      </View>

      <View style={[styles.addFriendSection, isDark && styles.darkCard]}>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Enter friend's email"
          placeholderTextColor={
            isDark ? Colors.neutral[500] : Colors.neutral[400]
          }
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Button
          title="Send Request"
          onPress={handleSendRequest}
          loading={loading}
          style={styles.addButton}
        />
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Pending Requests
          </Text>
          <FlatList
            data={pendingRequests}
            renderItem={renderPendingRequestItem}
            keyExtractor={(item) => item.request.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {sentRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Sent Requests
          </Text>
          <FlatList
            data={sentRequests}
            renderItem={renderSentRequestItem}
            keyExtractor={(item) => item.request.id}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
          Your Friends
        </Text>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.friendId}
          refreshing={loading}
          onRefresh={loadFriendsAndRequests}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UserPlus
                size={48}
                color={isDark ? Colors.neutral[700] : Colors.neutral[300]}
              />
              <Text
                style={[styles.emptyStateText, isDark && styles.darkSubtext]}
              >
                Add friends to start sharing your savings journey
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  darkBackground: {
    backgroundColor: Colors.neutral[900],
  },
  darkCard: {
    backgroundColor: Colors.neutral[800],
  },
  darkText: {
    color: Colors.white,
  },
  darkSubtext: {
    color: Colors.neutral[400],
  },
  darkInput: {
    color: Colors.white,
    backgroundColor: Colors.neutral[700],
    borderColor: Colors.neutral[600],
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    ...Typography.h3,
    color: Colors.neutral[800],
  },
  addFriendSection: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    ...Typography.body1,
    color: Colors.neutral[800],
  },
  addButton: {
    minWidth: 120,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    ...Typography.h6,
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  darkAvatarContainer: {
    backgroundColor: Colors.neutral[700],
  },
  cardContent: {
    flex: 1,
  },
  name: {
    ...Typography.body1,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  email: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: Colors.success[500],
  },
  rejectButton: {
    backgroundColor: Colors.error[500],
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    ...Typography.body2,
    color: Colors.neutral[500],
    textAlign: "center",
    marginTop: 16,
  },
});
