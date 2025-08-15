import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ActiveSection = 'privacy' | 'terms' | 'about';

const renderPrivacyPolicy = () => (
  <View className="space-y-4">
    <View className="mb-4">
      <Text className="mb-2 text-xl font-bold text-gray-900">Privacy Policy</Text>
      {/* <Text className="text-sm text-gray-500">Last updated: December 2024</Text> */}
    </View>

    <View className="space-y-4">
      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">1. Information We Collect</Text>
        <Text className="leading-6 text-gray-600">
          We collect information you provide directly to us, such as when you create an account,
          mark attendance, or contact us for support. This includes:
        </Text>
        <View className="ml-4 mt-2 space-y-1">
          <Text className="text-gray-600">• Name and email address</Text>
          <Text className="text-gray-600">• Student/Lecturer identification</Text>
          <Text className="text-gray-600">• Course enrollment information</Text>
          <Text className="text-gray-600">• Location data (for attendance verification)</Text>
          <Text className="text-gray-600">• Device information and usage data</Text>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">
          2. How We Use Your Information
        </Text>
        <Text className="leading-6 text-gray-600">We use the information we collect to:</Text>
        <View className="ml-4 mt-2 space-y-1">
          <Text className="text-gray-600">
            • Provide and maintain our attendance tracking services
          </Text>
          <Text className="text-gray-600">• Verify attendance based on location</Text>
          <Text className="text-gray-600">• Send you technical notices and updates</Text>
          <Text className="text-gray-600">• Respond to your comments and questions</Text>
          <Text className="text-gray-600">• Improve and develop new features</Text>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">3. Location Data</Text>
        <Text className="leading-6 text-gray-600">
          We collect precise location data only when you mark attendance. This data is used solely
          to verify your presence in class and is not stored longer than necessary for attendance
          records. You can disable location services, but this may limit your ability to mark
          attendance.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">4. Data Security</Text>
        <Text className="leading-6 text-gray-600">
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">5. Data Sharing</Text>
        <Text className="leading-6 text-gray-600">
          We do not sell, trade, or rent your personal information to third parties. We may share
          your information only with your educational institution for attendance verification
          purposes.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">6. Your Rights</Text>
        <Text className="leading-6 text-gray-600">You have the right to:</Text>
        <View className="ml-4 mt-2 space-y-1">
          <Text className="text-gray-600">• Access your personal data</Text>
          <Text className="text-gray-600">• Correct inaccurate data</Text>
          <Text className="text-gray-600">• Request deletion of your data</Text>
          <Text className="text-gray-600">• Export your attendance records</Text>
          <Text className="text-gray-600">• Opt-out of non-essential communications</Text>
        </View>
      </View>
    </View>
  </View>
);

const renderTermsOfService = () => (
  <View className="space-y-4">
    <View className="mb-4">
      <Text className="mb-2 text-xl font-bold text-gray-900">Terms of Service</Text>
      {/* <Text className="text-sm text-gray-500">Effective Date: December 2024</Text> */}
    </View>

    <View className="space-y-4">
      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">1. Acceptance of Terms</Text>
        <Text className="leading-6 text-gray-600">
          By accessing and using this attendance tracking application, you accept and agree to be
          bound by the terms and provision of this agreement.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">2. Use License</Text>
        <Text className="leading-6 text-gray-600">
          Permission is granted to use this application for personal, educational, non-commercial
          use only. This license shall automatically terminate if you violate any of these
          restrictions.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">3. User Responsibilities</Text>
        <Text className="leading-6 text-gray-600">You agree to:</Text>
        <View className="ml-4 mt-2 space-y-1">
          <Text className="text-gray-600">• Provide accurate and complete information</Text>
          <Text className="text-gray-600">• Maintain the security of your account credentials</Text>
          <Text className="text-gray-600">• Not attempt to mark attendance fraudulently</Text>
          <Text className="text-gray-600">• Not interfere with the proper working of the app</Text>
          <Text className="text-gray-600">
            • Comply with your institution&apos;s attendance policies
          </Text>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">4. Prohibited Uses</Text>
        <Text className="leading-6 text-gray-600">You may not:</Text>
        <View className="ml-4 mt-2 space-y-1">
          <Text className="text-gray-600">• Share your account with others</Text>
          <Text className="text-gray-600">• Mark attendance for another person</Text>
          <Text className="text-gray-600">• Use location spoofing tools</Text>
          <Text className="text-gray-600">• Attempt to hack or reverse engineer the app</Text>
          <Text className="text-gray-600">• Use the app for any illegal purpose</Text>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">5. Academic Integrity</Text>
        <Text className="leading-6 text-gray-600">
          This application is designed to support academic integrity. Any attempt to circumvent
          attendance requirements or mark false attendance may result in academic disciplinary
          action by your institution.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">6. Limitation of Liability</Text>
        <Text className="leading-6 text-gray-600">
          The app is provided &quot;as is&quot; without warranties of any kind. We shall not be
          liable for any damages arising from the use or inability to use this application.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">7. Termination</Text>
        <Text className="leading-6 text-gray-600">
          We reserve the right to terminate or suspend your account immediately, without prior
          notice, for conduct that we believe violates these Terms of Service or is harmful to other
          users.
        </Text>
      </View>
    </View>
  </View>
);

