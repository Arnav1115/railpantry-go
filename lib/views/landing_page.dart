import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:railpantry/views/passenger/passenger_login.dart';
import 'package:railpantry/views/admin/admin_login.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE4DDD3),
      body: Stack(
        children: [
          // Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/images/train_interior_hero.png',
              fit: BoxFit.cover,
            ),
          ),
          // White overlay for airy feel
          Positioned.fill(
            child: Container(
              color: Colors.white.withOpacity(0.4),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'RailPantry',
                      style: TextStyle(
                        fontSize: 56,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF00A19B),
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Select Your Portal',
                      style: GoogleFonts.spaceMono(
                        fontSize: 16,
                        color: const Color(0xFF2D2D2D),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 64),
                    _buildPortalButton(
                      context,
                      'PASSENGER PORTAL',
                      'Order food directly to your seat',
                      Icons.airline_seat_recline_normal,
                      const PassengerLogin(),
                    ),
                    const SizedBox(height: 24),
                    _buildPortalButton(
                      context,
                      'ADMIN PORTAL',
                      'Manage pantry inventory and orders',
                      Icons.admin_panel_settings,
                      const AdminLogin(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPortalButton(BuildContext context, String title, String subtitle, IconData icon, Widget destination) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => destination),
              );
            },
            borderRadius: BorderRadius.circular(24),
            splashColor: const Color(0xFF00A19B).withOpacity(0.2),
            child: Ink(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.6),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF00A19B).withOpacity(0.2), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00A19B).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(icon, color: const Color(0xFF00A19B), size: 32),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: GoogleFonts.lora(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF2D2D2D),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            subtitle,
                            style: GoogleFonts.spaceMono(
                              fontSize: 12,
                              color: const Color(0xFF2D2D2D).withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Color(0xFF00A19B)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
