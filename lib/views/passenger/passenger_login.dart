import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/auth_provider.dart';
import 'package:railpantry/views/passenger/pantry_menu.dart';

class PassengerLogin extends StatefulWidget {
  const PassengerLogin({super.key});

  @override
  State<PassengerLogin> createState() => _PassengerLoginState();
}

class _PassengerLoginState extends State<PassengerLogin> {
  final _pnrController = TextEditingController();
  final _mobileController = TextEditingController();
  bool _isConsented = true;
  String? _error;

  void _handleLogin() {
    final pnr = _pnrController.text.trim();
    final mobile = _mobileController.text.trim();
    
    if (Provider.of<AuthProvider>(context, listen: false).loginPassenger(pnr, mobile: mobile)) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const PantryMenu()),
      );
    } else {
      setState(() {
        _error = 'Please enter a valid 10-digit PNR number.';
      });
    }
  }

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
          // Subtle white overlay for bright airy feel
          Positioned.fill(
            child: Container(
              color: Colors.white.withOpacity(0.3),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Elevated Hero Logo
                    const Text(
                      'RailPantry',
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF00A19B),
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Silent Food Ordering to your Seat',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFF2D2D2D),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 48),
                    // Soft Glassmorphism Login Card
                    ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                        child: Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: const Color(0xFF00A19B).withOpacity(0.2),
                              width: 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 30,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ENTER 10-DIGIT PNR',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: const Color(0xFF2D2D2D).withOpacity(0.7),
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _pnrController,
                                keyboardType: TextInputType.number,
                                maxLength: 10,
                                decoration: InputDecoration(
                                  hintText: 'e.g. 1234567890',
                                  hintStyle: TextStyle(color: Colors.black.withOpacity(0.3)),
                                  counterText: '',
                                  errorText: _error,
                                  filled: true,
                                  fillColor: Colors.white.withOpacity(0.5),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide.none,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: const Color(0xFF00A19B).withOpacity(0.5), width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),
                              Text(
                                'MOBILE NUMBER (OPTIONAL)',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: const Color(0xFF2D2D2D).withOpacity(0.7),
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _mobileController,
                                keyboardType: TextInputType.phone,
                                decoration: InputDecoration(
                                  hintText: '+91 For delivery updates',
                                  hintStyle: TextStyle(color: Colors.black.withOpacity(0.3)),
                                  filled: true,
                                  fillColor: Colors.white.withOpacity(0.5),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide.none,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: const Color(0xFF00A19B).withOpacity(0.5), width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: Checkbox(
                                      value: _isConsented,
                                      onChanged: (v) => setState(() => _isConsented = v ?? false),
                                      activeColor: const Color(0xFF00A19B),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'I consent to fetching my journey details via IRCTC to enable seat delivery.',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: const Color(0xFF2D2D2D).withOpacity(0.7),
                                        height: 1.4,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 32),
                              // Fluid Button
                              Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: _handleLogin,
                                  borderRadius: BorderRadius.circular(16),
                                  splashColor: Colors.white.withOpacity(0.2),
                                  child: Ink(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00A19B),
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF00A19B).withOpacity(0.3),
                                          blurRadius: 15,
                                          offset: const Offset(0, 8),
                                        ),
                                      ],
                                    ),
                                    child: Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(vertical: 20),
                                      child: const Text(
                                        'ENTER CABIN',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 2,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton(
                          onPressed: () {},
                          child: const Text('Need help?', style: TextStyle(color: Color(0xFF2D2D2D))),
                        ),
                        const Text('•', style: TextStyle(color: Color(0xFF2D2D2D))),
                        TextButton(
                          onPressed: () {},
                          child: const Text('Privacy', style: TextStyle(color: Color(0xFF2D2D2D))),
                        ),
                      ],
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
}
