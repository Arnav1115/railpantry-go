import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/inventory_provider.dart';
import 'package:railpantry/providers/auth_provider.dart';
import 'package:railpantry/providers/admin_provider.dart';
import 'package:railpantry/views/landing_page.dart';
import 'package:railpantry/views/passenger/pantry_menu.dart';
import 'package:railpantry/views/admin/admin_dashboard.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => InventoryProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AdminProvider()),
      ],
      child: const RailPantryApp(),
    ),
  );
}

class RailPantryApp extends StatelessWidget {
  const RailPantryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RailPantry',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFE4DDD3),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF00A19B),
          secondary: Color(0xFF00A19B),
          surface: Color(0xFFE4DDD3),
          onSurface: Color(0xFF2D2D2D), // Deep charcoal text
          onPrimary: Colors.white,
        ),
        textTheme: GoogleFonts.loraTextTheme().copyWith(
          // Use Lora (Serif) for headings and general text, override specific ones with Mono later
          displayLarge: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
          displayMedium: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
          displaySmall: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
          headlineMedium: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
          titleLarge: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
          bodyLarge: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
          bodyMedium: GoogleFonts.lora(color: const Color(0xFF2D2D2D)),
        ),
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    
    if (!authProvider.isLoggedIn) {
      return const LandingPage();
    } else {
      if (authProvider.isAdmin) {
        return const AdminDashboard();
      } else {
        return const PantryMenu();
      }
    }
  }
}
