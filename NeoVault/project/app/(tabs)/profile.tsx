import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Bell,
  ChevronRight,
  Moon,
  CircleHelp as HelpCircle,
  Shield,
  LogOut,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { useNotifications } from "@/context/notifications";
import { updateUserProfile } from "@/services/firebase";
import Button from "@/components/Button";
import EditProfileModal from "@/components/EditProfileModal";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, isDark, setTheme } = useTheme();
  const { isEnabled: notificationsEnabled, toggleNotifications } =
    useNotifications();
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditProfile = async (data: { displayName: string }) => {
    if (user) {
      await updateUserProfile(user.uid, data);
      setIsEditProfileVisible(false);
    }
  };

  const handleThemeChange = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const renderProfileHeader = () => (
    <View style={[styles.profileHeader, isDark && styles.darkCard]}>
      <View
        style={[styles.avatarContainer, isDark && styles.darkAvatarContainer]}
      >
        <User size={32} color={isDark ? Colors.primary[400] : Colors.white} />
      </View>
      <Text style={[styles.profileName, isDark && styles.darkText]}>
        {user?.email}
      </Text>
      <Text style={[styles.profileEmail, isDark && styles.darkSubtext]}>
        Member since {new Date().toLocaleDateString()}
      </Text>
      <Button
        title="Edit Profile"
        variant="outline"
        size="small"
        onPress={() => setIsEditProfileVisible(true)}
        style={styles.editButton}
      />
    </View>
  );

  const renderSectionTitle = (title: string) => (
    <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
      {title}
    </Text>
  );

  const renderSettingItem = ({
    icon,
    title,
    subtitle,
    rightComponent,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, isDark && styles.darkCard]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon, isDark && styles.darkSettingIcon]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, isDark && styles.darkText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, isDark && styles.darkSubtext]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (
        <ChevronRight
          size={20}
          color={isDark ? Colors.neutral[300] : Colors.neutral[400]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <ScrollView style={[styles.container, isDark && styles.darkBackground]}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, isDark && styles.darkText]}>
            Profile
          </Text>
        </View>

        {renderProfileHeader()}

        <View
          style={[styles.settingsSection, isDark && styles.darkSettingsSection]}
        >
          {renderSectionTitle("Preferences")}

          {renderSettingItem({
            icon: (
              <Bell
                size={20}
                color={isDark ? Colors.primary[400] : Colors.primary[600]}
              />
            ),
            title: "Notifications",
            subtitle: "Get alerts about your savings",
            rightComponent: (
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{
                  false: isDark ? Colors.neutral[700] : Colors.neutral[300],
                  true: Colors.primary[400],
                }}
                thumbColor={
                  notificationsEnabled
                    ? Colors.primary[600]
                    : isDark
                    ? Colors.neutral[500]
                    : Colors.white
                }
              />
            ),
          })}

          {renderSettingItem({
            icon: (
              <Moon
                size={20}
                color={isDark ? Colors.neutral[300] : Colors.neutral[700]}
              />
            ),
            title: "Dark Mode",
            subtitle: "Apply dark theme",
            rightComponent: (
              <Switch
                value={isDark}
                onValueChange={handleThemeChange}
                trackColor={{
                  false: isDark ? Colors.neutral[700] : Colors.neutral[300],
                  true: Colors.primary[400],
                }}
                thumbColor={isDark ? Colors.primary[600] : Colors.white}
              />
            ),
          })}
        </View>

        <View
          style={[styles.settingsSection, isDark && styles.darkSettingsSection]}
        >
          {renderSectionTitle("Support")}

          {renderSettingItem({
            icon: (
              <HelpCircle
                size={20}
                color={isDark ? Colors.secondary[300] : Colors.secondary[500]}
              />
            ),
            title: "Help Center",
            subtitle: "Get help with your account",
            onPress: () => console.log("Help center"),
          })}

          {renderSettingItem({
            icon: (
              <Shield
                size={20}
                color={isDark ? Colors.primary[400] : Colors.primary[800]}
              />
            ),
            title: "Privacy & Security",
            subtitle: "Manage your data and privacy",
            onPress: () => console.log("Privacy"),
          })}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isDark && styles.darkLogoutButton]}
          onPress={handleLogout}
        >
          <LogOut
            size={20}
            color={isDark ? Colors.error[400] : Colors.error[600]}
          />
          <Text style={[styles.logoutText, isDark && styles.darkLogoutText]}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, isDark && styles.darkSubtext]}>
          NeoVault v1.0.0
        </Text>
      </ScrollView>

      <EditProfileModal
        visible={isEditProfileVisible}
        onClose={() => setIsEditProfileVisible(false)}
        onSave={handleEditProfile}
        initialData={{
          displayName: user?.displayName || user?.email?.split("@")[0] || "",
        }}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
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
  header: {
    padding: 16,
    paddingTop: 24,
  },
  screenTitle: {
    ...Typography.h3,
    color: Colors.neutral[800],
  },
  profileHeader: {
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  darkAvatarContainer: {
    backgroundColor: Colors.primary[800],
  },
  profileName: {
    ...Typography.h5,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body2,
    color: Colors.neutral[500],
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
  },
  settingsSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 8,
  },
  darkSettingsSection: {
    backgroundColor: "transparent",
  },
  sectionTitle: {
    ...Typography.body2,
    fontFamily: "Poppins-Medium",
    color: Colors.neutral[600],
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  darkSettingIcon: {
    backgroundColor: Colors.neutral[700],
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body1,
    color: Colors.neutral[800],
  },
  settingSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.error[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error[100],
  },
  darkLogoutButton: {
    backgroundColor: Colors.error[900],
    borderColor: Colors.error[800],
  },
  logoutText: {
    ...Typography.body1,
    color: Colors.error[700],
    marginLeft: 8,
  },
  darkLogoutText: {
    color: Colors.error[400],
  },
  versionText: {
    ...Typography.caption,
    color: Colors.neutral[500],
    textAlign: "center",
    marginBottom: 32,
  },
});