const renderAbout = () => (
  <View className="space-y-4">
    <View className="mb-4">
      <Text className="mb-2 text-xl font-bold text-gray-900">About</Text>
      <Text className="text-sm text-gray-500">Version 1.0.0</Text>
    </View>

    <View className="mb-6 items-center">
      <View className="mb-4 h-24 w-24 items-center justify-center rounded-2xl bg-blue-100">
        <Ionicons name="school" size={48} color="#3b82f6" />
      </View>
      <Text className="text-2xl font-bold text-gray-900">Attendance Tracker</Text>
      <Text className="text-gray-600">Smart Attendance Management System</Text>
    </View>

    <View className="space-y-4">
      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">Our Mission</Text>
        <Text className="leading-6 text-gray-600">
          To modernize and simplify attendance tracking in educational institutions, making the
          process seamless for both students and lecturers while maintaining accuracy and academic
          integrity.
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">Features</Text>
        <View className="ml-4 mt-2 space-y-1">
          <Text className="text-gray-600">• Real-time attendance tracking</Text>
          <Text className="text-gray-600">• Location-based verification</Text>
          {/* <Text className="text-gray-600">• QR code scanning capability</Text> */}
          <Text className="text-gray-600">• Comprehensive attendance reports</Text>
          <Text className="text-gray-600">• Export functionality (CSV & PDF)</Text>
          <Text className="text-gray-600">• Multi-role support (Student/Lecturer)</Text>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">Technology</Text>
        <Text className="leading-6 text-gray-600">
          Built with React Native and Expo for cross-platform compatibility, ensuring a smooth
          experience on both iOS and Android devices.
        </Text>
      </View>

      {/* <View>
          <Text className="mb-2 text-lg font-semibold text-gray-900">Contact Information</Text>
          <View className="space-y-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleContactSupport}
              className="flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <Text className="ml-2 text-blue-600">support@yourapp.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenWebsite}
              className="flex-row items-center">
              <Ionicons name="globe-outline" size={20} color="#6b7280" />
              <Text className="ml-2 text-blue-600">www.yourwebsite.com</Text>
            </TouchableOpacity>
          </View>
        </View> */}

      <View>
        <Text className="mb-2 text-lg font-semibold text-gray-900">Credits</Text>
        <Text className="leading-6 text-gray-600">
          Developed with ❤️ by Your Team Name{'\n'}© 2024 All rights reserved
        </Text>
      </View>
    </View>
  </View>
);

const LegalNoticeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<ActiveSection>('privacy');

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
      <View className="bg-blue-600 px-4 pb-6 pt-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="rounded-full bg-white/20 p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Legal & Policies</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Tab Selector */}
      <View className="flex-row border-b border-gray-200 bg-white">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveSection('privacy')}
          className={`flex-1 border-b-2 py-4 ${
            activeSection === 'privacy' ? 'border-blue-500' : 'border-transparent'
          }`}>
          <Text
            className={`text-center font-medium ${
              activeSection === 'privacy' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            Privacy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveSection('terms')}
          className={`flex-1 border-b-2 py-4 ${
            activeSection === 'terms' ? 'border-blue-500' : 'border-transparent'
          }`}>
          <Text
            className={`text-center font-medium ${
              activeSection === 'terms' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            Terms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveSection('about')}
          className={`flex-1 border-b-2 py-4 ${
            activeSection === 'about' ? 'border-blue-500' : 'border-transparent'
          }`}>
          <Text
            className={`text-center font-medium ${
              activeSection === 'about' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            About
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
        {activeSection === 'privacy' && renderPrivacyPolicy()}
        {activeSection === 'terms' && renderTermsOfService()}
        {activeSection === 'about' && renderAbout()}
      </ScrollView>
    </View>
  );
};

export default LegalNoticeScreen;
