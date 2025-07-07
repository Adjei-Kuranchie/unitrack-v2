# UniTrack 📚

A modern mobile application for university attendance management built with React Native and Expo. UniTrack streamlines the process of tracking student attendance, managing courses, and conducting sessions for both lecturers and students.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2051-blue.svg)

## ✨ Features

- **Authentication System**: Secure login and registration for students and lecturers
- **Course Management**: Add, view, and manage courses
- **Session Management**: Create and manage class sessions
- **Attendance Tracking**: Mark and track student attendance with location verification
- **Role-Based Access**: Different interfaces for students, lecturers, and admins
- **Real-time Updates**: Live session status and attendance data
- **Location Services**: GPS-based attendance verification
- **Responsive UI**: Modern, intuitive interface with smooth animations

## 🛠️ Tech Stack

### Frontend

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### State Management

![Zustand](https://img.shields.io/badge/Zustand-FF6B6B?style=for-the-badge&logo=zustand&logoColor=white)

### Storage

![AsyncStorage](https://img.shields.io/badge/AsyncStorage-61DAFB?style=for-the-badge&logo=react&logoColor=white)

### Navigation

![Expo Router](https://img.shields.io/badge/Expo_Router-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

### UI Components

![React Native Elements](https://img.shields.io/badge/React_Native_Elements-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Bottom Sheet](https://img.shields.io/badge/Bottom_Sheet-FF6B6B?style=for-the-badge&logo=react&logoColor=white)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn](https://yarnpkg.com/) package manager
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

For mobile development:

- [Expo Go](https://expo.dev/client) app on your mobile device
- Or [Android Studio](https://developer.android.com/studio) / [Xcode](https://developer.apple.com/xcode/) for emulators

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Adjei-Kuranchie/unitrack-v2.git
cd unitrack
```

### 2. Install dependencies

```bash
yarn install
# Or
yarn
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add your configuration:

```env
# No environment variables
API_BASE_URL in app.json {extra.API_BASE_URL}
```

### 4. Start the development server

```bash
yarn start
```

### 5. Run on your device/emulator

#### Option A: Using Expo Go (Recommended for development)

1. Install [Expo Go](https://expo.dev/client) on your mobile device
2. Scan the QR code displayed in your terminal or browser
3. The app will load on your device

#### Option B: Using iOS Simulator

```bash
yarn ios
```

#### Option C: Using Android Emulator

```bash
yarn android
```

### 6. Additional Scripts

```bash
# Run on web (Web support disabled: Can not run on web )
# yarn web

# Run linting
yarn lint

# Run TypeScript type checking
yarn type-check

# Build for production
yarn build

# Reset project cache
yarn reset-project
```

## 📱 App Structure

```
unitrack/
├── app/                    # App entry point and routing
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── Container.tsx
│   ├── StatCard.tsx
│   └── ...
├── lib/                    # Utility functions
│   └── utils.ts
├── store/                  # State management
│   ├── authStore.ts
│   └── apiStore.ts
├── types/                  # TypeScript type definitions
│   ├── auth.d.ts
│   └── app.d.ts
└── screens/                # App screens
    ├── (auth)/
    └── (tabs)/
```

## 🔐 Authentication

UniTrack supports multiple user roles:

- **Students**: Can view courses, join sessions, and mark attendance
- **Lecturers**: Can create courses, manage sessions, and track attendance
- **Admins**: Full system access and user management

## 🎨 UI Components

The app features a modern design with:

- **TailwindCSS** for consistent styling
- **Bottom Sheet Modals** for enhanced user interaction
- **Custom Components** for reusable UI elements
- **Material Icons** for consistent iconography

## 📊 State Management

UniTrack uses Zustand for state management with:

- **Authentication Store**: Manages user sessions and auth state
- **API Store**: Handles all API calls and data management
- **Persistent Storage**: Automatic state persistence with AsyncStorage

## 🔄 API Integration

The app integrates with a backend API for:

- User authentication and registration
- Course and session management
- Attendance tracking and reporting
- User profile management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- React Native and Expo teams for the amazing framework
- All contributors who helped build this project
- The open-source community for the tools and libraries used

---

**Made with ❤️ for the university community**
