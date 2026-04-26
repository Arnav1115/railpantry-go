import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:railpantry/providers/auth_provider.dart';
import 'package:railpantry/views/admin/admin_dashboard.dart';

class AdminLogin extends StatefulWidget {
  const AdminLogin({super.key});

  @override
  State<AdminLogin> createState() => _AdminLoginState();
}

class _AdminLoginState extends State<AdminLogin> {
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();

  void _handleLogin() {
    Provider.of<AuthProvider>(context, listen: false).loginAdmin(
      _idController.text.trim(),
      _passwordController.text.trim(),
    );
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const AdminDashboard()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE4DDD3),
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/abstract_background.png',
              fit: BoxFit.cover,
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.admin_panel_settings, size: 64, color: Color(0xFF00A19B)),
                    const SizedBox(height: 16),
                    Text(
                      'Admin Portal',
                      style: GoogleFonts.lora(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF2D2D2D),
                      ),
                    ),
                    const SizedBox(height: 48),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                        child: Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: const Color(0xFF00A19B).withOpacity(0.2), width: 1),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 30, offset: const Offset(0, 10)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('OPERATOR ID', style: TextStyle(fontSize: 12, color: const Color(0xFF2D2D2D).withOpacity(0.7), fontWeight: FontWeight.w600, letterSpacing: 1)),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _idController,
                                decoration: InputDecoration(
                                  hintText: 'Enter ID',
                                  filled: true,
                                  fillColor: Colors.white.withOpacity(0.5),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: const Color(0xFF00A19B).withOpacity(0.5), width: 1.5)),
                                ),
                              ),
                              const SizedBox(height: 24),
                              Text('PASSWORD', style: TextStyle(fontSize: 12, color: const Color(0xFF2D2D2D).withOpacity(0.7), fontWeight: FontWeight.w600, letterSpacing: 1)),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                decoration: InputDecoration(
                                  hintText: 'Enter password',
                                  filled: true,
                                  fillColor: Colors.white.withOpacity(0.5),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: const Color(0xFF00A19B).withOpacity(0.5), width: 1.5)),
                                ),
                              ),
                              const SizedBox(height: 32),
                              Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: _handleLogin,
                                  borderRadius: BorderRadius.circular(16),
                                  child: Ink(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00A19B),
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [BoxShadow(color: const Color(0xFF00A19B).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
                                    ),
                                    child: Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(vertical: 20),
                                      child: const Text('AUTHORIZE', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text('← Back to Selection', style: GoogleFonts.spaceMono(color: const Color(0xFF2D2D2D))),
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
